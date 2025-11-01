/**
 * Formatting Utilities
 * Common formatting functions for display
 */

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Format time ago (relative time)
 */
export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

/**
 * Format token count with commas
 */
export function formatTokens(tokens: number): string {
  return tokens.toLocaleString();
}

/**
 * Format cost in USD
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`;
}

/**
 * Format date to locale string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format time to locale string
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Check if file is code
 */
export function isCodeFile(filename: string): boolean {
  const codeExtensions = [
    'ts', 'tsx', 'js', 'jsx', 'py', 'java', 'cpp', 'c', 'h',
    'swift', 'kt', 'rs', 'go', 'rb', 'php', 'cs', 'sh', 'bash',
    'json', 'yaml', 'yml', 'xml', 'md', 'sql',
  ];
  return codeExtensions.includes(getFileExtension(filename));
}

/**
 * Get syntax highlighting language from extension
 */
export function getSyntaxLanguage(filename: string): string {
  const ext = getFileExtension(filename);
  const languageMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'py': 'python',
    'rb': 'ruby',
    'md': 'markdown',
    'sh': 'bash',
    'yml': 'yaml',
  };
  return languageMap[ext] || ext;
}
