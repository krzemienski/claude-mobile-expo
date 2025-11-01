/**
 * App Entry Point
 * 
 * Sets up NavigationContainer, Zustand provider, error boundary
 * Replaces Expo Router with React Navigation Stack
 */

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAppStore } from './src/store/useAppStore';
import { HTTPService } from './src/services/http';
import { HTTPProvider } from './src/contexts/HTTPContext';


export default function App() {
  const [httpService, setHttpService] = useState<HTTPService | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Zustand selectors
  const setConnected = useAppStore((state) => state.setConnected);
  const settings = useAppStore((state) => state.settings);

  useEffect(() => {
    console.log('[App] Initializing HTTP service with baseURL:', settings.serverUrl);
    setIsInitializing(true);

    // Initialize HTTP service
    const service = new HTTPService({
      baseURL: settings.serverUrl,
      onConnectionChange: (isConnected) => {
        console.log('[App] HTTP connection status:', isConnected);
        setConnected(isConnected);
      },
      onError: (error) => {
        console.error('[App] HTTP service error:', error);
        useAppStore.getState().setError(error.message);
      },
    });

    // Store service instance
    console.log('[App] HTTPService created, setting state');
    setHttpService(service);
    setIsInitializing(false);

    // Cleanup on unmount
    return () => {
      console.log('[App] Cleaning up HTTP service');
      service.cleanup();
    };
  }, [settings.serverUrl]);

  // Show loading screen while initializing
  if (isInitializing || !httpService) {
    return null; // You could add a splash screen here
  }

  return (
    <HTTPProvider httpService={httpService}>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </HTTPProvider>
  );
}
