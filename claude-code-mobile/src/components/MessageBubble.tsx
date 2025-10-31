/**
 * MessageBubble Component
 * 
 * Based on react-native-gifted-chat pattern (spec lines 451-465)
 * - User messages: Right-aligned, teal background
 * - Assistant messages: Left-aligned, transparent background
 * - Includes timestamp, testID for expo-mcp testing
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message, MessageRole } from '../types/models';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
}

export const MessageBubble = React.memo<MessageBubbleProps>(
  ({ message, isUser }) => {
    const formatTime = (date: Date) => {
      const d = new Date(date);
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return (
      <View
        testID={`message-bubble-${message.id}`}
        style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}
      >
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text
            testID={`message-text-${message.id}`}
            style={[styles.text, isUser ? styles.userText : styles.assistantText]}
          >
            {message.content}
          </Text>
        </View>
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    );
  },
  (prevProps, nextProps) => prevProps.message.id === nextProps.message.id
);

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xxl,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
  },
  assistantBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.md,
    lineHeight: TYPOGRAPHY.fontSize.md * TYPOGRAPHY.lineHeight.normal,
  },
  userText: {
    color: COLORS.textDark,
  },
  assistantText: {
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: SPACING.xs,
  },
  userTimestamp: {
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  assistantTimestamp: {
    color: COLORS.textSecondary,
    textAlign: 'left',
  },
});

MessageBubble.displayName = 'MessageBubble';
