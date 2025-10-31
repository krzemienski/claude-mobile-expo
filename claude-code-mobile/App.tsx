/**
 * App Entry Point
 * 
 * Sets up NavigationContainer, Zustand provider, error boundary
 * Replaces Expo Router with React Navigation Stack
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAppStore } from './src/store/useAppStore';
import WebSocketService from './src/services/websocket.service';
import { ConnectionStatus } from './src/types/websocket';

let wsService: WebSocketService | null = null;

export default function App() {
  const setConnected = useAppStore((state) => state.setConnected);
  const settings = useAppStore((state) => state.settings);
  const addMessage = useAppStore((state) => state.addMessage);
  const setStreaming = useAppStore((state) => state.setStreaming);

  useEffect(() => {
    // Initialize WebSocket service
    wsService = new WebSocketService(
      {
        serverUrl: settings.serverUrl,
      },
      {
        onConnected: (connectionId) => {
          console.log('WebSocket connected:', connectionId);
          setConnected(true);
          
          // Initialize session
          wsService?.initSession(settings.projectPath || '/tmp/mobile-project');
        },
        onSessionInitialized: (sessionId, hasContext) => {
          console.log('Session initialized:', sessionId);
        },
        onContentDelta: (delta) => {
          // Append to current assistant message
          // TODO: Implement message accumulation
        },
        onToolExecution: (tool, input) => {
          console.log('Tool execution:', tool);
        },
        onToolResult: (tool, result, error) => {
          console.log('Tool result:', tool, result || error);
        },
        onMessageComplete: (tokensUsed) => {
          console.log('Message complete', tokensUsed);
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
    wsService.connect();

    // Cleanup on unmount
    return () => {
      wsService?.disconnect();
    };
  }, [settings.serverUrl, settings.projectPath]);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <AppNavigator />
    </NavigationContainer>
  );
}
