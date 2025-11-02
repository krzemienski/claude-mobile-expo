/**
 * ProjectsScreen - Show all Claude Code projects on host
 * Phase 6, Task 6.1
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHTTP } from '../contexts/HTTPContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';

interface Project {
  name: string;
  path: string;
  has_claudemd: boolean;
  has_git: boolean;
  session_count: number;
}

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Projects'>;

export const ProjectsScreen: React.FC<Props> = ({ navigation }) => {
  const { httpService } = useHTTP();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    if (!httpService) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8001/v1/host/discover-projects?scan_path=/Users/nick/Desktop&max_depth=2');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity style={styles.projectCard} onPress={() => console.log('Project tapped:', item.name)}>
      <Text style={styles.projectName}>{item.name}</Text>
      <Text style={styles.projectPath} numberOfLines={1}>{item.path}</Text>
      <View style={styles.badges}>
        {item.has_git && <View style={styles.badge}><Text style={styles.badgeText}>GIT</Text></View>}
        {item.has_claudemd && <View style={styles.badge}><Text style={styles.badgeText}>CLAUDE.md</Text></View>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Projects</Text>
          <TouchableOpacity onPress={loadProjects}>
            <Text style={styles.refreshIcon}>🔄</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={projects}
          renderItem={renderProject}
          keyExtractor={(item) => item.path}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadProjects} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No projects found</Text>
              <TouchableOpacity style={styles.scanButton} onPress={loadProjects}>
                <Text style={styles.scanButtonText}>Scan for Projects</Text>
              </TouchableOpacity>
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
  refreshIcon: { fontSize: 24 },
  projectCard: { backgroundColor: COLORS.card, padding: SPACING.base, marginHorizontal: SPACING.base, marginVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border },
  projectName: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  projectPath: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  badges: { flexDirection: 'row', gap: SPACING.sm },
  badge: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.sm },
  badgeText: { fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.background },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyText: { fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.textPrimary, marginBottom: SPACING.base },
  scanButton: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg },
  scanButtonText: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: '#fff' },
});
