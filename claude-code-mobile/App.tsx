/**
 * App Entry Point
 * 
 * Sets up NavigationContainer, Zustand provider, error boundary
 * Replaces Expo Router with React Navigation Stack
 */

import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
// NavigationContainer and AppNavigator removed - using manual navigation
// import { NavigationContainer } from '@react-navigation/native';
// import { AppNavigator } from './src/navigation/AppNavigator';
import { useAppStore } from './src/store/useAppStore';
import { HTTPService } from './src/services/http';
import { HTTPProvider } from './src/contexts/HTTPContext';
import { ChatScreen } from './src/screens/ChatScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SessionsScreen } from './src/screens/SessionsScreen';
import { ProjectsScreen } from './src/screens/ProjectsScreen';
import { SkillsScreen } from './src/screens/SkillsScreen';
import { AgentsScreen } from './src/screens/AgentsScreen';
import { GitScreen } from './src/screens/GitScreen';
import { FileBrowserScreen } from './src/screens/FileBrowserScreen';
import { CodeViewerScreen } from './src/screens/CodeViewerScreen';
import { MCPManagementScreen } from './src/screens/MCPManagementScreen';
import { TabBar } from './src/components/TabBar';


export default function App() {
  const [httpService, setHttpService] = useState<HTTPService | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<string>('Chat');

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

  // TEMPORARY: Manual screen navigation until React Navigation issue resolved
  // See: docs/NAVIGATION-ISSUE-INVESTIGATION-2025-11-03.md
  const navigate = (screen: string) => {
    console.log('=================');
    console.log('[App] MANUAL NAVIGATION CALLED!');
    console.log('[App] Target screen:', screen);
    console.log('[App] Current screen:', currentScreen);
    console.log('[App] Function type:', typeof navigate);
    console.log('=================');
    setCurrentScreen(screen);
    console.log('[App] setCurrentScreen called, new value:', screen);
  };

  console.log('[App] Rendering with currentScreen:', currentScreen);
  console.log('[App] navigate function exists:', typeof navigate === 'function');

  return (
    <HTTPProvider httpService={httpService}>
      <View style={{ flex: 1 }}>
        <StatusBar style="light" />
        {currentScreen === 'Chat' && <ChatScreen navigate={navigate} />}
        {currentScreen === 'Settings' && <SettingsScreen navigate={navigate} />}
        {currentScreen === 'Sessions' && <SessionsScreen navigate={navigate} />}
        {currentScreen === 'Projects' && <ProjectsScreen navigate={navigate} />}
        {currentScreen === 'Skills' && <SkillsScreen navigate={navigate} />}
        {currentScreen === 'Agents' && <AgentsScreen navigate={navigate} />}
        {currentScreen === 'Git' && <GitScreen navigate={navigate} />}
        {currentScreen === 'FileBrowser' && <FileBrowserScreen navigate={navigate} />}
        {currentScreen === 'CodeViewer' && <CodeViewerScreen navigate={navigate} />}
        {currentScreen === 'MCPManagement' && <MCPManagementScreen navigate={navigate} />}
        <TabBar currentScreen={currentScreen} onNavigate={navigate} />
      </View>
    </HTTPProvider>
  );
}
