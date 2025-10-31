/**
 * App Root Component
 * Main application entry point with navigation setup
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {/* Navigation will be added in Task 4.4 */}
    </SafeAreaProvider>
  );
}
