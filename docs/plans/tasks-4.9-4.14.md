# Tasks 4.9-4.14: Remaining Screens, Navigation, App Entry, and Styling

## Continuation of Phase 4: Frontend Mobile Application

---

### Task 4.9: FileBrowser Screen Implementation

**Purpose:** Create file browser screen with directory navigation and file selection.

#### Step 4.9.1: Create FileBrowserScreen

**File:** `/Users/nick/Desktop/claude-mobile-expo/mobile/src/screens/FileBrowserScreen.tsx`

**Content:**

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { FileMetadata } from '../types/models';
import { websocketService } from '../services/websocket.service';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store/useAppStore';

type FileBrowserNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FileBrowser'>;
type FileBrowserRouteProp = RouteProp<RootStackParamList, 'FileBrowser'>;

const FileBrowserScreen = () => {
  const navigation = useNavigation<FileBrowserNavigationProp>();
  const route = useRoute<FileBrowserRouteProp>();
  const { settings } = useAppStore();

  const [currentPath, setCurrentPath] = useState<string>(
    route.params?.initialPath || settings.projectPath || '/'
  );
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [pathHistory, setPathHistory] = useState<string[]>([]);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  const loadDirectory = async (path: string) => {
    setLoading(true);
    try {
      // Send slash command to list directory
      websocketService.sendMessage(`/ls ${path}`, {
        onMessage: (content) => {
          // Parse file list from response
          parseFileList(content);
        },
        onError: (error) => {
          Alert.alert('Error', `Failed to load directory: ${error}`);
          setLoading(false);
        },
        onComplete: () => {
          setLoading(false);
        },
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setLoading(false);
    }
  };

  const parseFileList = (content: string) => {
    // Parse directory listing response
    const lines = content.split('\n');
    const parsedFiles: FileMetadata[] = [];

    lines.forEach((line) => {
      // Expected format: "  drwxr-xr-x  5 user  staff   160 Oct 30 17:55 dirname"
      // or: "  -rw-r--r--  1 user  staff  8196 Oct 30 17:59 filename.txt"
      const match = line.match(/^([-d])[rwx-]{9}\s+\d+\s+\S+\s+\S+\s+(\d+)\s+\S+\s+\d+\s+[\d:]+\s+(.+)$/);

      if (match) {
        const [, type, size, name] = match;
        const isDirectory = type === 'd';

        parsedFiles.push({
          name,
          path: `${currentPath}/${name}`.replace(/\/+/g, '/'),
          size: parseInt(size, 10),
          isDirectory,
          extension: isDirectory ? '' : name.split('.').pop() || '',
          lastModified: new Date().toISOString(), // Could parse from output
        });
      }
    });

    // Sort: directories first, then by name
    parsedFiles.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    setFiles(parsedFiles);
  };

  const handleFilePress = async (file: FileMetadata) => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (file.isDirectory) {
      // Navigate to subdirectory
      setPathHistory([...pathHistory, currentPath]);
      setCurrentPath(file.path);
    } else {
      // Load file content and navigate to CodeViewer
      setLoading(true);
      websocketService.sendMessage(`/cat ${file.path}`, {
        onMessage: (content) => {
          navigation.navigate('CodeViewer', { file, content });
        },
        onError: (error) => {
          Alert.alert('Error', `Failed to load file: ${error}`);
          setLoading(false);
        },
        onComplete: () => {
          setLoading(false);
        },
      });
    }
  };

  const handleBackPress = () => {
    if (pathHistory.length > 0) {
      const previousPath = pathHistory[pathHistory.length - 1];
      setPathHistory(pathHistory.slice(0, -1));
      setCurrentPath(previousPath);
    } else {
      navigation.goBack();
    }
  };

  const getFileIcon = (file: FileMetadata): string => {
    if (file.isDirectory) return '📁';

    const ext = file.extension.toLowerCase();
    if (['ts', 'tsx', 'js', 'jsx'].includes(ext)) return '📜';
    if (['json', 'yaml', 'yml'].includes(ext)) return '⚙️';
    if (['md', 'txt'].includes(ext)) return '📄';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) return '🖼️';
    if (['css', 'scss', 'less'].includes(ext)) return '🎨';

    return '📝';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderFileItem = ({ item }: { item: FileMetadata }) => (
    <TouchableOpacity
      style={styles.fileItem}
      onPress={() => handleFilePress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.fileIcon}>{getFileIcon(item)}</Text>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>
          {item.name}
        </Text>
        {!item.isDirectory && (
          <Text style={styles.fileSize}>{formatFileSize(item.size)}</Text>
        )}
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[colors.backgroundGradient.start, colors.backgroundGradient.middle, colors.backgroundGradient.end]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Files</Text>
            <Text style={styles.headerPath} numberOfLines={1}>
              {currentPath}
            </Text>
          </View>
          <View style={{ width: 60 }} />
        </View>

        {/* File List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading files...</Text>
          </View>
        ) : files.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyText}>Empty directory</Text>
          </View>
        ) : (
          <FlatList
            data={files}
            keyExtractor={(item) => item.path}
            renderItem={renderFileItem}
            contentContainerStyle={styles.fileList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    width: 60,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  headerPath: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
  },
  fileList: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  fileIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  fileSize: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: colors.textSecondary,
  },
});

export default FileBrowserScreen;
```

**Validation:**

```bash
cat src/screens/FileBrowserScreen.tsx | wc -l
```

**Expected:** ~300 lines

#### Step 4.9.2: Install Required Dependencies

**Commands:**

```bash
npx expo install expo-haptics
```

**Expected:** Package installed

#### Step 4.9.3: Git Commit FileBrowserScreen

**Commands:**

```bash
git add mobile/src/screens/FileBrowserScreen.tsx
git commit -m "feat(mobile): implement FileBrowserScreen with directory navigation"
```

**Expected:** Commit created

---

### Task 4.10: CodeViewer Screen Implementation

**Purpose:** Create code viewer screen with syntax highlighting and scroll navigation.

#### Step 4.10.1: Create CodeViewerScreen

**File:** `/Users/nick/Desktop/claude-mobile-expo/mobile/src/screens/CodeViewerScreen.tsx`

**Content:**

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store/useAppStore';

type CodeViewerNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CodeViewer'>;
type CodeViewerRouteProp = RouteProp<RootStackParamList, 'CodeViewer'>;

const CodeViewerScreen = () => {
  const navigation = useNavigation<CodeViewerNavigationProp>();
  const route = useRoute<CodeViewerRouteProp>();
  const { settings } = useAppStore();

  const { file, content } = route.params;
  const [fontSize, setFontSize] = useState(settings.fontSize || 14);

  const lines = content.split('\n');
  const maxLineNumber = lines.length.toString().length;

  const handleShare = async () => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      await Share.share({
        message: content,
        title: file.name,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const increaseFontSize = () => {
    if (fontSize < 24) {
      setFontSize(fontSize + 2);
      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 10) {
      setFontSize(fontSize - 2);
      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  return (
    <LinearGradient
      colors={[colors.backgroundGradient.start, colors.backgroundGradient.middle, colors.backgroundGradient.end]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {file.name}
            </Text>
            <Text style={styles.headerSubtitle}>
              {lines.length} lines • {(file.size / 1024).toFixed(1)} KB
            </Text>
          </View>
          <TouchableOpacity onPress={handleShare}>
            <Text style={styles.shareButton}>↗</Text>
          </TouchableOpacity>
        </View>

        {/* Font Size Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={decreaseFontSize}
            disabled={fontSize <= 10}
          >
            <Text style={[styles.controlText, fontSize <= 10 && styles.controlDisabled]}>
              A-
            </Text>
          </TouchableOpacity>
          <Text style={styles.fontSizeLabel}>{fontSize}px</Text>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={increaseFontSize}
            disabled={fontSize >= 24}
          >
            <Text style={[styles.controlText, fontSize >= 24 && styles.controlDisabled]}>
              A+
            </Text>
          </TouchableOpacity>
        </View>

        {/* Code Content */}
        <ScrollView
          style={styles.scrollView}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <ScrollView
            style={styles.codeContainer}
            showsVerticalScrollIndicator={true}
          >
            {lines.map((line, index) => (
              <View key={index} style={styles.lineContainer}>
                <Text style={[styles.lineNumber, { minWidth: maxLineNumber * 8 }]}>
                  {(index + 1).toString().padStart(maxLineNumber, ' ')}
                </Text>
                <Text style={[styles.lineContent, { fontSize }]}>
                  {line || ' '}
                </Text>
              </View>
            ))}
          </ScrollView>
        </ScrollView>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {file.extension.toUpperCase()} • Read-only
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    width: 60,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  shareButton: {
    fontSize: 24,
    color: colors.primary,
    width: 60,
    textAlign: 'right',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  controlButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  controlText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  controlDisabled: {
    color: colors.textTertiary,
  },
  fontSizeLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
    minWidth: 40,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  codeContainer: {
    flex: 1,
    backgroundColor: colors.codeBackground,
  },
  lineContainer: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  lineNumber: {
    fontSize: 12,
    fontFamily: 'Courier',
    color: colors.textTertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    textAlign: 'right',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  lineContent: {
    fontFamily: 'Courier',
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
  },
  footer: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});

export default CodeViewerScreen;
```

**Validation:**

```bash
cat src/screens/CodeViewerScreen.tsx | wc -l
```

**Expected:** ~250 lines

#### Step 4.10.2: Git Commit CodeViewerScreen

**Commands:**

```bash
git add mobile/src/screens/CodeViewerScreen.tsx
git commit -m "feat(mobile): implement CodeViewerScreen with syntax display and font controls"
```

**Expected:** Commit created

---

### Task 4.11: Sessions Screen Implementation

**Purpose:** Create sessions management screen for viewing and restoring previous sessions.

#### Step 4.11.1: Create SessionsScreen

**File:** `/Users/nick/Desktop/claude-mobile-expo/mobile/src/screens/SessionsScreen.tsx`

**Content:**

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { SessionMetadata } from '../types/models';
import { useAppStore } from '../store/useAppStore';
import { websocketService } from '../services/websocket.service';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import * as Haptics from 'expo-haptics';

type SessionsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Sessions'>;

const SessionsScreen = () => {
  const navigation = useNavigation<SessionsNavigationProp>();
  const { currentSession, setCurrentSession, clearMessages, addMessage, settings } = useAppStore();

  const [sessions, setSessions] = useState<SessionMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      // Request sessions list from backend
      websocketService.sendMessage('/sessions', {
        onMessage: (content) => {
          // Parse sessions from response
          parseSessions(content);
        },
        onError: (error) => {
          Alert.alert('Error', `Failed to load sessions: ${error}`);
          setLoading(false);
        },
        onComplete: () => {
          setLoading(false);
        },
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setLoading(false);
    }
  };

  const parseSessions = (content: string) => {
    try {
      // Try to parse JSON array of sessions
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        setSessions(parsed);
      } else {
        // Fallback: parse text format
        const lines = content.split('\n').filter((line) => line.trim());
        const parsedSessions: SessionMetadata[] = lines.map((line) => {
          const [id, ...rest] = line.split(' ');
          return {
            id,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            messageCount: 0,
            projectPath: rest.join(' '),
          };
        });
        setSessions(parsedSessions);
      }
    } catch (error) {
      console.error('Failed to parse sessions:', error);
      setSessions([]);
    }
  };

  const handleSessionPress = async (session: SessionMetadata) => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setLoadingSessionId(session.id);

    try {
      // Initialize session with backend
      const sessionId = await websocketService.sendInitSession(session.id);

      // Clear current messages and set new session
      clearMessages();
      setCurrentSession(session.id);

      // Request session history
      websocketService.sendMessage(`/session ${session.id}`, {
        onMessage: (content) => {
          // Add restored messages to store
          addMessage({
            id: Date.now().toString(),
            role: 'assistant',
            content,
            timestamp: new Date().toISOString(),
          });
        },
        onError: (error) => {
          Alert.alert('Error', `Failed to restore session: ${error}`);
        },
        onComplete: () => {
          setLoadingSessionId(null);
          navigation.navigate('Chat');
        },
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setLoadingSessionId(null);
    }
  };

  const handleDeleteSession = (session: SessionMetadata) => {
    Alert.alert(
      'Delete Session',
      `Are you sure you want to delete this session? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              websocketService.sendMessage(`/delete-session ${session.id}`, {
                onMessage: () => {
                  setSessions(sessions.filter((s) => s.id !== session.id));
                  if (currentSession === session.id) {
                    setCurrentSession(null);
                  }
                },
                onError: (error) => {
                  Alert.alert('Error', `Failed to delete session: ${error}`);
                },
              });
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const renderSessionItem = ({ item }: { item: SessionMetadata }) => (
    <View style={styles.sessionCard}>
      <TouchableOpacity
        style={styles.sessionContent}
        onPress={() => handleSessionPress(item)}
        disabled={loadingSessionId !== null}
        activeOpacity={0.7}
      >
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionId} numberOfLines={1}>
            {item.id}
          </Text>
          {item.id === currentSession && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          )}
        </View>

        {item.projectPath && (
          <Text style={styles.sessionPath} numberOfLines={1}>
            📁 {item.projectPath}
          </Text>
        )}

        <View style={styles.sessionFooter}>
          <Text style={styles.sessionDate}>{formatDate(item.lastModified)}</Text>
          {item.messageCount > 0 && (
            <Text style={styles.sessionMessages}>
              💬 {item.messageCount} messages
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteSession(item)}
        disabled={loadingSessionId !== null}
      >
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>

      {loadingSessionId === item.id && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );

  return (
    <LinearGradient
      colors={[colors.backgroundGradient.start, colors.backgroundGradient.middle, colors.backgroundGradient.end]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sessions</Text>
          <TouchableOpacity onPress={loadSessions} disabled={loading}>
            <Text style={styles.refreshButton}>↻</Text>
          </TouchableOpacity>
        </View>

        {/* Sessions List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading sessions...</Text>
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No Sessions</Text>
            <Text style={styles.emptyText}>
              Start a conversation to create your first session
            </Text>
          </View>
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            renderItem={renderSessionItem}
            contentContainerStyle={styles.sessionsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    width: 60,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    fontSize: 24,
    color: colors.primary,
    width: 60,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sessionsList: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  sessionContent: {
    padding: spacing.base,
    paddingRight: spacing.xxxl,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sessionId: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  activeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  activeBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: '#fff',
  },
  sessionPath: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  sessionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionDate: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  sessionMessages: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  deleteButton: {
    position: 'absolute',
    right: spacing.base,
    top: spacing.base,
    padding: spacing.sm,
  },
  deleteIcon: {
    fontSize: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SessionsScreen;
```

**Validation:**

```bash
cat src/screens/SessionsScreen.tsx | wc -l
```

**Expected:** ~400 lines

#### Step 4.11.2: Git Commit SessionsScreen

**Commands:**

```bash
git add mobile/src/screens/SessionsScreen.tsx
git commit -m "feat(mobile): implement SessionsScreen with session management and restoration"
```

**Expected:** Commit created

---

### Task 4.12: Navigation Configuration

**Purpose:** Set up React Navigation with all screens and proper type safety.

#### Step 4.12.1: Create AppNavigator

**File:** `/Users/nick/Desktop/claude-mobile-expo/mobile/src/navigation/AppNavigator.tsx`

**Content:**

```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Import screens
import ChatScreen from '../screens/ChatScreen';
import FileBrowserScreen from '../screens/FileBrowserScreen';
import CodeViewerScreen from '../screens/CodeViewerScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SessionsScreen from '../screens/SessionsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * AppNavigator - Main navigation stack for the application
 *
 * Screen Flow:
 * - Chat: Main conversation screen (initial route)
 * - FileBrowser: Browse project files
 * - CodeViewer: View file contents with syntax highlighting
 * - Settings: App configuration and preferences
 * - Sessions: View and manage conversation sessions
 *
 * All screens use headerShown: false for custom headers with gradient backgrounds
 */
const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Chat"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'Claude Code',
          animation: 'fade',
        }}
      />

      <Stack.Screen
        name="FileBrowser"
        component={FileBrowserScreen}
        options={{
          title: 'Files',
          animation: 'slide_from_right',
        }}
      />

      <Stack.Screen
        name="CodeViewer"
        component={CodeViewerScreen}
        options={{
          title: 'Code Viewer',
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          animation: 'slide_from_bottom',
          gestureDirection: 'vertical',
        }}
      />

      <Stack.Screen
        name="Sessions"
        component={SessionsScreen}
        options={{
          title: 'Sessions',
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
```

**Validation:**

```bash
cat src/navigation/AppNavigator.tsx | grep "Stack.Screen" | wc -l
```

**Expected:** 5 screens registered

#### Step 4.12.2: Verify Navigation Types

**Commands:**

```bash
# Verify navigation types are complete
cat mobile/src/types/navigation.ts
```

**Expected Output:**

```typescript
import { FileMetadata } from './models';

export type RootStackParamList = {
  Chat: undefined;
  FileBrowser: { initialPath?: string };
  CodeViewer: { file: FileMetadata; content: string };
  Settings: undefined;
  Sessions: undefined;
};
```

**Validation Check:**

```bash
cat src/types/navigation.ts | grep -E "Chat|FileBrowser|CodeViewer|Settings|Sessions"
```

**Expected:** All 5 screen types present

#### Step 4.12.3: Install Navigation Dependencies

**Commands:**

```bash
cd /Users/nick/Desktop/claude-mobile-expo/mobile
npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
```

**Expected:** All packages installed successfully

#### Step 4.12.4: Git Commit Navigation

**Commands:**

```bash
git add mobile/src/navigation/AppNavigator.tsx
git commit -m "feat(mobile): implement AppNavigator with 5 screens and typed navigation"
```

**Expected:** Commit created

---

### Task 4.13: App Entry Point (App.tsx)

**Purpose:** Create main App component with providers, initialization, and error boundaries.

#### Step 4.13.1: Create App.tsx

**File:** `/Users/nick/Desktop/claude-mobile-expo/mobile/App.tsx`

**Content:**

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';
import { useAppStore } from './src/store/useAppStore';
import { websocketService } from './src/services/websocket.service';
import { colors } from './src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * ErrorBoundary - Catches and displays runtime errors
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <LinearGradient
          colors={[
            colors.backgroundGradient.start,
            colors.backgroundGradient.middle,
            colors.backgroundGradient.end,
          ]}
          style={styles.errorContainer}
        >
          <Text style={styles.errorTitle}>⚠️ Something went wrong</Text>
          <Text style={styles.errorText}>{this.state.error?.message}</Text>
          <Text style={styles.errorHint}>
            Please restart the app. If the problem persists, check your connection and settings.
          </Text>
        </LinearGradient>
      );
    }

    return this.props.children;
  }
}

/**
 * LoadingScreen - Displayed during app initialization
 */
const LoadingScreen = () => (
  <LinearGradient
    colors={[
      colors.backgroundGradient.start,
      colors.backgroundGradient.middle,
      colors.backgroundGradient.end,
    ]}
    style={styles.loadingContainer}
  >
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={styles.loadingText}>Initializing Claude Code...</Text>
  </LinearGradient>
);

/**
 * App - Main application component
 *
 * Responsibilities:
 * 1. Load persisted settings from AsyncStorage
 * 2. Initialize WebSocket connection to backend
 * 3. Set up navigation container with AppNavigator
 * 4. Provide error boundary for graceful error handling
 * 5. Display loading screen during initialization
 *
 * Initialization Flow:
 * - Load settings from AsyncStorage
 * - Restore previous session if exists
 * - Connect to WebSocket server
 * - Handle connection status updates
 * - Navigate to Chat screen
 */
export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    connecting: boolean;
  }>({ connected: false, connecting: false });

  const { settings, updateSettings, setCurrentSession } = useAppStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Step 1: Load persisted settings from AsyncStorage
      const persistedSettings = await loadSettings();
      if (persistedSettings) {
        updateSettings(persistedSettings);
      }

      // Step 2: Load persisted session
      const persistedSession = await AsyncStorage.getItem('currentSession');
      if (persistedSession) {
        setCurrentSession(persistedSession);
      }

      // Step 3: Connect to WebSocket server
      await connectWebSocket(persistedSettings?.serverUrl || settings.serverUrl);

      // Step 4: Mark app as ready
      setIsReady(true);
    } catch (error: any) {
      console.error('App initialization error:', error);
      Alert.alert(
        'Initialization Error',
        `Failed to initialize app: ${error.message}\n\nThe app will continue, but some features may not work properly.`,
        [{ text: 'OK', onPress: () => setIsReady(true) }]
      );
    }
  };

  const loadSettings = async () => {
    try {
      const settingsJson = await AsyncStorage.getItem('settings');
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
      return null;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null;
    }
  };

  const connectWebSocket = async (serverUrl: string) => {
    try {
      await websocketService.connect(serverUrl, handleConnectionChange);
      console.log('WebSocket connected successfully');
    } catch (error: any) {
      console.error('WebSocket connection error:', error);
      // Don't throw - allow app to continue without connection
      // User can manually reconnect from Settings
    }
  };

  const handleConnectionChange = (connected: boolean, connecting: boolean) => {
    setConnectionStatus({ connected, connecting });

    // Optional: Show alerts for connection status changes
    if (!connected && !connecting && isReady) {
      console.log('WebSocket disconnected - automatic reconnection will be attempted');
    }
  };

  // Show loading screen during initialization
  if (!isReady) {
    return (
      <SafeAreaProvider>
        <LoadingScreen />
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
```

**Validation:**

```bash
cat App.tsx | grep -E "initializeApp|connectWebSocket|ErrorBoundary|LoadingScreen"
```

**Expected:** All key functions present

#### Step 4.13.2: Install AsyncStorage

**Commands:**

```bash
npx expo install @react-native-async-storage/async-storage
```

**Expected:** Package installed

#### Step 4.13.3: Verify App.tsx Integration

**Commands:**

```bash
# Check imports
cat App.tsx | grep "^import" | wc -l

# Verify Zustand store usage
cat App.tsx | grep "useAppStore"

# Verify WebSocket service usage
cat App.tsx | grep "websocketService"
```

**Expected:**
- Multiple imports present
- Store and service integration confirmed

#### Step 4.13.4: Test App Compilation

**Commands:**

```bash
cd /Users/nick/Desktop/claude-mobile-expo/mobile
npm run build
```

**Expected:** TypeScript compilation succeeds with no errors

**Duration:** 30-60 seconds

#### Step 4.13.5: Git Commit App Entry Point

**Commands:**

```bash
git add mobile/App.tsx
git commit -m "feat(mobile): implement App.tsx with initialization, error boundary, and WebSocket connection"
```

**Expected:** Commit created

---

### Task 4.14: Styling and Polish

**Purpose:** Apply final styling touches, ensure consistent UI, and add polish features.

#### Step 4.14.1: Verify Gradient Backgrounds

**Commands:**

```bash
# Check all screens have LinearGradient
cd /Users/nick/Desktop/claude-mobile-expo/mobile
grep -l "LinearGradient" src/screens/*.tsx
```

**Expected Output:**

```
src/screens/ChatScreen.tsx
src/screens/CodeViewerScreen.tsx
src/screens/FileBrowserScreen.tsx
src/screens/SessionsScreen.tsx
src/screens/SettingsScreen.tsx
```

**Validation:** All 5 screens use gradient backgrounds

#### Step 4.14.2: Verify Safe Area Handling

**Commands:**

```bash
# Check all screens use SafeAreaView
grep -l "SafeAreaView" src/screens/*.tsx
```

**Expected:** All 5 screens present

**Manual Check:** Verify SafeAreaView has proper edges prop:
```bash
grep "edges=" src/screens/*.tsx
```

**Expected:** Each screen has `edges={['top', 'bottom']}` or similar

#### Step 4.14.3: Add Loading State Component

**File:** `/Users/nick/Desktop/claude-mobile-expo/mobile/src/components/LoadingState.tsx`

**Content:**

```typescript
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../constants/theme';

interface LoadingStateProps {
  message?: string;
}

/**
 * LoadingState - Reusable loading indicator component
 *
 * Usage:
 * <LoadingState message="Loading files..." />
 */
const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  message: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default LoadingState;
```

**Validation:**

```bash
cat src/components/LoadingState.tsx | grep "export default"
```

**Expected:** Component exported

#### Step 4.14.4: Add Error State Component

**File:** `/Users/nick/Desktop/claude-mobile-expo/mobile/src/components/ErrorState.tsx`

**Content:**

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * ErrorState - Reusable error display component
 *
 * Usage:
 * <ErrorState
 *   message="Failed to load data"
 *   onRetry={() => loadData()}
 * />
 */
const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>{retryLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  retryText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: '#fff',
  },
});

export default ErrorState;
```

**Validation:**

```bash
cat src/components/ErrorState.tsx | grep "export default"
```

**Expected:** Component exported

#### Step 4.14.5: Verify Haptic Feedback Integration

**Commands:**

```bash
# Check haptic feedback usage in screens
grep -n "Haptics\." src/screens/*.tsx
```

**Expected:** Multiple instances across ChatScreen, SettingsScreen, FileBrowserScreen, CodeViewerScreen

**Verify Patterns:**
- Button presses: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`
- Important actions: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)`
- Errors: `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)`

#### Step 4.14.6: Add Connection Status Indicator

**File:** `/Users/nick/Desktop/claude-mobile-expo/mobile/src/components/ConnectionStatus.tsx`

**Content:**

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

interface ConnectionStatusProps {
  connected: boolean;
  connecting: boolean;
}

/**
 * ConnectionStatus - Visual indicator for WebSocket connection state
 *
 * States:
 * - Connected: Green dot
 * - Connecting: Yellow dot with animation
 * - Disconnected: Red dot
 */
const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ connected, connecting }) => {
  let status = 'Disconnected';
  let color = colors.error;

  if (connected) {
    status = 'Connected';
    color = colors.success;
  } else if (connecting) {
    status = 'Connecting...';
    color = '#FFA500'; // Orange
  }

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.text}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  text: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
});

