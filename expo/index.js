/**
 * Expo Entry Point
 * Main entry file for the React Native application
 *
 * Points to the actual app implementation in claude-code-mobile/
 * Removed expo-router to eliminate development tools overlay
 */

import { registerRootComponent } from 'expo';
import App from '../claude-code-mobile/App';

registerRootComponent(App);
