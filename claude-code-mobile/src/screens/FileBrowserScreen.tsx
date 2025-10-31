/**
 * FileBrowserScreen
 * Based on spec lines 527-606
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'expo-linear-gradient';
import { FileItem } from '../components/FileItem';
import { FileMetadata, FileType } from '../types/models';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';
import type { FileBrowserScreenProps } from '../types/navigation';

export const FileBrowserScreen: React.FC<FileBrowserScreenProps> = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState('');
  const currentPath = route.params?.path || '/project';
  
  // Mock files for now - would be loaded from WebSocket service
  const files: FileMetadata[] = [
    { path: 'src', name: 'src', extension: '', size: 0, type: FileType.DIRECTORY, lastModified: new Date() },
    { path: 'App.tsx', name: 'App.tsx', extension: '.tsx', size: 1234, type: FileType.FILE, lastModified: new Date() },
    { path: 'package.json', name: 'package.json', extension: '.json', size: 567, type: FileType.FILE, lastModified: new Date() },
  ];

  const handleFilePress = (file: FileMetadata) => {
    if (file.type === FileType.DIRECTORY) {
      navigation.push('FileBrowser', { path: file.path });
    } else {
      navigation.navigate('CodeViewer', { filePath: file.path, fileName: file.name });
    }
  };

  return (
    <LinearGradient colors={[COLORS.backgroundGradient.start, COLORS.backgroundGradient.middle, COLORS.backgroundGradient.end]} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View testID="filebrowser-header" style={styles.header}>
          <TouchableOpacity testID="back-button" onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Files</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            testID="file-search-input"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search files..."
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        <View style={styles.pathIndicator}>
          <Text testID="current-path" style={styles.pathText}>{currentPath}</Text>
        </View>

        <FlatList
          testID="file-list"
          data={files}
          renderItem={({ item }) => <FileItem file={item} onPress={() => handleFilePress(item)} />}
          keyExtractor={(item) => item.path}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 60, paddingHorizontal: SPACING.base, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backIcon: { fontSize: 28, color: COLORS.primary },
  title: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary },
  searchContainer: { flexDirection: 'row', alignItems: 'center', height: 48, marginHorizontal: SPACING.base, marginVertical: SPACING.md, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.base },
  searchIcon: { fontSize: 20, marginRight: SPACING.sm },
  searchInput: { flex: 1, fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textPrimary },
  pathIndicator: { height: 40, backgroundColor: 'rgba(0, 0, 0, 0.3)', paddingHorizontal: SPACING.base, justifyContent: 'center', marginBottom: SPACING.sm },
  pathText: { fontSize: TYPOGRAPHY.fontSize.base, fontFamily: TYPOGRAPHY.fontFamily.mono, color: COLORS.primary, fontWeight: TYPOGRAPHY.fontWeight.semibold },
});
