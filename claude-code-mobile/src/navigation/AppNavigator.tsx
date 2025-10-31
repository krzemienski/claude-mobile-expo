/**
 * AppNavigator - React Navigation Stack
 * 
 * Replaces Expo Router tab navigation with Stack Navigator per spec
 * Type-safe navigation with RootStackParamList
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatScreen } from '../screens/ChatScreen';
import { FileBrowserScreen } from '../screens/FileBrowserScreen';
import { CodeViewerScreen } from '../screens/CodeViewerScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SessionsScreen } from '../screens/SessionsScreen';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Chat"
      screenOptions={{
        headerShown: false, // Custom headers in each screen
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'Claude Code',
        }}
      />
      <Stack.Screen
        name="FileBrowser"
        component={FileBrowserScreen}
        options={{
          title: 'Files',
        }}
      />
      <Stack.Screen
        name="CodeViewer"
        component={CodeViewerScreen}
        options={{
          title: 'Code Viewer',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="Sessions"
        component={SessionsScreen}
        options={{
          title: 'Sessions',
        }}
      />
    </Stack.Navigator>
  );
};
