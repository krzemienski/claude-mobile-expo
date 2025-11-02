/**
 * ThinkingAccordion - Display Claude's Thinking Process
 * Phase 9, Task 9.1
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';

interface ThinkingStep {
  content: string;
  step_number: number;
  timestamp?: string;
}

interface ThinkingAccordionProps {
  thoughts: ThinkingStep[];
}

export const ThinkingAccordion: React.FC<ThinkingAccordionProps> = ({ thoughts }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  if (!thoughts || thoughts.length === 0) {
    return null;
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleStep = (stepNumber: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepNumber)) {
      newExpanded.delete(stepNumber);
    } else {
      newExpanded.add(stepNumber);
    }
    setExpandedSteps(newExpanded);
  };

  const expandAll = () => {
    setExpandedSteps(new Set(thoughts.map(t => t.step_number)));
  };

  const collapseAll = () => {
    setExpandedSteps(new Set());
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggleExpand}>
        <Text style={styles.headerIcon}>{isExpanded ? '▼' : '▶'}</Text>
        <Text style={styles.headerText}>
          Show Thinking ({thoughts.length} steps)
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <>
          <View style={styles.controls}>
            <TouchableOpacity onPress={expandAll} style={styles.controlButton}>
              <Text style={styles.controlText}>Expand All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={collapseAll} style={styles.controlButton}>
              <Text style={styles.controlText}>Collapse All</Text>
            </TouchableOpacity>
          </View>

          {thoughts.map((thought) => (
            <View key={thought.step_number} style={styles.thoughtContainer}>
              <TouchableOpacity
                style={styles.thoughtHeader}
                onPress={() => toggleStep(thought.step_number)}
              >
                <Text style={styles.stepNumber}>
                  {expandedSteps.has(thought.step_number) ? '▼' : '▶'} Step {thought.step_number}
                </Text>
                {thought.timestamp && (
                  <Text style={styles.timestamp}>{new Date(thought.timestamp).toLocaleTimeString()}</Text>
                )}
              </TouchableOpacity>

              {expandedSteps.has(thought.step_number) && (
                <View style={styles.thoughtContent}>
                  <Text style={styles.thoughtText}>{thought.content}</Text>
                </View>
              )}
            </View>
          ))}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.secondary,
  },
  headerIcon: {
    fontSize: 12,
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  headerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
  },
  controls: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  controlButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.sm,
  },
  controlText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  thoughtContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  thoughtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
  },
  stepNumber: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
  },
  thoughtContent: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  thoughtText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.sm,
  },
});
