/**
 * FileBrowserScreen
 * Based on spec lines 527-606
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHTTP } from '../contexts/HTTPContext';
import { FileItem } from '../components/FileItem';
import { FileMetadata, FileType } from '../types/models';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';
import type { FileBrowserScreenProps } from '../types/navigation';

export const FileBrowserScreen: React.FC<FileBrowserScreenProps> = ({ navigation, route }) => {
  const { httpService } = useHTTP();
  const [searchText, setSearchText] = useState('');
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentPath = route.params?.path || '/Users/nick/Desktop/claude-mobile-expo';

  useEffect(() => {
    loadFiles();
  }, [currentPath]);

  const loadFiles = async () => {
    if (!httpService) return;
    setIsLoading(true);
    try {
      const data = await httpService.httpClient.listFiles(currentPath);
      const mapped = data.map((f: any) => ({
        path: f.path,
        name: f.name,
        extension: '',
        size: f.size,
        type: f.type === 'directory' ? FileType.DIRECTORY : FileType.FILE,
        lastModified: new Date(f.modified),
      }));
      setFiles(mapped);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilePress = (file: FileMetadata) => {
    if (file.type === FileType.DIRECTORY) {
      navigation.push('FileBrowser', { path: file.path });
    } else {
      navigation.navigate('CodeViewer', { filePath: file.path, fileName: file.name });
    }
  };

  return (
    <View style={styles.background}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 60, paddingHorizontal: SPACING.base, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backIcon: { fontSize: 28, color: COLORS.primary },
  title: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary },
  searchContainer: { flexDirection: 'row', alignItems: 'center', height: 48, marginHorizontal: SPACING.base, marginVertical: SPACING.md, backgroundColor: COLORS.input, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.base },
  searchIcon: { fontSize: 20, marginRight: SPACING.sm },
  searchInput: { flex: 1, fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textPrimary },
  pathIndicator: { height: 40, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingHorizontal: SPACING.base, justifyContent: 'center', marginBottom: SPACING.sm },
  pathText: { fontSize: TYPOGRAPHY.fontSize.base, fontFamily: TYPOGRAPHY.fontFamily.mono, color: COLORS.primary, fontWeight: TYPOGRAPHY.fontWeight.semibold },
});
