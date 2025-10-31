/**
 * Zustand Global Store with AsyncStorage Persistence
 * 
 * Based on spec lines 1824-1878 and Context7 Zustand patterns
 * 
 * Features:
 * - AsyncStorage persistence for settings only (messages too large)
 * - Type-safe state and actions
 * - Selective subscriptions to prevent unnecessary re-renders
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Session, AppSettings } from '../types/models';

/**
 * Application State Interface (spec lines 1824-1878)
 */
interface AppState {
  // Current Session
  currentSession: Session | null;
  sessions: Session[];
  
  // Messages
  messages: Message[];
  
  // Connection Status
  isConnected: boolean;
  isStreaming: boolean;
  
  // Settings
  settings: AppSettings;
  
  // UI State
  currentFile: { path: string; content: string } | null;
  isFilesBrowserOpen: boolean;
  isSettingsOpen: boolean;
  
  // Slash Commands
  recentCommands: string[];
  
  // Error State
  error: string | null;
  
  // Actions
  setCurrentSession: (session: Session | null) => void;
  addSession: (session: Session) => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  deleteSession: (sessionId: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
  setConnected: (connected: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setCurrentFile: (file: { path: string; content: string } | null) => void;
  toggleFilesBrowser: () => void;
  toggleSettings: () => void;
  addRecentCommand: (command: string) => void;
  setError: (error: string | null) => void;
}

/**
 * Default settings
 */
const defaultSettings: AppSettings = {
  serverUrl: 'ws://localhost:3001/ws',
  projectPath: '',
  autoScroll: true,
  hapticFeedback: true,
  darkMode: true,
  fontSize: 14,
  maxTokens: 8192,
  temperature: 1,
};

/**
 * Create Zustand store with AsyncStorage persistence
 * 
 * Using persist middleware with partialize to only persist settings.
 * Messages are NOT persisted (too large, would slow down app).
 */
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      sessions: [],
      messages: [],
      isConnected: false,
      isStreaming: false,
      settings: defaultSettings,
      currentFile: null,
      isFilesBrowserOpen: false,
      isSettingsOpen: false,
      recentCommands: [],
      error: null,

      // Session actions
      setCurrentSession: (session) => set({ currentSession: session }),
      
      addSession: (session) => set((state) => ({
        sessions: [session, ...state.sessions],
      })),
      
      updateSession: (sessionId, updates) => set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === sessionId ? { ...s, ...updates } : s
        ),
        currentSession:
          state.currentSession?.id === sessionId
            ? { ...state.currentSession, ...updates }
            : state.currentSession,
      })),
      
      deleteSession: (sessionId) => set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== sessionId),
        currentSession:
          state.currentSession?.id === sessionId
            ? null
            : state.currentSession,
      })),

      // Message actions
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message],
      })),
      
      updateMessage: (messageId, updates) => set((state) => ({
        messages: state.messages.map((m) =>
          m.id === messageId ? { ...m, ...updates } : m
        ),
      })),
      
      clearMessages: () => set({ messages: [] }),

      // Connection actions
      setConnected: (connected) => set({ isConnected: connected }),
      setStreaming: (streaming) => set({ isStreaming: streaming }),

      // Settings actions
      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates },
      })),

      // UI actions
      setCurrentFile: (file) => set({ currentFile: file }),
      toggleFilesBrowser: () => set((state) => ({
        isFilesBrowserOpen: !state.isFilesBrowserOpen,
      })),
      toggleSettings: () => set((state) => ({
        isSettingsOpen: !state.isSettingsOpen,
      })),
      
      // Command actions
      addRecentCommand: (command) => set((state) => ({
        recentCommands: [command, ...state.recentCommands.slice(0, 9)], // Keep last 10
      })),

      // Error actions
      setError: (error) => set({ error }),
    }),
    {
      name: 'claude-code-storage', // AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage),
      
      // CRITICAL: Only persist settings, NOT messages (too large)
      partialize: (state) => ({
        settings: state.settings,
        recentCommands: state.recentCommands,
        // Don't persist: currentSession, sessions, messages, currentFile
        // These are loaded fresh from backend on reconnect
      }),
    }
  )
);

/**
 * Selector hooks for optimized re-renders
 * Use these instead of useAppStore() to subscribe to specific state slices
 */
export const useCurrentSession = () => useAppStore((state) => state.currentSession);
export const useMessages = () => useAppStore((state) => state.messages);
export const useIsConnected = () => useAppStore((state) => state.isConnected);
export const useIsStreaming = () => useAppStore((state) => state.isStreaming);
export const useSettings = () => useAppStore((state) => state.settings);
export const useError = () => useAppStore((state) => state.error);
