/**
 * Performance Utilities
 * Helpers for measuring and optimizing performance
 */

/**
 * Simple performance timer
 */
export class PerformanceTimer {
  private startTime: number = 0;
  private marks: Map<string, number> = new Map();

  start(): void {
    this.startTime = performance.now();
    this.marks.clear();
  }

  mark(label: string): void {
    this.marks.set(label, performance.now() - this.startTime);
  }

  getElapsed(): number {
    return performance.now() - this.startTime;
  }

  getMarks(): Record<string, number> {
    const result: Record<string, number> = {};
    this.marks.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  log(prefix: string = 'Timer'): void {
    console.log(`[${prefix}] Total: ${this.getElapsed().toFixed(2)}ms`);
    this.marks.forEach((value, key) => {
      console.log(`[${prefix}] ${key}: ${value.toFixed(2)}ms`);
    });
  }
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limitMs);
    }
  };
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(this, args);
      timeout = null;
    }, waitMs);
  };
}

/**
 * Measure async function execution time
 */
export async function measureAsync<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const elapsed = performance.now() - start;
    console.log(`[Performance] ${label}: ${elapsed.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const elapsed = performance.now() - start;
    console.log(`[Performance] ${label} (error): ${elapsed.toFixed(2)}ms`);
    throw error;
  }
}

/**
 * Batch array operations for performance
 */
export function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => R,
  batchSize: number = 10
): R[] {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = batch.map(processor);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}
