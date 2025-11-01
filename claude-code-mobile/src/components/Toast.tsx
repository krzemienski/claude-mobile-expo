/**
 * Toast Component
 * Simple toast notification system for feedback
 * Shows temporary messages at bottom of screen
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
  visible: boolean;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onHide,
  visible,
}) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  const getToastColor = (): string => {
    switch (type) {
      case 'success':
        return COLORS.success;
      case 'error':
        return COLORS.error;
      case 'warning':
        return COLORS.warning;
      case 'info':
      default:
        return COLORS.info;
    }
  };

  const getToastIcon = (): string => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  if (!visible && translateY._value === 100) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          borderLeftColor: getToastColor(),
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: getToastColor() }]}>
        <Text style={styles.icon}>{getToastIcon()}</Text>
      </View>
      <Text style={styles.message} numberOfLines={3}>
        {message}
      </Text>
    </Animated.View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: SPACING.base,
    right: SPACING.base,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: width - SPACING.base * 2,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  icon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: '#ffffff',
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  message: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    lineHeight: TYPOGRAPHY.fontSize.md * 1.4,
  },
});

/**
 * Usage Example:
 *
 * const [toastVisible, setToastVisible] = useState(false);
 * const [toastMessage, setToastMessage] = useState('');
 * const [toastType, setToastType] = useState<ToastType>('info');
 *
 * const showToast = (message: string, type: ToastType = 'info') => {
 *   setToastMessage(message);
 *   setToastType(type);
 *   setToastVisible(true);
 * };
 *
 * return (
 *   <View>
 *     {/* Your content *\/}
 *     <Toast
 *       message={toastMessage}
 *       type={toastType}
 *       visible={toastVisible}
 *       onHide={() => setToastVisible(false)}
 *       duration={3000}
 *     />
 *   </View>
 * );
 */
