/**
 * AgentsScreen - Manage Claude Code Agents
 * Phase 9, Task 9.3
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

interface Agent {
  name: string;
  path: string;
  description: string;
  subagent_type: string;
  size: number;
}

type Props = NativeStackScreenProps<RootStackParamList, 'Agents'>;

export const AgentsScreen: React.FC<Props> = ({ navigation }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8001/v1/agents');
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Failed to load agents:', error);
      Alert.alert('Error', 'Failed to load agents');
    } finally {
      setIsLoading(false);
    }
  };

  const viewAgentContent = async (agentName: string) => {
    try {
      const response = await fetch(`http://localhost:8001/v1/agents/${agentName}`);
      const data = await response.json();
      Alert.alert(
        agentName,
        data.content.substring(0, 500) + (data.content.length > 500 ? '...' : ''),
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to get agent:', error);
      Alert.alert('Error', 'Failed to load agent content');
    }
  };

  const deleteAgent = async (agentName: string) => {
    Alert.alert(
      'Delete Agent',
      `Are you sure you want to delete "${agentName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`http://localhost:8001/v1/agents/${agentName}`, {
                method: 'DELETE',
              });
              loadAgents(); // Refresh
            } catch (error) {
              console.error('Failed to delete agent:', error);
              Alert.alert('Error', 'Failed to delete agent');
            }
          },
        },
      ]
    );
  };

  const renderAgent = ({ item }: { item: Agent }) => (
    <TouchableOpacity
      style={styles.agentCard}
      onPress={() => viewAgentContent(item.name)}
      onLongPress={() => deleteAgent(item.name)}
    >
      <View style={styles.agentHeader}>
        <Text style={styles.agentName}>{item.name}</Text>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{item.subagent_type}</Text>
        </View>
      </View>
      <Text style={styles.agentDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <Text style={styles.agentSize}>{(item.size / 1024).toFixed(1)} KB</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Agents</Text>
          <TouchableOpacity onPress={loadAgents}>
            <Text style={styles.refreshIcon}>🔄</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={agents}
          renderItem={renderAgent}
          keyExtractor={(item) => item.name}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={loadAgents} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No agents found</Text>
              <Text style={styles.emptySubtext}>Agents from ~/.claude/agents/ will appear here</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backIcon: { fontSize: 28, color: COLORS.textPrimary },
  title: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary },
  refreshIcon: { fontSize: 24 },
  listContent: { paddingBottom: SPACING.xl },
  agentCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.base,
    marginHorizontal: SPACING.base,
    marginVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  agentName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  typeBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  typeBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.background,
  },
  agentDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  agentSize: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xxxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
  },
});
