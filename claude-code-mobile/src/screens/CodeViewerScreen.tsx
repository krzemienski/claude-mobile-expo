/**
 * CodeViewerScreen
 * Based on spec lines 609-675
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';
import type { CodeViewerScreenProps } from '../types/navigation';

export const CodeViewerScreen: React.FC<CodeViewerScreenProps> = ({ navigation, route }) => {
  const { filePath, fileName } = route.params;
  
  // Mock content - would be loaded from WebSocket service
  const content = `import React from 'react';\n\nexport const Component = () => {\n  return <View />;\n};`;
  const lineCount = content.split('\\n').length;

  return (
    <LinearGradient colors={[COLORS.backgroundGradient.start, COLORS.backgroundGradient.middle, COLORS.backgroundGradient.end]} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View testID="codeviewer-header" style={styles.header}>
          <TouchableOpacity testID="back-button" onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{fileName}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.fileInfo}>
          <Text style={styles.fileName}>{fileName}</Text>
          <Text style={styles.fileStats}>{lineCount} lines • typescript</Text>
        </View>

        <ScrollView testID="code-content" style={styles.codeContainer}>
          <Text testID="code-text" style={styles.code}>{content}</Text>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Characters: {content.length} • Words: {content.split(/\\s+/).length}</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 60, paddingHorizontal: SPACING.base, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backIcon: { fontSize: 28, color: COLORS.primary },
  title: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary, flex: 1, textAlign: 'center' },
  fileInfo: { padding: SPACING.base, backgroundColor: 'rgba(0, 0, 0, 0.3)', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  fileName: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary },
  fileStats: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textSecondary, marginTop: SPACING.xs },
  codeContainer: { flex: 1, backgroundColor: COLORS.codeBackground, padding: SPACING.base },
  code: { fontFamily: TYPOGRAPHY.fontFamily.mono, fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.codeText, lineHeight: 20 },
  footer: { height: 40, backgroundColor: 'rgba(0, 0, 0, 0.3)', justifyContent: 'center', paddingHorizontal: SPACING.base, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
});
