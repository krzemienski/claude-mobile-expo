/**
 * Navigation Types
 * React Navigation Stack Navigator type definitions
 * Based on Context7 React Navigation docs and spec
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Root Stack Navigator Parameter List
 * Defines all screens and their params
 */
export type RootStackParamList = {
  Chat: undefined;
  FileBrowser: {
    path?: string;
  };
  CodeViewer: {
    filePath: string;
    fileName: string;
  };
  Settings: undefined;
  Sessions: undefined;
  Projects: undefined;
  MCPManagement: undefined;
  Git: undefined;
  Skills: undefined;
  Agents: undefined;
};

/**
 * Screen Props Helper Types
 * Use these for type-safe screen components
 */
export type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;
export type FileBrowserScreenProps = NativeStackScreenProps<RootStackParamList, 'FileBrowser'>;
export type CodeViewerScreenProps = NativeStackScreenProps<RootStackParamList, 'CodeViewer'>;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;
export type SessionsScreenProps = NativeStackScreenProps<RootStackParamList, 'Sessions'>;
export type ProjectsScreenProps = NativeStackScreenProps<RootStackParamList, 'Projects'>;
export type GitScreenProps = NativeStackScreenProps<RootStackParamList, 'Git'>;
export type MCPManagementScreenProps = NativeStackScreenProps<RootStackParamList, 'MCPManagement'>;
export type SkillsScreenProps = NativeStackScreenProps<RootStackParamList, 'Skills'>;
export type AgentsScreenProps = NativeStackScreenProps<RootStackParamList, 'Agents'>;

/**
 * Generic Screen Props Type
 */
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

/**
 * Global type declaration for useNavigation hook
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
