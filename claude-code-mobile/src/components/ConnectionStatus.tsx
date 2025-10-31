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
import { ConnectionStatus as Status } from '../types/websocket';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

interface ConnectionStatusProps {
  status: Status;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  const dotScale = useSharedValue(1);

  useEffect(() => {
    // Pulse animation when connecting/reconnecting
    if (status === Status.CONNECTING || status === Status.RECONNECTING) {
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
      case Status.CONNECTED:
        return COLORS.success;
      case Status.CONNECTING:
      case Status.RECONNECTING:
        return COLORS.warning;
      case Status.DISCONNECTED:
      case Status.ERROR:
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case Status.CONNECTED:
        return 'Connected';
      case Status.CONNECTING:
        return 'Connecting...';
      case Status.RECONNECTING:
        return 'Reconnecting...';
      case Status.DISCONNECTED:
        return 'Disconnected';
      case Status.ERROR:
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
};

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