export default ConnectionStatus;
```

**Validation:**

```bash
cat src/components/ConnectionStatus.tsx | grep "export default"
```

**Expected:** Component exported

#### Step 4.14.7: Update Theme with Additional Colors

**File:** `/Users/nick/Desktop/claude-mobile-expo/mobile/src/constants/theme.ts`

**Update colors section to add:**

```typescript
// Add to colors object
success: '#4CAF50',
warning: '#FFA500',
info: '#2196F3',
codeBackground: '#1a1a1a',
```

**Commands:**

```bash
# Verify theme file has all required colors
cat src/constants/theme.ts | grep -E "success|warning|info|codeBackground"
```

**Expected:** All new colors present

#### Step 4.14.8: Final Component Export Verification

**File:** `/Users/nick/Desktop/claude-mobile-expo/mobile/src/components/index.ts`

**Update content:**

```typescript
// Core Components
export { default as MessageBubble } from './MessageBubble';

// State Components
export { default as LoadingState } from './LoadingState';
export { default as ErrorState } from './ErrorState';

// Status Components
export { default as ConnectionStatus } from './ConnectionStatus';
```

**Validation:**

```bash
cat src/components/index.ts | grep "export"
```

**Expected:** All components exported

#### Step 4.14.9: Test App Launch

**Commands:**

```bash
cd /Users/nick/Desktop/claude-mobile-expo/mobile

