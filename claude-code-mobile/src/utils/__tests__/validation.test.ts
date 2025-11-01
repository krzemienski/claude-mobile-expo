/**
 * Validation Tests
 * Unit tests for validation utilities
 */

import {
  isValidURL,
  isValidServerURL,
  isValidFilePath,
  isValidProjectPath,
  isValidBranchName,
  isValidCommitMessage,
  sanitizeInput,
  isValidModelId,
  isValidSessionId,
} from '../validation';

describe('isValidURL', () => {
  it('validates URLs', () => {
    expect(isValidURL('https://example.com')).toBe(true);
    expect(isValidURL('http://localhost:8001')).toBe(true);
    expect(isValidURL('not-a-url')).toBe(false);
    expect(isValidURL('')).toBe(false);
  });
});

describe('isValidServerURL', () => {
  it('validates server URLs', () => {
    expect(isValidServerURL('https://api.example.com')).toBe(true);
    expect(isValidServerURL('http://localhost:8001')).toBe(true);
    expect(isValidServerURL('ftp://example.com')).toBe(false);
    expect(isValidServerURL('ws://example.com')).toBe(false);
  });
});

describe('isValidFilePath', () => {
  it('prevents directory traversal', () => {
    expect(isValidFilePath('/Users/nick/project/file.txt')).toBe(true);
    expect(isValidFilePath('../../../etc/passwd')).toBe(false);
    expect(isValidFilePath('/etc/passwd')).toBe(false);
  });
});

describe('isValidBranchName', () => {
  it('validates git branch names', () => {
    expect(isValidBranchName('main')).toBe(true);
    expect(isValidBranchName('feature/new-feature')).toBe(true);
    expect(isValidBranchName('.hidden')).toBe(false);
    expect(isValidBranchName('has space')).toBe(false);
    expect(isValidBranchName('has..dots')).toBe(false);
  });
});

describe('isValidCommitMessage', () => {
  it('validates commit messages', () => {
    expect(isValidCommitMessage('fix: bug')).toBe(true);
    expect(isValidCommitMessage('feat: add feature with details')).toBe(true);
    expect(isValidCommitMessage('ab')).toBe(false); // Too short
    expect(isValidCommitMessage('')).toBe(false); // Empty
    expect(isValidCommitMessage('  ')).toBe(false); // Whitespace only
  });
});

describe('sanitizeInput', () => {
  it('sanitizes user input', () => {
    expect(sanitizeInput('  Hello  ')).toBe('Hello');
    expect(sanitizeInput('Test <script>')).toBe('Test script');
    expect(sanitizeInput('<b>Bold</b>')).toBe('bBold/b');
  });
});

describe('isValidModelId', () => {
  it('validates Claude model IDs', () => {
    expect(isValidModelId('claude-opus-4-20250514')).toBe(true);
    expect(isValidModelId('claude-3-5-haiku-20241022')).toBe(true);
    expect(isValidModelId('gpt-4')).toBe(false);
    expect(isValidModelId('claude')).toBe(false);
  });
});

describe('isValidSessionId', () => {
  it('validates UUID format', () => {
    expect(isValidSessionId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidSessionId('not-a-uuid')).toBe(false);
    expect(isValidSessionId('')).toBe(false);
  });
});
