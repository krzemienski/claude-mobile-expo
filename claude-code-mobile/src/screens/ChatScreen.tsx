/**
 * ChatScreen - Primary Interface
 * 
 * Based on spec lines 378-523
 * - Header: Connection status + Settings button
 * - Slash command menu (conditional)
 * - Messages list (FlatList, inverted for chat)
 * - Input area with Send button
 * 
 * All interactive elements have testID for expo-mcp autonomous testing
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { useWebSocket } from '../contexts/WebSocketContext';
import { Message, MessageRole } from '../types/models';
import { MessageBubble } from '../components/MessageBubble';
import { StreamingIndicator } from '../components/StreamingIndicator';
import { ToolExecutionCard } from '../components/ToolExecutionCard';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { SlashCommandMenu } from '../components/SlashCommandMenu';
import { ConnectionStatus as Status } from '../types/websocket';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import type { ChatScreenProps } from '../types/navigation';

export const ChatScreen: React.FC<ChatScreenProps> = () => {
  const navigation = useNavigation();
  const [inputText, setInputText] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // WebSocket service from context
  const { wsService } = useWebSocket();

  // Zustand selectors for optimized re-renders
  const messages = useAppStore((state) => state.messages);
  const isConnected = useAppStore((state) => state.isConnected);
  const isStreaming = useAppStore((state) => state.isStreaming);
  const addMessage = useAppStore((state) => state.addMessage);
  const setStreaming = useAppStore((state) => state.setStreaming);

  // Connection status from Zustand
  const connectionStatus = isConnected ? Status.CONNECTED : Status.DISCONNECTED;

  // Handle input change
  const handleInputChange = useCallback((text: string) => {
    setInputText(text);
    
    // Show slash menu when typing '/'
    if (text.startsWith('/')) {
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  }, []);

  // Handle send message
  const handleSend = useCallback(() => {
    if (!inputText.trim() || isStreaming) {
      return;
    }

    // Create optimistic message (Stream pattern)
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: MessageRole.USER,
      content: inputText,
      timestamp: new Date(),
    };

    console.log('[ChatScreen] handleSend() called, inputText:', inputText);
    console.log('[ChatScreen] wsService:', wsService ? 'AVAILABLE' : 'NULL');

    addMessage(userMessage);
    setInputText('');
    setShowSlashMenu(false);
    setStreaming(true);

    // Send via WebSocket service
    if (wsService) {
      console.log('[ChatScreen] Calling wsService.sendMessage()...');
      wsService.sendMessage(inputText);
      console.log('[ChatScreen] wsService.sendMessage() returned');
    } else {
      console.error('[ChatScreen] WebSocket service not available');
      setStreaming(false);
    }

    // Auto-scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [inputText, isStreaming, addMessage]);

  // Handle slash command selection
  const handleSelectCommand = useCallback((command: string) => {
    setInputText(command + ' ');
    setShowSlashMenu(false);
  }, []);

  // Handle settings button
  const handleSettings = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  // Render message item
  const renderMessage = useCallback(
    ({ item }: ListRenderItemInfo<Message>) => (
      <MessageBubble message={item} isUser={item.role === MessageRole.USER} />
    ),
    []
  );

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  return (
    <LinearGradient
      colors={[
        COLORS.backgroundGradient.start,
        COLORS.backgroundGradient.middle,
        COLORS.backgroundGradient.end,
      ]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View testID="chat-header" style={styles.header}>
          <ConnectionStatus status={connectionStatus} />
          
          <TouchableOpacity
            testID="settings-button"
            onPress={handleSettings}
            style={styles.settingsButton}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Slash Command Menu (conditional) */}
        {showSlashMenu && (
          <View style={styles.slashMenuContainer}>
            <SlashCommandMenu
              filterText={inputText}
              onSelectCommand={handleSelectCommand}
            />
          </View>
        )}

        {/* Messages List */}
        <FlatList
          testID="message-list"
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted={false} // Normal order, scroll to end for new messages
          contentContainerStyle={styles.messagesList}
          windowSize={10}
          maxToRenderPerBatch={10}
          removeClippedSubviews={true}
          initialNumToRender={10}
          ListEmptyComponent={
            <View testID="empty-state" style={styles.emptyState}>
              <Text style={styles.emptyText}>
                👋 Welcome to Claude Code Mobile
              </Text>
              <Text style={styles.emptySubtext}>
                Start a conversation or use / for commands
              </Text>
            </View>
          }
        />

        {/* Streaming Indicator */}
        {isStreaming && <StreamingIndicator />}

        {/* Input Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <View testID="input-area" style={styles.inputArea}>
            <View style={styles.inputContainer}>
              <TextInput
                testID="message-input"
                style={styles.input}
                value={inputText}
                onChangeText={handleInputChange}
                placeholder="Message Claude Code..."
                placeholderTextColor={COLORS.textSecondary}
                multiline
                maxLength={5000}
                editable={!isStreaming}
              />
              
              <TouchableOpacity
                testID="send-button"
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isStreaming) && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!inputText.trim() || isStreaming}
              >
                <Text style={styles.sendIcon}>▲</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.hint}>
              Use / for commands • @ to reference files
            </Text>
          </View>
        </KeyboardAvoidingView>
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
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 24,
  },
  slashMenuContainer: {
    position: 'absolute',
    top: 60,
    left: SPACING.base,
    right: SPACING.base,
    zIndex: 1000,
  },
  messagesList: {
    flexGrow: 1,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
  },
  inputArea: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.lg, // Extra padding for safe area
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    maxHeight: 120,
    marginRight: SPACING.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  sendIcon: {
    fontSize: 18,
    color: '#fff',
  },
  hint: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
