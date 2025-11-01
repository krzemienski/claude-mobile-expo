/**
 * ConnectionStatus Component
 * 
 * Shows connection status with animated dot (spec lines 518-522)
 * - Green: Connected
 * - Orange: Connecting/Reconnecting
 * - Red: Disconnected/Error
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ConnectionStatus as ConnectionStatusType } from '../services/http/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const dotScale = useSharedValue(1);

  useEffect(() => {
    // Pulse animation when connecting/reconnecting
    if (status === 'connecting' || status === 'reconnecting') {
      dotScale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        false
      );
    } else {
      dotScale.value = 1;
    }
  }, [status]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  const getDotColor = () => {
    switch (status) {
      case 'connected':
        return COLORS.success;
      case 'connecting':
      case 'reconnecting':
        return COLORS.warning;
      case 'disconnected':
      case 'error':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <View testID="connection-status" style={styles.container}>
      <Animated.View
        testID={`connection-dot-${status}`}
        style={[
          styles.dot,
          { backgroundColor: getDotColor() },
          dotStyle,
        ]}
      />
      <Text testID="connection-text" style={styles.text}>
        {getStatusText()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});
