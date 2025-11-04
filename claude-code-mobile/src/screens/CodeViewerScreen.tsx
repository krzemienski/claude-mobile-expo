/**
 * CodeViewerScreen
 * Based on spec lines 609-675
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHTTP } from '../contexts/HTTPContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

interface ManualNavigationProps {
  navigate: (screen: string) => void;
}

export const CodeViewerScreen: React.FC<ManualNavigationProps> = ({ navigate }) => {
  const { httpService } = useHTTP();
  const currentFile = useAppStore((state) => state.currentFile);
  const filePath = currentFile?.path || '';
  const fileName = filePath.split('/').pop() || 'Unknown';
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFile();
  }, [filePath]);

  const loadFile = async () => {
    if (!httpService) return;
    setIsLoading(true);
    try {
      const data = await httpService.httpClient.readFile(filePath);
      setContent(data.content);
    } catch (error) {
      console.error('Failed to load file:', error);
      setContent(`Error loading file: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const lineCount = content.split('\n').length;

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View testID="codeviewer-header" style={styles.header}>
          <TouchableOpacity testID="back-button" onPress={() => navigate('FileBrowser')}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 60, paddingHorizontal: SPACING.base, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backIcon: { fontSize: 28, color: COLORS.primary },
  title: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary, flex: 1, textAlign: 'center' },
  fileInfo: { padding: SPACING.base, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  fileName: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary },
  fileStats: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textSecondary, marginTop: SPACING.xs },
  codeContainer: { flex: 1, backgroundColor: COLORS.codeBackground, padding: SPACING.base },
  code: { fontFamily: TYPOGRAPHY.fontFamily.mono, fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.codeText, lineHeight: 20 },
  footer: { height: 40, backgroundColor: COLORS.card, justifyContent: 'center', paddingHorizontal: SPACING.base, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
});
