/**
 * Validation Utilities
 * Input validation and sanitization
 */

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate server URL (HTTP/HTTPS)
 */
export function isValidServerURL(url: string): boolean {
  if (!isValidURL(url)) return false;
  const parsed = new URL(url);
  return parsed.protocol === 'http:' || parsed.protocol === 'https:';
}

/**
 * Validate file path (no directory traversal)
 */
export function isValidFilePath(path: string): boolean {
  // Prevent directory traversal attacks
  if (path.includes('../') || path.includes('..\\')) return false;
  if (path.startsWith('/etc/') || path.startsWith('/sys/')) return false;
  return true;
}

/**
 * Validate project path
 */
export function isValidProjectPath(path: string): boolean {
  if (!isValidFilePath(path)) return false;
  if (path.length === 0) return false;
  if (path.length > 500) return false; // Reasonable path length
  return true;
}

/**
 * Validate git branch name
 */
export function isValidBranchName(name: string): boolean {
  // Git branch naming rules
  if (name.length === 0) return false;
  if (name.startsWith('.') || name.startsWith('/')) return false;
  if (name.includes('..') || name.includes('//')) return false;
  if (name.includes(' ')) return false;
  return true;
}

/**
 * Validate commit message
 */
export function isValidCommitMessage(message: string): boolean {
  const trimmed = message.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.length < 3) return false; // Minimum message length
  if (trimmed.length > 500) return false; // Maximum for UI
  return true;
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML/XML tags
    .substring(0, 1000); // Max length for safety
}

/**
 * Validate model ID
 */
export function isValidModelId(modelId: string): boolean {
  return modelId.startsWith('claude-') && modelId.length > 10;
}

/**
 * Validate session ID (UUID format)
 */
export function isValidSessionId(sessionId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(sessionId);
}
