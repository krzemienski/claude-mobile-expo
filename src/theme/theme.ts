/**
 * Theme System - Complete Design System Implementation
 * Based on Claude Code Mobile Expo Specification v1.0
 * 
 * This file contains all design tokens including colors, typography,
 * spacing, shadows, and other design primitives used throughout the app.
 */

import { TextStyle, ViewStyle } from 'react-native';

/**
 * Color Palette
 * Deep purple-blue gradient aesthetic with teal accents
 */
export const colors = {
  // Background Gradients
  backgroundGradient: {
    start: '#0f0c29',    // Deep purple-blue
    middle: '#302b63',   // Medium purple
    end: '#24243e',      // Dark purple-gray
  },
  
  // Primary Actions
  primary: '#4ecdc4',        // Teal (buttons, links, highlights)
  primaryDark: '#3db0a8',    // Darker teal (hover states)
  primaryLight: '#6de3db',   // Lighter teal (disabled states)
  
  // Text Colors
  textPrimary: '#ecf0f1',    // Off-white (primary text)
  textSecondary: '#7f8c8d',  // Gray (secondary text)
  textTertiary: '#95a5a6',   // Light gray (tertiary text)
  textDark: '#0f0c29',       // Dark (on light backgrounds)
  
  // Status Colors
  success: '#2ecc71',        // Green (success states)
  warning: '#f39c12',        // Orange (warning states)
  error: '#e74c3c',          // Red (error states)
  info: '#3498db',           // Blue (info states)
  
  // Functional Colors
  overlay: 'rgba(0, 0, 0, 0.5)',      // Modal overlays
  border: 'rgba(255, 255, 255, 0.1)', // Borders and dividers
  surface: 'rgba(255, 255, 255, 0.05)', // Cards and surfaces
  surfaceHighlight: 'rgba(255, 255, 255, 0.1)',
  
  // Code Highlighting
  codeBackground: '#2c3e50',
  codeText: '#ecf0f1',
  codeKeyword: '#4ecdc4',
  codeString: '#2ecc71',
  codeComment: '#7f8c8d',
  codeNumber: '#f39c12',
} as const;

/**
 * Typography System
 * Uses system fonts for optimal native rendering
 */
export const typography = {
  // Font Families
  fontFamily: {
    primary: 'System',           // San Francisco on iOS, Roboto on Android
    mono: 'Menlo',              // Monospace for code
    code: 'Menlo',              // Code display
  },
  
  // Font Sizes
  fontSize: {
    xs: 10,    // Timestamps, labels
    sm: 12,    // Secondary text
    base: 14,  // Body text
    md: 16,    // Primary text
    lg: 18,    // Headings
    xl: 20,    // Large headings
    xxl: 24,   // Extra large headings
    xxxl: 32,  // Hero text
  },
  
  // Font Weights
  fontWeight: {
    light: '300' as TextStyle['fontWeight'],
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;

/**
 * Spacing System
 * 8-point grid system for consistent spacing
 */
export const spacing = {
  xxs: 2,    // 2px - Minimal spacing
  xs: 4,     // 4px - Tight spacing
  sm: 8,     // 8px - Small spacing
  md: 12,    // 12px - Medium spacing
  base: 16,  // 16px - Base spacing (most common)
  lg: 20,    // 20px - Large spacing
  xl: 24,    // 24px - Extra large spacing
  xxl: 32,   // 32px - Extra extra large
  xxxl: 48,  // 48px - Maximum spacing
} as const;

/**
 * Border Radius System
 * Consistent rounded corners throughout the app
 */
export const borderRadius = {
  none: 0,
  sm: 4,      // Small radius (buttons)
  md: 8,      // Medium radius (cards)
  lg: 12,     // Large radius (modals)
  xl: 16,     // Extra large (sheets)
  xxl: 20,    // Message bubbles
  full: 9999, // Circular elements
} as const;

/**
 * Shadow and Elevation System
 * Consistent depth and elevation for UI elements
 */
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 16,
  },
} as const;

/**
 * Layout Constants
 * Fixed dimensions for standard UI elements
 */
export const layout = {
  // Header Heights
  headerHeight: 60,
  headerHeightWithSafeArea: 100,
  
  // Input Heights
  inputHeight: 80,
  inputMinHeight: 40,
  inputMaxHeight: 120,
  
  // Bottom Safe Area
  bottomSafeArea: 34, // iPhone X+ home indicator
  
  // Message Bubble Max Width
  messageBubbleMaxWidth: '85%',
  
  // Avatar Sizes
  avatarSm: 24,
  avatarMd: 32,
  avatarLg: 40,
  
  // Icon Sizes
  iconXs: 12,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
  
  // Button Heights
  buttonSm: 32,
  buttonMd: 44,
  buttonLg: 52,
  
  // Status Indicator
  statusIndicatorSize: 8,
} as const;

/**
 * Animation Timing
 * Consistent animation durations and easing
 */
export const animation = {
  // Duration
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  
  // Easing
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
  },
} as const;

/**
 * Z-Index System
 * Layering hierarchy for overlapping elements
 */
export const zIndex = {
  base: 0,
  dropdown: 100,
  modal: 200,
  overlay: 300,
  toast: 400,
  tooltip: 500,
} as const;

/**
 * Opacity Levels
 * Consistent transparency values
 */
export const opacity = {
  disabled: 0.5,
  hover: 0.8,
  pressed: 0.6,
  overlay: 0.5,
  tooltip: 0.9,
} as const;

/**
 * Component-Specific Styles
 * Pre-composed styles for common components
 */
export const components = {
  // Message Bubble Styles
  messageBubble: {
    user: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.xxl,
      padding: spacing.base,
      ...shadows.sm,
    } as ViewStyle,
    assistant: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xxl,
      padding: spacing.base,
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,
  },
  
  // Button Styles
  button: {
    primary: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      ...shadows.sm,
    } as ViewStyle,
    secondary: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,
  },
  
  // Input Styles
  input: {
    base: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      color: colors.textPrimary,
      fontSize: typography.fontSize.base,
      fontFamily: typography.fontFamily.primary,
    } as ViewStyle & TextStyle,
    focused: {
      borderColor: colors.primary,
      ...shadows.sm,
    } as ViewStyle,
  },
  
  // Card Styles
  card: {
    base: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,
    elevated: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      ...shadows.md,
    } as ViewStyle,
  },
  
  // Code Block Styles
  codeBlock: {
    container: {
      backgroundColor: colors.codeBackground,
      borderRadius: borderRadius.sm,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,
    text: {
      fontFamily: typography.fontFamily.code,
      fontSize: typography.fontSize.sm,
      color: colors.codeText,
      lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    } as TextStyle,
  },
} as const;

/**
 * Complete Theme Object
 * Export a single theme object with all design tokens
 */
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
  animation,
  zIndex,
  opacity,
  components,
} as const;

// Type exports for TypeScript support
export type Theme = typeof theme;
export type ThemeColors = typeof colors;
export type ThemeSpacing = typeof spacing;
export type ThemeTypography = typeof typography;

export default theme;
