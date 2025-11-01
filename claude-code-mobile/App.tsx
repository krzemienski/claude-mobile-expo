/**
 * App Entry Point
 * 
 * Sets up NavigationContainer, Zustand provider, error boundary
 * Replaces Expo Router with React Navigation Stack
 */

import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAppStore } from './src/store/useAppStore';
import WebSocketService from './src/services/websocket.service';
import { WebSocketProvider } from './src/contexts/WebSocketContext';
import { ConnectionStatus } from './src/types/websocket';
import { MessageRole } from './src/types/models';

export default function App() {
  const [wsService, setWsService] = useState<WebSocketService | null>(null);
  const currentAssistantMessageRef = useRef<{id: string; content: string} | null>(null);

  // Zustand selectors
  const setConnected = useAppStore((state) => state.setConnected);
  const settings = useAppStore((state) => state.settings);

  useEffect(() => {
    // Initialize WebSocket service
    const service = new WebSocketService(
      {
        serverUrl: settings.serverUrl,
      },
      {
        onConnected: (connectionId) => {
          console.log('WebSocket connected:', connectionId);
          setConnected(true);

          // Initialize session (use service, not wsService state variable)
          service.initSession(settings.projectPath || '/tmp/mobile-project');
        },
        onSessionInitialized: (sessionId, hasContext) => {
          console.log('Session initialized:', sessionId);
        },
        onContentDelta: (delta) => {
          const { addMessage, updateMessage, setStreaming } = useAppStore.getState();

          // Create assistant message if first delta
          if (!currentAssistantMessageRef.current) {
            const assistantMessage = {
              id: `msg-${Date.now()}`,
              role: MessageRole.ASSISTANT,
              content: delta,
              timestamp: new Date(),
              isStreaming: true,
            };
            addMessage(assistantMessage);
            currentAssistantMessageRef.current = {
              id: assistantMessage.id,
              content: delta
            };
            setStreaming(true);
          } else {
            // Append delta to accumulated content
            currentAssistantMessageRef.current.content += delta;
            updateMessage(currentAssistantMessageRef.current.id, {
              content: currentAssistantMessageRef.current.content,
            });
          }
        },
        onToolExecution: (tool, input) => {
          console.log('Tool execution:', tool);
        },
        onToolResult: (tool, result, error) => {
          console.log('Tool result:', tool, result || error);
        },
        onMessageComplete: (tokensUsed) => {
          console.log('Message complete', tokensUsed);
          const { updateMessage, setStreaming } = useAppStore.getState();

          if (currentAssistantMessageRef.current) {
            updateMessage(currentAssistantMessageRef.current.id, {
              isStreaming: false,
              tokensUsed,
            });
            currentAssistantMessageRef.current = null;
          }
          setStreaming(false);
        },
        onError: (error, code) => {
          console.error('WebSocket error:', error, code);
        },
        onConnectionStatusChange: (status) => {
          setConnected(status === ConnectionStatus.CONNECTED);
        },
      }
    );

    // Connect to WebSocket
    service.connect();

    // Store service instance
    setWsService(service);

    // Cleanup on unmount
    return () => {
      service?.disconnect();
    };
  }, [settings.serverUrl, settings.projectPath]);

  return (
    <WebSocketProvider wsService={wsService}>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </WebSocketProvider>
  );
}
