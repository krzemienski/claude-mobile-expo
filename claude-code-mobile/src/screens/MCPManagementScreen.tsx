/**
 * MCPManagementScreen - Manage MCP servers
 * Phase 6, Task 6.3
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';

interface MCPServer {
  id: string;
  name: string;
  url?: string;
  transport: string;
  enabled: boolean;
  tools_count: number;
}

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

interface ManualNavigationProps {
  navigate: (screen: string) => void;
}

export const MCPManagementScreen: React.FC<ManualNavigationProps> = ({ navigate }) => {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8001/v1/mcp/servers');
      const data = await response.json();
      setServers(data);
    } catch (error) {
      console.error('Failed to load MCP servers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderServer = ({ item }: { item: MCPServer }) => (
    <View style={styles.serverCard}>
      <View style={styles.serverHeader}>
        <Text style={styles.serverName}>{item.name}</Text>
        <View style={[styles.transportBadge, item.transport === 'http' ? styles.httpBadge : styles.stdioBadge]}>
          <Text style={styles.badgeText}>{item.transport.toUpperCase()}</Text>
        </View>
      </View>
      {item.url && <Text style={styles.serverUrl} numberOfLines={1}>{item.url}</Text>}
      <View style={styles.serverFooter}>
        <Text style={styles.toolsCount}>{item.tools_count} tools</Text>
        <Switch value={item.enabled} onValueChange={() => {}} trackColor={{ false: '#767577', true: COLORS.primary }} />
      </View>
    </View>
  );

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigate('Chat')}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>MCP Servers</Text>
          <TouchableOpacity>
            <Text style={styles.addIcon}>+</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={servers}
          renderItem={renderServer}
          keyExtractor={(item) => item.id}
          refreshing={isLoading}
          onRefresh={loadServers}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No MCP servers configured</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 60, paddingHorizontal: SPACING.base, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary },
  backIcon: { fontSize: 28, color: COLORS.primary },
  addIcon: { fontSize: 32, color: COLORS.primary },
  serverCard: { backgroundColor: COLORS.card, padding: SPACING.base, marginHorizontal: SPACING.base, marginVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border },
  serverHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  serverName: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.textPrimary },
  transportBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.sm },
  httpBadge: { backgroundColor: COLORS.primary },
  stdioBadge: { backgroundColor: COLORS.secondary },
  badgeText: { fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: '#fff' },
  serverUrl: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  serverFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toolsCount: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textTertiary },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyText: { fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.textPrimary },
});
