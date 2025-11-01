/**
 * Formatters Tests
 * Unit tests for formatting utilities
 */

import {
  formatBytes,
  formatTimeAgo,
  formatTokens,
  formatCost,
  truncate,
  getFileExtension,
  isCodeFile,
  getSyntaxLanguage,
} from '../formatters';

describe('formatBytes', () => {
  it('formats bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });
});

describe('formatTimeAgo', () => {
  it('formats recent times', () => {
    const now = new Date();
    expect(formatTimeAgo(now)).toBe('just now');

    const minute = new Date(now.getTime() - 60 * 1000);
    expect(formatTimeAgo(minute)).toBe('1m ago');

    const hour = new Date(now.getTime() - 3600 * 1000);
    expect(formatTimeAgo(hour)).toBe('1h ago');
  });
});

describe('formatTokens', () => {
  it('adds commas to numbers', () => {
    expect(formatTokens(1000)).toBe('1,000');
    expect(formatTokens(1000000)).toBe('1,000,000');
  });
});

describe('formatCost', () => {
  it('formats USD with 4 decimals', () => {
    expect(formatCost(0.00424)).toBe('$0.0042');
    expect(formatCost(1.5)).toBe('$1.5000');
  });
});

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('Hello World', 8)).toBe('Hello...');
    expect(truncate('Short', 10)).toBe('Short');
  });
});

describe('getFileExtension', () => {
  it('extracts file extensions', () => {
    expect(getFileExtension('App.tsx')).toBe('tsx');
    expect(getFileExtension('package.json')).toBe('json');
    expect(getFileExtension('README')).toBe('');
  });
});

describe('isCodeFile', () => {
  it('identifies code files', () => {
    expect(isCodeFile('App.tsx')).toBe(true);
    expect(isCodeFile('main.py')).toBe(true);
    expect(isCodeFile('image.png')).toBe(false);
  });
});

describe('getSyntaxLanguage', () => {
  it('maps extensions to syntax languages', () => {
    expect(getSyntaxLanguage('App.tsx')).toBe('typescript');
    expect(getSyntaxLanguage('main.py')).toBe('python');
    expect(getSyntaxLanguage('README.md')).toBe('markdown');
  });
});
