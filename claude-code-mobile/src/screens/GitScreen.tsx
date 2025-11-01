/**
 * GitScreen - Git operations UI
 * Phase 8, Task 8.2
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';

interface GitStatus {
  current_branch: string;
  modified: string[];
  staged: string[];
  untracked: string[];
  has_commits: boolean;
}

export const GitScreen: React.FC = ({ navigation }: any) => {
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [projectPath] = useState('/Users/nick/Desktop/claude-mobile-expo');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8001/v1/git/status?project_path=${encodeURIComponent(projectPath)}`);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to load git status:', error);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;

    try {
      const response = await fetch('http://localhost:8001/v1/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_path: projectPath, message: commitMessage }),
      });
      const result = await response.json();
      console.log('Commit created:', result);
      setCommitMessage('');
      loadStatus(); // Refresh
    } catch (error) {
      console.error('Failed to commit:', error);
    }
  };

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Git</Text>
          <TouchableOpacity onPress={loadStatus}>
            <Text style={styles.refreshIcon}>🔄</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {status && (
            <>
              <Text style={styles.sectionTitle}>Branch: {status.current_branch}</Text>

              {status.modified.length > 0 && (
                <>
                  <Text style={styles.fileListTitle}>Modified ({status.modified.length})</Text>
                  {status.modified.map((file) => (
                    <Text key={file} style={styles.fileName}>M {file}</Text>
                  ))}
                </>
              )}

              {status.untracked.length > 0 && (
                <>
                  <Text style={styles.fileListTitle}>Untracked ({status.untracked.length})</Text>
                  {status.untracked.map((file) => (
                    <Text key={file} style={styles.fileName}>? {file}</Text>
                  ))}
                </>
              )}

              <View style={styles.commitSection}>
                <Text style={styles.commitLabel}>Commit Message</Text>
                <TextInput
                  style={styles.commitInput}
                  value={commitMessage}
                  onChangeText={setCommitMessage}
                  placeholder="Enter commit message..."
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.commitButton, !commitMessage.trim() && styles.commitButtonDisabled]}
                  onPress={handleCommit}
                  disabled={!commitMessage.trim()}
                >
                  <Text style={styles.commitButtonText}>Commit Changes</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
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
  refreshIcon: { fontSize: 24 },
  content: { flex: 1, padding: SPACING.base },
  sectionTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.textPrimary, marginBottom: SPACING.md },
  fileListTitle: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.medium, color: COLORS.textSecondary, marginTop: SPACING.md, marginBottom: SPACING.sm },
  fileName: { fontSize: TYPOGRAPHY.fontSize.sm, fontFamily: TYPOGRAPHY.fontFamily.mono, color: COLORS.textPrimary, paddingVertical: SPACING.xs },
  commitSection: { marginTop: SPACING.xl, backgroundColor: COLORS.card, padding: SPACING.base, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border },
  commitLabel: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.medium, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  commitInput: { backgroundColor: COLORS.input, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textPrimary, minHeight: 100, marginBottom: SPACING.md },
  commitButton: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, alignItems: 'center' },
  commitButtonDisabled: { backgroundColor: COLORS.secondary },
  commitButtonText: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: '#fff' },
});
