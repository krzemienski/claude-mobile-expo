import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';

/**
 * Configuration for rate limiting
 */
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes default
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'); // 100 requests per window

/**
 * Custom key generator for rate limiting
 * Uses IP address by default, but can be extended to use user ID
 */
const keyGenerator = (req: Request): string => {
  // If user is authenticated, use their ID
  if (req.user && (req.user as any).id) {
    return `user_${(req.user as any).id}`;
  }

  // Otherwise use IP address
  return req.ip || req.socket.remoteAddress || 'unknown';
};

/**
 * Custom handler for rate limit exceeded
 */
const handler = (req: Request, res: Response): void => {
  const key = keyGenerator(req);
  logger.warn(`Rate limit exceeded for ${key} on ${req.path}`);

  res.status(429).json({
    status: 'error',
    statusCode: 429,
    message: 'Too many requests, please try again later.',
    retryAfter: Math.ceil(WINDOW_MS / 1000), // seconds
  });
};

/**
 * Skip rate limiting in development if needed
 */
const skip = (req: Request): boolean => {
  // Skip rate limiting for health check endpoint
  if (req.path === '/health') {
    return true;
  }

  // Skip rate limiting in test environment
  if (process.env.NODE_ENV === 'test') {
    return true;
  }

  return false;
};

/**
 * Standard rate limiter middleware
 * Applied to all API routes
 */
export const rateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  keyGenerator,
  handler,
  skip,
  message: 'Too many requests from this IP, please try again later.',
});

/**
 * Strict rate limiter for sensitive endpoints
 * Use for authentication, password reset, etc.
 */
export const strictRateLimiter = rateLimit({
  windowMs: 900000, // 15 minutes
  max: 5, // 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (req: Request, res: Response) => {
    const key = keyGenerator(req);
    logger.warn(`Strict rate limit exceeded for ${key} on ${req.path}`);

    res.status(429).json({
      status: 'error',
      statusCode: 429,
      message: 'Too many attempts, please try again later.',
      retryAfter: 900, // 15 minutes in seconds
    });
  },
  skip,
});

/**
 * WebSocket connection rate limiter
 * Limits the number of WebSocket connections per IP
 */
export class WebSocketRateLimiter {
  private connections: Map<string, { count: number; firstConnection: number }>;
  private readonly maxConnections: number;
  private readonly windowMs: number;

  constructor(maxConnections = 5, windowMs = 60000) {
    this.connections = new Map();
    this.maxConnections = maxConnections;
    this.windowMs = windowMs;

    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if connection should be allowed
   */
  checkLimit(ip: string): boolean {
    const now = Date.now();
    const entry = this.connections.get(ip);

    if (!entry) {
      this.connections.set(ip, { count: 1, firstConnection: now });
      return true;
    }

    // Reset if window has passed
    if (now - entry.firstConnection > this.windowMs) {
      this.connections.set(ip, { count: 1, firstConnection: now });
      return true;
    }

    // Check if limit exceeded
    if (entry.count >= this.maxConnections) {
      logger.warn(`WebSocket connection limit exceeded for ${ip}`);
      return false;
    }

    // Increment count
    entry.count++;
    return true;
  }

  /**
   * Decrement connection count when connection closes
   */
  releaseConnection(ip: string): void {
    const entry = this.connections.get(ip);
    if (entry && entry.count > 0) {
      entry.count--;
      if (entry.count === 0) {
        this.connections.delete(ip);
      }
    }
  }

  /**
   * Clean up old entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [ip, entry] of this.connections.entries()) {
      if (now - entry.firstConnection > this.windowMs) {
        this.connections.delete(ip);
      }
    }
  }

  /**
   * Get current connection count for IP
   */
  getConnectionCount(ip: string): number {
    return this.connections.get(ip)?.count || 0;
  }
}

// Export singleton instance for WebSocket rate limiting
export const wsRateLimiter = new WebSocketRateLimiter();
