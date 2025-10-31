/**
 * FileItem Component
 * 
 * Displays file/directory with icon and chevron (spec lines 576-586)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FileMetadata, FileType } from '../types/models';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';

interface FileItemProps {
  file: FileMetadata;
  onPress: () => void;
}

const getFileIcon = (file: FileMetadata): string => {
  if (file.type === FileType.DIRECTORY) return '📁';
  
  const ext = file.extension.toLowerCase();
  switch (ext) {
    case '.ts':
    case '.tsx':
      return '📘';
    case '.js':
    case '.jsx':
      return '📙';
    case '.json':
      return '📋';
    case '.md':
      return '📝';
    case '.css':
    case '.scss':
      return '🎨';
    case '.html':
      return '🌐';
    case '.png':
    case '.jpg':
    case '.jpeg':
    case '.gif':
      return '🖼️';
    default:
      return '📄';
  }
};

export const FileItem: React.FC<FileItemProps> = ({ file, onPress }) => {
  return (
    <TouchableOpacity
      testID={`file-item-${file.path}`}
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getFileIcon(file)}</Text>
      </View>
      
      <View style={styles.content}>
        <Text testID={`file-name-${file.name}`} style={styles.name} numberOfLines={1}>
          {file.name}
        </Text>
        <Text style={styles.path} numberOfLines={1}>
          {file.path}
        </Text>
      </View>
      
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    padding: SPACING.base,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: `${COLORS.primary}33`, // 20% opacity
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  path: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xxs,
  },
  chevron: {
    fontSize: 24,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
});
