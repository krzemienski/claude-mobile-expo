/**
 * SettingsScreen
 * Based on spec lines 678-756
 */

import React from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// LinearGradient removed - flat black theme
import { useAppStore } from '../store/useAppStore';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';
import type { SettingsScreenProps } from '../types/navigation';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View testID="settings-header" style={styles.header}>
          <TouchableOpacity testID="back-button" onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>🌐 Server Configuration</Text>
          <View style={styles.inputField}>
            <Text style={styles.label}>Server URL</Text>
            <TextInput
              testID="server-url-input"
              style={styles.input}
              value={settings.serverUrl}
              onChangeText={(url) => updateSettings({ serverUrl: url })}
              placeholder="http://localhost:8001"
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputField}>
            <Text style={styles.label}>Project Path</Text>
            <TextInput
              testID="project-path-input"
              style={styles.input}
              value={settings.projectPath}
              onChangeText={(path) => updateSettings({ projectPath: path })}
              placeholder="/path/to/project"
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputField}>
            <Text style={styles.label}>Claude Model</Text>
            <TextInput
              testID="model-input"
              style={styles.input}
              value={settings.model}
              onChangeText={(model) => updateSettings({ model })}
              placeholder="claude-3-5-haiku-20241022"
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={styles.sectionTitle}>🎨 UI Preferences</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Auto-scroll</Text>
            <Switch
              testID="auto-scroll-toggle"
              value={settings.autoScroll}
              onValueChange={(val) => updateSettings({ autoScroll: val })}
              trackColor={{ false: '#767577', true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Haptic feedback</Text>
            <Switch
              testID="haptic-toggle"
              value={settings.hapticFeedback}
              onValueChange={(val) => updateSettings({ hapticFeedback: val })}
              trackColor={{ false: '#767577', true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>

          <Text style={styles.sectionTitle}>⚡ Actions</Text>
          <TouchableOpacity testID="view-sessions-button" style={styles.actionButton} onPress={() => navigation.navigate('Sessions')}>
            <Text style={styles.actionButtonText}>📂 View Sessions</Text>
          </TouchableOpacity>

          <View style={styles.about}>
            <Text style={styles.aboutText}>Claude Code Mobile v1.0.0</Text>
            <Text style={styles.aboutText}>Built with React Native & Expo</Text>
          </View>
        </ScrollView>
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
  backIcon: { fontSize: 28, color: COLORS.primary },
  title: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary },
  content: { flex: 1 },
  sectionTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary, marginTop: SPACING.xl, marginBottom: SPACING.md, paddingHorizontal: SPACING.base },
  inputField: { marginHorizontal: SPACING.base, marginVertical: SPACING.sm },
  label: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  input: { height: 56, backgroundColor: COLORS.input, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.base, fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textPrimary },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 56, paddingHorizontal: SPACING.base, marginVertical: SPACING.xs },
  toggleLabel: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textPrimary },
  actionButton: { height: 48, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.lg, marginHorizontal: SPACING.base, marginVertical: SPACING.sm, alignItems: 'center', justifyContent: 'center' },
  actionButtonText: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, color: '#fff' },
  about: { padding: SPACING.base, marginTop: SPACING.xl },
  aboutText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, textAlign: 'left', lineHeight: 24 },
});
