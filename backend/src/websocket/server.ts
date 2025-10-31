import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { IncomingMessage } from 'http';
import { logger } from '../utils/logger';
import { SessionManager } from './sessionManager';
import { MessageHandler } from './messageHandler';
import { ClaudeService } from '../services/claude.service';
import { wsRateLimiter } from '../middleware/rateLimiter';

// Extend WebSocket with custom properties
interface ExtendedWebSocket extends WebSocket {
  isAlive?: boolean;
  connectionId?: string;
  sessionId?: string;
}

/**
 * Setup WebSocket server with connection handling and heartbeat
 */
export function setupWebSocket(server: HTTPServer): WebSocketServer {
  const wss = new WebSocketServer({
    server,
    path: '/ws',
    clientTracking: true,
    perMessageDeflate: {
      zlibDeflateOptions: {
        chunkSize: 1024,
        memLevel: 7,
        level: 3,
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024,
      },
      clientNoContextTakeover: true,
      serverNoContextTakeover: true,
      serverMaxWindowBits: 10,
      concurrencyLimit: 10,
      threshold: 1024,
    },
  });

  const sessionManager = new SessionManager();
  const claudeService = new ClaudeService();
  const messageHandler = new MessageHandler(sessionManager, claudeService);

  // Handle new WebSocket connections
  wss.on('connection', (ws: ExtendedWebSocket, req: IncomingMessage) => {
    const connectionId = uuidv4();
    const ipAddress = req.socket.remoteAddress || 'unknown';

    // Check rate limit for WebSocket connections
    if (!wsRateLimiter.checkLimit(ipAddress)) {
      logger.warn(`WebSocket connection rate limit exceeded for ${ipAddress}`);
      ws.close(1008, 'Too many connections');
      return;
    }

    // Assign connection ID
    ws.connectionId = connectionId;

    logger.info(`New WebSocket connection: ${connectionId} from ${ipAddress}`);

    // Set up heartbeat
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Send welcome message
    ws.send(
      JSON.stringify({
        type: 'connected',
        connectionId,
        timestamp: new Date().toISOString(),
        server: 'Claude Code Mobile Backend',
        version: '1.0.0',
      })
    );

    // Handle incoming messages
    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Validate message structure
        if (!message.type) {
          throw new Error('Message type is required');
        }

        // Log incoming message (excluding sensitive data)
        const logMessage = { ...message };
        if (logMessage.content && logMessage.content.length > 100) {
          logMessage.content = logMessage.content.substring(0, 100) + '...';
        }
        logger.debug(`Received message from ${connectionId}:`, JSON.stringify(logMessage));

        // Handle the message
        await messageHandler.handle(ws, message, connectionId);
      } catch (error: any) {
        logger.error(`Error handling message from ${connectionId}:`, error);
        
        ws.send(
          JSON.stringify({
            type: 'error',
            error: error.message || 'Invalid message format',
            timestamp: new Date().toISOString(),
          })
        );
      }
    });

    // Handle connection close
    ws.on('close', (code: number, reason: Buffer) => {
      logger.info(`WebSocket connection closed: ${connectionId} (code: ${code}, reason: ${reason.toString() || 'none'})`);
      
      // Release rate limit slot
      wsRateLimiter.releaseConnection(ipAddress);

      // Clean up session
      sessionManager.removeConnection(connectionId);
    });

    // Handle errors
    ws.on('error', (error: Error) => {
      logger.error(`WebSocket error for ${connectionId}:`, error);
      
      // Release rate limit slot
      wsRateLimiter.releaseConnection(ipAddress);

      // Clean up session
      sessionManager.removeConnection(connectionId);
    });
  });

  // Heartbeat interval - ping clients every 30 seconds
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {
      const extWs = ws as ExtendedWebSocket;

      if (extWs.isAlive === false) {
        logger.warn(`Terminating inactive WebSocket connection: ${extWs.connectionId}`);
        return extWs.terminate();
      }

      extWs.isAlive = false;
      extWs.ping();
    });
  }, parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000'));

  // Clean up on server close
  wss.on('close', () => {
    logger.info('WebSocket server closing...');
    clearInterval(heartbeatInterval);
  });

  // Log WebSocket server stats periodically
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      const connCount = wss.clients.size;
      const sessionCount = sessionManager.getActiveSessionCount();
      logger.debug(`WebSocket Stats - Connections: ${connCount}, Sessions: ${sessionCount}`);
    }, 60000); // Every minute
  }

  logger.info('WebSocket server initialized successfully');

  return wss;
}

/**
 * Broadcast message to all connected clients
 */
export function broadcast(wss: WebSocketServer, message: any): void {
  const data = JSON.stringify(message);
  let sentCount = 0;

  wss.clients.forEach((ws: WebSocket) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
      sentCount++;
    }
  });

  logger.debug(`Broadcast message to ${sentCount} clients`);
}

/**
 * Send message to specific connection
 */
export function sendToConnection(wss: WebSocketServer, connectionId: string, message: any): boolean {
  const data = JSON.stringify(message);

  for (const ws of wss.clients) {
    const extWs = ws as ExtendedWebSocket;
    if (extWs.connectionId === connectionId && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
      return true;
    }
  }

  return false;
}
