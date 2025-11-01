import express, { Express } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import { WebSocketServer } from 'ws';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import { logger, loggerStream } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { setupWebSocket } from './websocket/server';

// Load environment variables
dotenv.config();

// CRITICAL FIX: Set PATH for Agent SDK to spawn Claude CLI
// Agent SDK spawns child processes (claude-code CLI) that need node in PATH
process.env.PATH = `/opt/homebrew/bin:/usr/local/bin:/Users/nick/.local/bin:${process.env.PATH}`;
logger.info(`PATH configured for Agent SDK: ${process.env.PATH}`);

// Note: Claude Agent SDK automatically detects Claude Code CLI installation
// No manual validation needed - SDK will error if CLI unavailable

// Initialize Express app
const app: Express = express();
const server: HTTPServer = createServer(app);

// Configuration
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Trust proxy (needed if behind reverse proxy like nginx)
app.set('trust proxy', 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is allowed
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Compression
app.use(compression());

// HTTP request logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev', { stream: loggerStream }));
} else {
  app.use(morgan('combined', { stream: loggerStream }));
}

// Body parsers
app.use(express.json({ limit: process.env.MAX_FILE_SIZE || '50mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_FILE_SIZE || '50mb' }));

// Rate limiting
app.use(rateLimiter);

// Health check endpoint (no authentication required)
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    node: process.version,
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
  });
});

// Info endpoint
app.get('/info', (_req, res) => {
  res.json({
    name: 'Claude Code Mobile Backend',
    version: process.env.npm_package_version || '1.0.0',
    environment: NODE_ENV,
    websocket: {
      path: '/ws',
      protocol: 'ws',
    },
    features: {
      claudeAPI: !!process.env.ANTHROPIC_API_KEY,
      mcpServers: process.env.MCP_ENABLED === 'true',
      rateLimiting: true,
    },
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// WebSocket setup
const wss: WebSocketServer = setupWebSocket(server);

// Create logs directory if it doesn't exist
if (NODE_ENV === 'production') {
  const logDir = process.env.LOG_DIR || './logs';
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

// Start server
server.listen(Number(PORT), HOST, () => {
  logger.info('='.repeat(50));
  logger.info('🚀 Claude Code Mobile Backend Started');
  logger.info('='.repeat(50));
  logger.info(`📍 Server:      http://${HOST}:${PORT}`);
  logger.info(`📡 WebSocket:   ws://${HOST}:${PORT}/ws`);
  logger.info(`🔐 Environment: ${NODE_ENV}`);
  logger.info(`🤖 Claude:      Via Agent SDK → Claude Code CLI`);
  logger.info(`🔑 Auth:        Using Claude Code CLI authentication`);
  logger.info(`📊 Rate Limit:  ${process.env.RATE_LIMIT_MAX_REQUESTS || '100'} req/${parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 60000}min`);
  logger.info('='.repeat(50));
});

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully...`);

  // Close WebSocket server
  wss.close(() => {
    logger.info('WebSocket server closed');
  });

  // Close HTTP server
  server.close(() => {
    logger.info('HTTP server closed');

    // Exit process
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forcefully shutting down after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

export { app, server, wss };
