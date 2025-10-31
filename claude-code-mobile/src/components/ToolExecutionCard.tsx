/**
 * ToolExecutionCard Component
 * 
 * Displays tool execution with expand/collapse (spec lines 467-476)
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ToolExecution } from '../types/models';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';

interface ToolExecutionCardProps {
  tool: string;
  input: any;
  result?: string;
  error?: string;
}

export const ToolExecutionCard: React.FC<ToolExecutionCardProps> = ({
  tool,
  input,
  result,
  error,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      testID={`tool-card-${tool}`}
      style={styles.container}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text testID={`tool-name-${tool}`} style={styles.toolName}>
          {tool}
        </Text>
        <Text style={styles.expandIcon}>{expanded ? '▼' : '▶'}</Text>
      </View>
      
      {expanded && (
        <View testID={`tool-details-${tool}`} style={styles.details}>
          <Text style={styles.label}>Input:</Text>
          <Text style={styles.input}>{JSON.stringify(input, null, 2)}</Text>
          
          {result && (
            <>
              <Text style={styles.label}>Result:</Text>
              <Text style={styles.result}>{result}</Text>
            </>
          )}
          
          {error && (
            <>
              <Text style={styles.label}>Error:</Text>
              <Text style={styles.error}>{error}</Text>
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toolName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
  },
  expandIcon: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
  },
  details: {
    marginTop: SPACING.sm,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  input: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  result: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  error: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
});
