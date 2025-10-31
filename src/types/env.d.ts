/**
 * Environment Type Definitions
 * Declare global types and module augmentations
 */

/// <reference types="react" />
/// <reference types="react-native" />

/**
 * Expo Constants
 */
declare module 'expo-constants' {
  export interface Constants {
    expoConfig: {
      extra?: {
        apiUrl?: string;
        websocketUrl?: string;
        enableDebugMode?: boolean;
      };
    };
  }
}

/**
 * Environment Variables
 */
interface ProcessEnv {
  NODE_ENV: 'development' | 'production' | 'test';
  EXPO_PUBLIC_API_URL?: string;
  EXPO_PUBLIC_WS_URL?: string;
}

declare namespace NodeJS {
  interface ProcessEnv extends ProcessEnv {}
}

/**
 * React Navigation Extensions
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends import('./navigation').RootStackParamList {}
  }
}

/**
 * Module Augmentations for Third-Party Libraries
 */

// React Native Syntax Highlighter
declare module 'react-native-syntax-highlighter' {
  import { ComponentType } from 'react';
  import { TextStyle, ViewStyle } from 'react-native';

  export interface SyntaxHighlighterProps {
    language?: string;
    style?: Record<string, TextStyle>;
    customStyle?: ViewStyle;
    fontSize?: number;
    highlighter?: 'prism' | 'hljs';
    children: string;
  }

  export const SyntaxHighlighter: ComponentType<SyntaxHighlighterProps>;
  export default SyntaxHighlighter;
}

// WebSocket Type Extensions
declare module 'ws' {
  interface WebSocket {
    isAlive?: boolean;
  }
}

/**
 * Global Type Utilities
 */
declare global {
  /**
   * Make all properties in T optional recursively
   */
  type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
  };

  /**
   * Make all properties in T required recursively
   */
  type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
  };

  /**
   * Make all properties in T readonly recursively
   */
  type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
  };

  /**
   * Extract keys from T where value extends U
   */
  type KeysOfType<T, U> = {
    [K in keyof T]: T[K] extends U ? K : never;
  }[keyof T];

  /**
   * Omit keys from T where value extends U
   */
  type OmitByType<T, U> = {
    [K in keyof T as T[K] extends U ? never : K]: T[K];
  };

  /**
   * Pick keys from T where value extends U
   */
  type PickByType<T, U> = {
    [K in keyof T as T[K] extends U ? K : never]: T[K];
  };

  /**
   * Make specific keys in T optional
   */
  type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

  /**
   * Make specific keys in T required
   */
  type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

  /**
   * Nullable type
   */
  type Nullable<T> = T | null;

  /**
   * Maybe type (nullable or undefined)
   */
  type Maybe<T> = T | null | undefined;

  /**
   * Promise type unwrapper
   */
  type Awaited<T> = T extends Promise<infer U> ? U : T;

  /**
   * Array element type
   */
  type ArrayElement<T> = T extends (infer U)[] ? U : never;

  /**
   * Function return type unwrapper
   */
  type ReturnTypeAsync<T extends (...args: any) => any> = Awaited<ReturnType<T>>;
}

/**
 * React Component Type Helpers
 */
declare namespace React {
  /**
   * Component with children prop
   */
  type FC<P = {}> = FunctionComponent<PropsWithChildren<P>>;

  /**
   * Component props extractor
   */
  type PropsOf<T> = T extends ComponentType<infer P> ? P : never;
}

export {};
