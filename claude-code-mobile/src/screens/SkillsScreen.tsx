/**
 * SkillsScreen - Manage Claude Code Skills
 * Phase 9, Task 9.2
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

interface Skill {
  name: string;
  path: string;
  description: string;
  size: number;
}

interface ManualNavigationProps {
  navigate: (screen: string) => void;
}

export const SkillsScreen: React.FC<ManualNavigationProps> = ({ navigate }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8001/v1/skills');
      const data = await response.json();
      setSkills(data);
    } catch (error) {
      console.error('Failed to load skills:', error);
      Alert.alert('Error', 'Failed to load skills');
    } finally {
      setIsLoading(false);
    }
  };

  const viewSkillContent = async (skillName: string) => {
    try {
      const response = await fetch(`http://localhost:8001/v1/skills/${skillName}`);
      const data = await response.json();
      Alert.alert(
        skillName,
        data.content.substring(0, 500) + (data.content.length > 500 ? '...' : ''),
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to get skill:', error);
      Alert.alert('Error', 'Failed to load skill content');
    }
  };

  const deleteSkill = async (skillName: string) => {
    Alert.alert(
      'Delete Skill',
      `Are you sure you want to delete "${skillName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`http://localhost:8001/v1/skills/${skillName}`, {
                method: 'DELETE',
              });
              loadSkills(); // Refresh
            } catch (error) {
              console.error('Failed to delete skill:', error);
              Alert.alert('Error', 'Failed to delete skill');
            }
          },
        },
      ]
    );
  };

  const renderSkill = ({ item }: { item: Skill }) => (
    <TouchableOpacity
      style={styles.skillCard}
      onPress={() => viewSkillContent(item.name)}
      onLongPress={() => deleteSkill(item.name)}
    >
      <Text style={styles.skillName}>{item.name}</Text>
      <Text style={styles.skillDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <Text style={styles.skillSize}>{(item.size / 1024).toFixed(1)} KB</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigate('Chat')}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Skills</Text>
          <TouchableOpacity onPress={loadSkills}>
            <Text style={styles.refreshIcon}>🔄</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={skills}
          renderItem={renderSkill}
          keyExtractor={(item) => item.name}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={loadSkills} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No skills found</Text>
              <Text style={styles.emptySubtext}>Skills from ~/.claude/skills/ will appear here</Text>
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
  skillCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.base,
    marginHorizontal: SPACING.base,
    marginVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skillName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  skillDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  skillSize: {
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
