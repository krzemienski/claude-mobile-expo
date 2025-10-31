import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import simpleGit, { SimpleGit } from 'simple-git';
import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

/**
 * Tool execution result
 */
interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
}

/**
 * ToolExecutor handles execution of Claude Code tools
 * Implements file operations, command execution, and git operations
 * Security: All operations are scoped to the project directory
 */
export class ToolExecutor {
  private readonly maxFileSize: number;
  private readonly allowedFileTypes: Set<string>;
  private readonly commandTimeout: number;

  constructor() {
    // Configuration
    this.maxFileSize = 10 * 1024 * 1024; // 10MB max file size
    this.commandTimeout = 30000; // 30 seconds

    // Parse allowed file types from env
    const allowedTypes = process.env.ALLOWED_FILE_TYPES || 
      '.ts,.tsx,.js,.jsx,.json,.md,.txt,.css,.html,.yml,.yaml';
    this.allowedFileTypes = new Set(allowedTypes.split(',').map(t => t.trim()));

    logger.info(`Tool executor initialized with ${this.allowedFileTypes.size} allowed file types`);
  }

  /**
   * Get tool definitions for Claude API
   */
  getTools(): Anthropic.Tool[] {
    return [
      {
        name: 'read_file',
        description: 'Read the contents of a file from the project directory. Returns file content as a string.',
        input_schema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file relative to project root (e.g., "src/App.tsx")',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'write_file',
        description: 'Write content to a file in the project directory. Creates parent directories if needed. Overwrites existing files.',
        input_schema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file relative to project root (e.g., "src/components/Button.tsx")',
            },
            content: {
              type: 'string',
              description: 'Content to write to the file',
            },
          },
          required: ['path', 'content'],
        },
      },
      {
        name: 'list_files',
        description: 'List files in a directory or search for files matching a pattern using glob syntax. Returns array of file paths.',
        input_schema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Directory path relative to project root (e.g., "src/components")',
            },
            pattern: {
              type: 'string',
              description: 'Optional glob pattern to filter files (e.g., "*.tsx" or "**/*.test.ts")',
            },
            recursive: {
              type: 'boolean',
              description: 'Whether to list files recursively (default: false)',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'search_files',
        description: 'Search for text pattern across files using grep-like functionality. Returns matches with file paths and line numbers.',
        input_schema: {
          type: 'object',
          properties: {
            pattern: {
              type: 'string',
              description: 'Text pattern to search for (supports basic regex)',
            },
            path: {
              type: 'string',
              description: 'Directory path to search in (default: project root)',
            },
            filePattern: {
              type: 'string',
              description: 'Glob pattern to filter files to search (e.g., "*.tsx")',
            },
          },
          required: ['pattern'],
        },
      },
      {
        name: 'execute_command',
        description: 'Execute a shell command in the project directory. Use with caution. Returns stdout/stderr.',
        input_schema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'Shell command to execute (e.g., "npm install", "npm test")',
            },
          },
          required: ['command'],
        },
      },
      {
        name: 'git_status',
        description: 'Get current git status including modified, added, and deleted files.',
        input_schema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'git_diff',
        description: 'Get git diff for staged or unstaged changes. Returns unified diff format.',
        input_schema: {
          type: 'object',
          properties: {
            staged: {
              type: 'boolean',
              description: 'Show diff for staged changes (default: false shows unstaged)',
            },
            file: {
              type: 'string',
              description: 'Optional file path to show diff for specific file',
            },
          },
        },
      },
      {
        name: 'git_add',
        description: 'Stage files for commit. Can add specific files or all changes.',
        input_schema: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of file paths to stage (use ["."] to stage all)',
            },
          },
          required: ['files'],
        },
      },
      {
        name: 'git_commit',
        description: 'Create a git commit with staged changes.',
        input_schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Commit message',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'git_log',
        description: 'Get recent git commit history with details.',
        input_schema: {
          type: 'object',
          properties: {
            count: {
              type: 'number',
              description: 'Number of recent commits to show (default: 10)',
            },
          },
        },
      },
    ];
  }

  /**
   * Execute a tool and return the result
   */
  async execute(toolName: string, toolInput: any, projectPath: string): Promise<string> {
    logger.info(`Executing tool: ${toolName} in project: ${projectPath}`);

    try {
      // Validate project path
      await this.validateProjectPath(projectPath);

      // Route to appropriate handler
      switch (toolName) {
        case 'read_file':
          return await this.readFile(projectPath, toolInput.path);

        case 'write_file':
          return await this.writeFile(projectPath, toolInput.path, toolInput.content);

        case 'list_files':
          return await this.listFiles(
            projectPath,
            toolInput.path,
            toolInput.pattern,
            toolInput.recursive
          );

        case 'search_files':
          return await this.searchFiles(
            projectPath,
            toolInput.pattern,
            toolInput.path,
            toolInput.filePattern
          );

        case 'execute_command':
          return await this.executeCommand(projectPath, toolInput.command);

        case 'git_status':
          return await this.gitStatus(projectPath);

        case 'git_diff':
          return await this.gitDiff(projectPath, toolInput.staged, toolInput.file);

        case 'git_add':
          return await this.gitAdd(projectPath, toolInput.files);

        case 'git_commit':
          return await this.gitCommit(projectPath, toolInput.message);

        case 'git_log':
          return await this.gitLog(projectPath, toolInput.count);

        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error: any) {
      logger.error(`Tool execution failed: ${toolName}`, error);
      return `Error executing ${toolName}: ${error.message}`;
    }
  }

  /**
   * Validate and normalize project path
   */
  private async validateProjectPath(projectPath: string): Promise<void> {
    try {
      const stats = await fs.stat(projectPath);
      if (!stats.isDirectory()) {
        throw new Error('Project path must be a directory');
      }
    } catch (error) {
      throw new Error(`Invalid project path: ${projectPath}`);
    }
  }

  /**
   * Resolve and validate file path
   */
  private resolvePath(projectPath: string, filePath: string): string {
    const resolved = path.resolve(projectPath, filePath);

    // Security: Ensure path is within project directory
    if (!resolved.startsWith(projectPath)) {
      throw new Error('Path traversal detected - access denied');
    }

    return resolved;
  }

  /**
   * Read file contents
   */
  private async readFile(projectPath: string, filePath: string): Promise<string> {
    const fullPath = this.resolvePath(projectPath, filePath);

    // Check file size
    const stats = await fs.stat(fullPath);
    if (stats.size > this.maxFileSize) {
      throw new Error(`File too large: ${stats.size} bytes (max: ${this.maxFileSize})`);
    }

    const content = await fs.readFile(fullPath, 'utf-8');
    return content;
  }

  /**
   * Write file contents
   */
  private async writeFile(
    projectPath: string,
    filePath: string,
    content: string
  ): Promise<string> {
    const fullPath = this.resolvePath(projectPath, filePath);

    // Validate file type
    const ext = path.extname(filePath);
    if (!this.allowedFileTypes.has(ext)) {
      throw new Error(`File type not allowed: ${ext}`);
    }

    // Create parent directories
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    // Write file
    await fs.writeFile(fullPath, content, 'utf-8');

    return `Successfully wrote ${content.length} bytes to ${filePath}`;
  }

  /**
   * List files in directory
   */
  private async listFiles(
    projectPath: string,
    dirPath: string,
    pattern?: string,
    recursive: boolean = false
  ): Promise<string> {
    const fullPath = this.resolvePath(projectPath, dirPath);

    // Build glob pattern
    const globPattern = pattern || '*';
    const searchPattern = recursive ? `**/${globPattern}` : globPattern;

    // Find files
    const files = await glob(searchPattern, {
      cwd: fullPath,
      nodir: true,
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
    });

    return JSON.stringify(files, null, 2);
  }

  /**
   * Search for text in files
   */
  private async searchFiles(
    projectPath: string,
    searchPattern: string,
    searchPath: string = '.',
    filePattern: string = '**/*'
  ): Promise<string> {
    const fullPath = this.resolvePath(projectPath, searchPath);

    // Find matching files
    const files = await glob(filePattern, {
      cwd: fullPath,
      nodir: true,
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
    });

    // Search each file
    const results: Array<{ file: string; line: number; text: string }> = [];
    const regex = new RegExp(searchPattern, 'gi');

    for (const file of files) {
      try {
        const filePath = path.join(fullPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          if (regex.test(line)) {
            results.push({
              file,
              line: index + 1,
              text: line.trim(),
            });
          }
        });
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }

    return JSON.stringify(results, null, 2);
  }

  /**
   * Execute shell command
   */
  private async executeCommand(projectPath: string, command: string): Promise<string> {
    // Security: Block dangerous commands
    const dangerousPatterns = [
      /rm\s+-rf/i,
      />\s*\/dev\//i,
      /sudo/i,
      /su\s/i,
      /chmod/i,
      /chown/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(command)) {
        throw new Error('Command blocked for security reasons');
      }
    }

    const { stdout, stderr } = await execAsync(command, {
      cwd: projectPath,
      timeout: this.commandTimeout,
      maxBuffer: 1024 * 1024, // 1MB
    });

    return stdout || stderr || 'Command executed successfully (no output)';
  }

  /**
   * Get git status
   */
  private async gitStatus(projectPath: string): Promise<string> {
    const git: SimpleGit = simpleGit(projectPath);
    const status = await git.status();

    return JSON.stringify(
      {
        branch: status.current,
        tracking: status.tracking,
        ahead: status.ahead,
        behind: status.behind,
        modified: status.modified,
        created: status.created,
        deleted: status.deleted,
        renamed: status.renamed,
        staged: status.staged,
        conflicted: status.conflicted,
      },
      null,
      2
    );
  }

  /**
   * Get git diff
   */
  private async gitDiff(
    projectPath: string,
    staged: boolean = false,
    file?: string
  ): Promise<string> {
    const git: SimpleGit = simpleGit(projectPath);

    const args = staged ? ['--cached'] : [];
    if (file) {
      args.push('--', file);
    }

    const diff = await git.diff(args);
    return diff || 'No changes';
  }

  /**
   * Stage files for commit
   */
  private async gitAdd(projectPath: string, files: string[]): Promise<string> {
    const git: SimpleGit = simpleGit(projectPath);
    await git.add(files);

    return `Staged ${files.length} file(s): ${files.join(', ')}`;
  }

  /**
   * Create git commit
   */
  private async gitCommit(projectPath: string, message: string): Promise<string> {
    const git: SimpleGit = simpleGit(projectPath);
    const result = await git.commit(message);

    return `Committed: ${result.commit}\nSummary: ${result.summary.changes} changes, ${result.summary.insertions} insertions, ${result.summary.deletions} deletions`;
  }

  /**
   * Get git log
   */
  private async gitLog(projectPath: string, count: number = 10): Promise<string> {
    const git: SimpleGit = simpleGit(projectPath);
    const log = await git.log({ maxCount: count });

    const commits = log.all.map((commit) => ({
      hash: commit.hash.substring(0, 7),
      date: commit.date,
      message: commit.message,
      author: commit.author_name,
    }));

    return JSON.stringify(commits, null, 2);
  }
}
