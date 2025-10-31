/**
 * Navigation Types
 * Type definitions for React Navigation routing and navigation
 */

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { Conversation, Message, ServerConfig } from './models';

/**
 * Root Stack Parameter List
 * Defines all screens and their required parameters
 */

export type RootStackParamList = {
  // Main Navigation
  Chat: undefined;
  Settings: undefined;
  ConversationHistory: undefined;
  
  // Modal Screens
  ServerConnection: {
    isInitialSetup?: boolean;
  };
  ConversationDetail: {
    conversationId: string;
  };
  CommandPalette: undefined;
  
  // Error Screens
  ErrorScreen: {
    error: ErrorScreenParams;
  };
};

/**
 * Screen Props Types
 * Type-safe props for each screen
 */

export type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export type ConversationHistoryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ConversationHistory'
>;

export type ServerConnectionScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ServerConnection'
>;

export type ConversationDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ConversationDetail'
>;

export type CommandPaletteScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CommandPalette'
>;

export type ErrorScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ErrorScreen'
>;

/**
 * Error Screen Parameters
 */

export interface ErrorScreenParams {
  title: string;
  message: string;
  code?: string;
  recoverable: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * Navigation Helpers
 */

export interface NavigationHelper {
  navigateToChat(): void;
  navigateToSettings(): void;
  navigateToHistory(): void;
  navigateToConversation(conversationId: string): void;
  openCommandPalette(): void;
  openServerConnection(isInitialSetup?: boolean): void;
  showError(error: ErrorScreenParams): void;
  goBack(): void;
  canGoBack(): boolean;
}

/**
 * Screen Options
 */

export interface ScreenOptions {
  title?: string;
  headerShown?: boolean;
  headerTransparent?: boolean;
  headerBackVisible?: boolean;
  presentation?: 'card' | 'modal' | 'transparentModal';
  animation?: 'default' | 'fade' | 'slide_from_bottom' | 'slide_from_right';
  gestureEnabled?: boolean;
}

/**
 * Tab Navigator Types (if using tabs in future)
 */

export type TabParamList = {
  ChatTab: undefined;
  HistoryTab: undefined;
  SettingsTab: undefined;
};

/**
 * Deep Linking Types
 */

export interface DeepLinkConfig {
  screens: {
    Chat: string;
    Settings: string;
    ConversationHistory: string;
    ConversationDetail: string;
    ServerConnection: string;
  };
}

export interface DeepLinkParams {
  conversationId?: string;
  messageId?: string;
  action?: DeepLinkAction;
}

export type DeepLinkAction =
  | 'open_conversation'
  | 'new_conversation'
  | 'connect_server'
  | 'open_settings';

/**
 * Navigation State Types
 */

export interface NavigationState {
  currentRoute: keyof RootStackParamList;
  previousRoute?: keyof RootStackParamList;
  params?: Record<string, unknown>;
  canGoBack: boolean;
}

/**
 * Route Types
 */

export interface Route<T extends keyof RootStackParamList = keyof RootStackParamList> {
  key: string;
  name: T;
  params?: RootStackParamList[T];
  path?: string;
}

/**
 * Navigation Transitions
 */

export type TransitionPreset =
  | 'default'
  | 'fade'
  | 'slide_from_bottom'
  | 'slide_from_right'
  | 'slide_from_left'
  | 'modal';

export interface TransitionConfig {
  preset: TransitionPreset;
  duration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

/**
 * Navigation Context
 */

export interface NavigationContext {
  currentScreen: keyof RootStackParamList;
  isNavigating: boolean;
  navigationStack: Array<keyof RootStackParamList>;
  canGoBack: boolean;
  canGoForward: boolean;
}

/**
 * Screen Lifecycle Events
 */

export type ScreenLifecycleEvent =
  | 'focus'
  | 'blur'
  | 'beforeRemove'
  | 'state';

export interface ScreenLifecycleListener {
  type: ScreenLifecycleEvent;
  handler: () => void;
}

/**
 * Navigation Guards
 */

export type NavigationGuard = (
  to: Route,
  from?: Route
) => boolean | Promise<boolean>;

export interface NavigationGuardConfig {
  screens: Array<keyof RootStackParamList>;
  guard: NavigationGuard;
}

/**
 * Navigation Analytics
 */

export interface NavigationAnalytics {
  screenName: keyof RootStackParamList;
  timestamp: Date;
  duration?: number;
  previousScreen?: keyof RootStackParamList;
  params?: Record<string, unknown>;
}

/**
 * Drawer Navigator Types (if using drawer in future)
 */

export type DrawerParamList = {
  Main: undefined;
  Profile: undefined;
  About: undefined;
};

/**
 * Bottom Sheet Navigation
 */

export interface BottomSheetRoute {
  name: string;
  component: React.ComponentType<any>;
  initialParams?: Record<string, unknown>;
}

export interface BottomSheetNavigationOptions {
  snapPoints?: Array<string | number>;
  enableDynamicSizing?: boolean;
  enablePanDownToClose?: boolean;
  backdropComponent?: React.ComponentType<any>;
}

/**
 * Navigation Animations
 */

export interface NavigationAnimation {
  entering?: string;
  exiting?: string;
  layout?: string;
}

/**
 * Type Guards
 */

export function isValidRoute(route: unknown): route is Route {
  return (
    typeof route === 'object' &&
    route !== null &&
    'key' in route &&
    'name' in route
  );
}

export function isNavigationState(state: unknown): state is NavigationState {
  return (
    typeof state === 'object' &&
    state !== null &&
    'currentRoute' in state &&
    'canGoBack' in state
  );
}

/**
 * Navigation Utilities
 */

export interface NavigationUtils {
  getActiveRoute(state: NavigationState): Route;
  getRouteParams<T extends keyof RootStackParamList>(
    route: T
  ): RootStackParamList[T];
  buildDeepLink(route: keyof RootStackParamList, params?: Record<string, unknown>): string;
  parseDeepLink(url: string): DeepLinkParams;
}

/**
 * Screen Configuration
 */

export interface ScreenConfig {
  name: keyof RootStackParamList;
  component: React.ComponentType<any>;
  options?: ScreenOptions;
  initialParams?: Record<string, unknown>;
  listeners?: Record<ScreenLifecycleEvent, () => void>;
}

/**
 * Navigator Configuration
 */

export interface NavigatorConfig {
  initialRouteName: keyof RootStackParamList;
  screenOptions?: ScreenOptions;
  screens: ScreenConfig[];
}

/**
 * Navigation Constants
 */

export const NAVIGATION_CONSTANTS = {
  ANIMATION_DURATION: 250,
  GESTURE_THRESHOLD: 50,
  BACK_BUTTON_DELAY: 300,
  DEEP_LINK_PREFIX: 'claudecode://',
} as const;

/**
 * Navigation Events
 */

export type NavigationEvent =
  | 'navigate'
  | 'goBack'
  | 'reset'
  | 'setParams'
  | 'routeChange';

export interface NavigationEventPayload {
  event: NavigationEvent;
  route?: Route;
  params?: Record<string, unknown>;
  timestamp: Date;
}
