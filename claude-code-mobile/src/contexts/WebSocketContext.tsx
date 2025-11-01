/**
 * WebSocket Context
 * Provides WebSocket service instance to all screens
 */

import React, { createContext, useContext } from 'react';
import WebSocketService from '../services/websocket.service';

interface WebSocketContextType {
  wsService: WebSocketService | null;
}

const WebSocketContext = createContext<WebSocketContextType>({
  wsService: null,
});

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context.wsService) {
    console.warn('WebSocket service not initialized');
  }
  return context;
};

export const WebSocketProvider: React.FC<{
  wsService: WebSocketService | null;
  children: React.ReactNode;
}> = ({ wsService, children }) => {
  return (
    <WebSocketContext.Provider value={{ wsService }}>
      {children}
    </WebSocketContext.Provider>
  );
};
