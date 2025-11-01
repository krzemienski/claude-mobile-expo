/**
 * LoadingSkeleton Component
 * Animated skeleton loader for better perceived performance
 * Shows while content is loading
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BORDER_RADIUS.sm,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.surface,
  },
});

/**
 * Preset skeleton components for common use cases
 */

export const MessageSkeleton: React.FC = () => (
  <View style={skeletonStyles.messageContainer}>
    <LoadingSkeleton width={60} height={16} style={skeletonStyles.marginBottom} />
    <LoadingSkeleton width="80%" height={14} style={skeletonStyles.marginBottom} />
    <LoadingSkeleton width="60%" height={14} />
  </View>
);

export const SessionSkeleton: React.FC = () => (
  <View style={skeletonStyles.sessionCard}>
    <LoadingSkeleton width="70%" height={18} style={skeletonStyles.marginBottom} />
    <LoadingSkeleton width="40%" height={14} style={skeletonStyles.marginBottom} />
    <LoadingSkeleton width="30%" height={12} />
  </View>
);

export const FileSkeleton: React.FC = () => (
  <View style={skeletonStyles.fileItem}>
    <LoadingSkeleton width={40} height={40} borderRadius={BORDER_RADIUS.sm} />
    <View style={skeletonStyles.fileInfo}>
      <LoadingSkeleton width="60%" height={16} style={skeletonStyles.marginBottom} />
      <LoadingSkeleton width="40%" height={12} />
    </View>
  </View>
);

export const ProjectSkeleton: React.FC = () => (
  <View style={skeletonStyles.projectCard}>
    <LoadingSkeleton width="80%" height={20} style={skeletonStyles.marginBottom} />
    <LoadingSkeleton width="100%" height={14} style={skeletonStyles.marginBottom} />
    <View style={skeletonStyles.badgeRow}>
      <LoadingSkeleton width={60} height={24} borderRadius={BORDER_RADIUS.sm} />
      <LoadingSkeleton width={80} height={24} borderRadius={BORDER_RADIUS.sm} />
    </View>
  </View>
);

const skeletonStyles = StyleSheet.create({
  marginBottom: {
    marginBottom: SPACING.xs,
  },
  messageContainer: {
    padding: SPACING.base,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  sessionCard: {
    padding: SPACING.base,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
    gap: SPACING.base,
  },
  fileInfo: {
    flex: 1,
  },
  projectCard: {
    padding: SPACING.base,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
});
