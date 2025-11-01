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
  

  // Zustand selectors
  const setConnected = useAppStore((state) => state.setConnected);
  const settings = useAppStore((state) => state.settings);

  useEffect(() => {
    // Initialize HTTP service
    const service = new HTTPService({
      baseURL: settings.serverUrl,
      onConnectionChange: (isConnected) => {
        console.log('HTTP connection status:', isConnected);
        setConnected(isConnected);
      },
      onError: (error) => {
        console.error('HTTP service error:', error);
        useAppStore.getState().setError(error.message);
      },
    });

    // Store service instance
    setHttpService(service);

    // Cleanup on unmount
    return () => {
      service.cleanup();
    };
  }, [settings.serverUrl]);

  return (
    <HTTPProvider httpService={httpService}>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </HTTPProvider>
  );
}
