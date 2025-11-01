/**
 * SessionsScreen
 * Based on spec lines 758-774
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// LinearGradient removed - flat black theme
import { useAppStore } from '../store/useAppStore';
import { useHTTP } from '../contexts/HTTPContext';
import { Session } from '../types/models';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';
import type { SessionsScreenProps } from '../types/navigation';

export const SessionsScreen: React.FC<SessionsScreenProps> = ({ navigation }) => {
  const { httpService } = useHTTP();
  const [isLoading, setIsLoading] = useState(false);
  
  const sessions = useAppStore((state) => state.sessions);
  const setCurrentSession = useAppStore((state) => state.setCurrentSession);
  const deleteSession = useAppStore((state) => state.deleteSession);

  // Load sessions from backend on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    if (!httpService) return;
    
    setIsLoading(true);
    try {
      const response = await httpService.listSessions();
      // TODO: Update Zustand store with backend sessions
      // For now, just log them
      console.log('Backend sessions:', response);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const handleSelectSession = (session: Session) => {
    setCurrentSession(session);
    navigation.navigate('Chat');
  };

  const handleDeleteSession = async (sessionId: string) => {
    // Delete from backend first
    if (httpService) {
      try {
        await httpService.deleteSession(sessionId);
      } catch (error) {
        console.error('Failed to delete session from backend:', error);
      }
    }
    
    // Delete from local store
    deleteSession(sessionId);
  };

  const renderSession = ({ item }: { item: Session }) => (
    <TouchableOpacity
      testID={`session-item-${item.id}`}
      style={styles.sessionItem}
      onPress={() => handleSelectSession(item)}
    >
      <View style={styles.sessionContent}>
        <Text style={styles.projectPath} numberOfLines={1}>📁 {item.projectPath}</Text>
        <Text style={styles.sessionInfo}>
          {item.conversationHistory.length} messages • {formatTimeAgo(item.lastActive)}
        </Text>
      </View>
      <TouchableOpacity
        testID={`delete-session-${item.id}`}
        onPress={() => handleDeleteSession(item.id)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteIcon}>🗑</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View testID="sessions-header" style={styles.header}>
          <TouchableOpacity testID="back-button" onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Your Sessions</Text>
          <TouchableOpacity testID="refresh-button" onPress={loadSessions}>
            <Text style={styles.refreshIcon}>🔄</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          testID="sessions-list"
          data={sessions}
          renderItem={renderSession}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View testID="no-sessions" style={styles.emptyState}>
              <Text style={styles.emptyText}>No sessions yet</Text>
              <Text style={styles.emptySubtext}>Create one from Chat screen</Text>
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
  backIcon: { fontSize: 28, color: COLORS.primary },
  refreshIcon: { fontSize: 24 },
  title: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary },
  sessionItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING.base, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, marginHorizontal: SPACING.base, marginVertical: SPACING.xs },
  sessionContent: { flex: 1 },
  projectPath: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  sessionInfo: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  deleteButton: { padding: SPACING.sm },
  deleteIcon: { fontSize: 20 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.xxxl },
  emptyText: { fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.fontWeight.semibold },
  emptySubtext: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textSecondary, marginTop: SPACING.sm },
});
