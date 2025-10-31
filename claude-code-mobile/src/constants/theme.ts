/**
 * Claude Code Mobile - Design System
 * 
 * Complete theme system based on specification (lines 217-373)
 * - Purple gradient background (#0f0c29 → #302b63 → #24243e)
 * - Teal primary color (#4ecdc4)
 * - System font with Menlo mono for code
 * - 8-point spacing grid
 */

export const COLORS = {
  // Background Gradients (spec lines 221-225)
  backgroundGradient: {
    start: '#0f0c29',    // Deep purple-blue
    middle: '#302b63',   // Medium purple
    end: '#24243e',      // Dark purple-gray
  },
  
  // Primary Actions (spec lines 227-230)
  primary: '#4ecdc4',        // Teal (buttons, links, highlights)
  primaryDark: '#3db0a8',    // Darker teal (hover/pressed states)
  primaryLight: '#6de3db',   // Lighter teal (disabled states)
  
  // Text Colors (spec lines 232-236)
  textPrimary: '#ecf0f1',    // Off-white (primary text)
  textSecondary: '#7f8c8d',  // Gray (secondary text)
  textTertiary: '#95a5a6',   // Light gray (tertiary text)
  textDark: '#0f0c29',       // Dark (on light backgrounds)
  
  // Status Colors (spec lines 238-242)
  success: '#2ecc71',        // Green (success states)
  warning: '#f39c12',        // Orange (warning states)
  error: '#e74c3c',          // Red (error states)
  info: '#3498db',           // Blue (info states)
  
  // Functional Colors (spec lines 244-248)
  overlay: 'rgba(0, 0, 0, 0.5)',           // Modal overlays
  border: 'rgba(255, 255, 255, 0.1)',      // Borders and dividers
  surface: 'rgba(255, 255, 255, 0.05)',    // Cards and surfaces
  surfaceHighlight: 'rgba(255, 255, 255, 0.1)',
  
  // Code Highlighting (spec lines 250-256)
  codeBackground: '#2c3e50',
  codeText: '#ecf0f1',
  codeKeyword: '#4ecdc4',
  codeString: '#2ecc71',
  codeComment: '#7f8c8d',
  codeNumber: '#f39c12',
} as const;

export const TYPOGRAPHY = {
  // Font Families (spec lines 265-269)
  fontFamily: {
    primary: 'System',      // San Francisco on iOS
    mono: 'Menlo',          // Monospace for code
    code: 'Menlo',          // Code display
  },
  
  // Font Sizes (spec lines 272-280)
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
  
  // Font Weights (spec lines 283-289)
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Line Heights (spec lines 292-297)
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  
  // Letter Spacing (spec lines 300-305)
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;

export const SPACING = {
  // 8-Point Grid System (spec lines 314-324)
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

export const BORDER_RADIUS = {
  // Border Radius Values (spec lines 330-338)
  none: 0,
  sm: 4,      // Small radius (buttons)
  md: 8,      // Medium radius (cards)
  lg: 12,     // Large radius (modals)
  xl: 16,     // Extra large (sheets)
  xxl: 20,    // Message bubbles
  full: 9999, // Circular elements
} as const;

export const SHADOWS = {
  // Shadows and Elevation (spec lines 344-373)
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

// Helper function to create gradient background props
export const createGradientBackground = () => ({
  colors: [
    COLORS.backgroundGradient.start,
    COLORS.backgroundGradient.middle,
    COLORS.backgroundGradient.end,
  ],
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
});

// Export combined theme
export const theme = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  createGradientBackground,
} as const;

export default theme;