# Build
npm run build

# Start Metro bundler (in background)
npm start &

# Wait for bundler to start (10 seconds)
sleep 10

# Check Metro is running
curl -I http://localhost:8081 || echo "Metro bundler may not be ready"
```

**Expected:**
- TypeScript compilation succeeds
- Metro bundler starts without errors

**Manual Test Required:** Launch iOS simulator and verify:
- App loads without crashes
- Gradient backgrounds visible on all screens
- Navigation works between screens
- Loading states display correctly
- Error boundary catches errors gracefully

#### Step 4.14.10: Git Commit Styling and Polish

**Commands:**

```bash
git add mobile/src/components/LoadingState.tsx
git add mobile/src/components/ErrorState.tsx
git add mobile/src/components/ConnectionStatus.tsx
git add mobile/src/components/index.ts
git add mobile/src/constants/theme.ts
git commit -m "feat(mobile): add LoadingState, ErrorState, ConnectionStatus components and theme polish"
```

**Expected:** Commit created with all polishing components

---

## Task Completion Summary

### Task 4.9: FileBrowser Screen ✅
- FileBrowserScreen.tsx created (300 lines)
- Directory navigation implemented
- File type icons and formatting
- Haptic feedback integration
- Git committed

### Task 4.10: CodeViewer Screen ✅
- CodeViewerScreen.tsx created (250 lines)
- Syntax display with line numbers
- Font size controls
- Share functionality
- Git committed

### Task 4.11: Sessions Screen ✅
- SessionsScreen.tsx created (400 lines)
- Session list with metadata
- Session restoration
- Delete functionality
- Git committed

### Task 4.12: Navigation Configuration ✅
- AppNavigator.tsx created
- All 5 screens registered
- Typed navigation (RootStackParamList)
- Custom transitions and gestures
- Dependencies installed
- Git committed

### Task 4.13: App Entry Point ✅
- App.tsx created
- Zustand store initialization
- WebSocket connection on mount
- AsyncStorage settings loading
- Error boundary implementation
- Loading screen
- Connection status callback
- Git committed

### Task 4.14: Styling and Polish ✅
- Gradient backgrounds verified (all 5 screens)
- Safe area handling verified (all 5 screens)
- LoadingState component created
- ErrorState component created
- ConnectionStatus component created
- Theme colors extended
- Haptic feedback verified
- Component exports organized
- Git committed

---

## Next Steps

After completing Tasks 4.9-4.14, the following phases remain:

### Phase 5: Integration Testing
- Validate frontend-backend communication
- Test WebSocket message flow
- Verify session management
- Test all slash commands
- Screenshot validation

### Phase 6: Production Readiness
- Environment configuration
- Error handling hardening
- Performance optimization
- Security audit
- Documentation completion

### Phase 7: Deployment
- Backend deployment configuration
- Mobile app build and distribution
- Testing procedures
- Launch checklist

All tasks follow the established pattern with detailed step-by-step instructions, validation commands, and git commits.
