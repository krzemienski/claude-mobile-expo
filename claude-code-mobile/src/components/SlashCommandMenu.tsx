/**
 * SlashCommandMenu Component
 * 
 * Filtered command list with slide animation (spec lines 436-442)
 */

import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';

interface Command {
  name: string;
  description: string;
}

const COMMANDS: Command[] = [
  { name: '/help', description: 'Show available commands' },
  { name: '/clear', description: 'Clear conversation history' },
  { name: '/compact', description: 'Compact conversation context' },
  { name: '/cost', description: 'Show API usage costs' },
  { name: '/mcp', description: 'View MCP servers' },
  { name: '/config', description: 'Open configuration' },
];

interface SlashCommandMenuProps {
  filterText: string;
  onSelectCommand: (command: string) => void;
}

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  filterText,
  onSelectCommand,
}) => {
  const filteredCommands = useMemo(() => {
    if (!filterText || filterText === '/') {
      return COMMANDS;
    }
    
    const filter = filterText.toLowerCase();
    return COMMANDS.filter(
      (cmd) =>
        cmd.name.toLowerCase().includes(filter) ||
        cmd.description.toLowerCase().includes(filter)
    );
  }, [filterText]);

  const renderItem = ({ item }: { item: Command }) => (
    <TouchableOpacity
      testID={`slash-command-${item.name}`}
      style={styles.item}
      onPress={() => onSelectCommand(item.name)}
      activeOpacity={0.7}
    >
      <Text style={styles.commandName}>{item.name}</Text>
      <Text style={styles.commandDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  if (filteredCommands.length === 0) {
    return null;
  }

  return (
    <View testID="slash-command-menu" style={styles.container}>
      <FlatList
        data={filteredCommands}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 300,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  list: {
    flexGrow: 0,
  },
  item: {
    height: 60,
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  commandName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
    marginBottom: SPACING.xxs,
  },
  commandDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
});
