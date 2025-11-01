/**
 * Backend API Response Types
 * Type-safe interfaces for all backend v2.0 API responses
 */

// ============================================
// PAGINATION
// ============================================

export interface PaginationMeta {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ============================================
// SESSIONS API
// ============================================

export interface BackendSession {
  id: string;
  project_id: string;
  title: string;
  model: string;
  system_prompt: string | null;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  is_active: boolean;
  total_tokens: number;
  total_cost: number;
  message_count: number;
}

export type SessionsResponse = PaginatedResponse<BackendSession>;

// ============================================
// PROJECTS API
// ============================================

export interface BackendProject {
  id: string;
  name: string;
  description: string | null;
  path: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export type ProjectsResponse = PaginatedResponse<BackendProject>;

// ============================================
// FILES API
// ============================================

export interface BackendFile {
  name: string;
  path: string;
  size: number;
  modified: string;
  type: 'file' | 'directory';
  permissions: string | null;
}

export type FilesListResponse = BackendFile[];

export interface FileReadResponse {
  path: string;
  content: string;
  size: number;
  encoding: string;
}

export interface FileWriteResponse {
  path: string;
  size: number;
  created: boolean;
}

// ============================================
// GIT API
// ============================================

export interface GitStatusResponse {
  current_branch: string;
  modified: string[];
  staged: string[];
  untracked: string[];
  conflicted: string[];
  has_commits: boolean;
  is_detached: boolean;
}

export interface GitBranch {
  name: string;
  is_current: boolean;
  last_commit: string;
  remote: string | null;
}

export type GitBranchesResponse = GitBranch[];

export interface GitCommit {
  sha: string;
  short_sha: string;
  message: string;
  author: string;
  email: string;
  timestamp: string;
  files_changed: number;
}

export type GitLogResponse = GitCommit[];

export interface GitDiffResponse {
  diff: string;
  files_changed: number;
}

export interface GitCommitResponse {
  sha: string;
  short_sha: string;
  message: string;
}

// ============================================
// HOST DISCOVERY API
// ============================================

export interface DiscoveredProject {
  name: string;
  path: string;
  has_claudemd: boolean;
  has_git: boolean;
  session_count: number;
}

export type HostDiscoverProjectsResponse = DiscoveredProject[];

export interface BrowseItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  modified: string;
}

export type HostBrowseResponse = BrowseItem[];

// ============================================
// MCP API
// ============================================

export interface MCPServer {
  id: string;
  name: string;
  url: string;
  transport: 'http' | 'stdio';
  enabled: boolean;
  tools_count: number;
  last_used: string | null;
  status: 'connected' | 'disconnected' | 'error';
}

export type MCPServersResponse = MCPServer[];

// ============================================
// PROMPTS API
// ============================================

export interface PromptTemplate {
  name: string;
  content: string;
  category: string;
}

export type PromptTemplatesResponse = PromptTemplate[];

export interface SystemPromptResponse {
  session_id: string;
  system_prompt: string | null;
}

// ============================================
// MODELS API (OpenAI-compatible)
// ============================================

export interface BackendModel {
  id: string;
  object: 'model';
  created: number;
  owned_by: string;
}

export interface ModelsListResponse {
  object: 'list';
  data: BackendModel[];
}

// ============================================
// HEALTH CHECK
// ============================================

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  version: string;
  claude_version: string;
  active_sessions: number;
}

// ============================================
// ERROR RESPONSES
// ============================================

export interface BackendError {
  detail: string;
  error?: {
    code?: string;
    message?: string;
  };
}
