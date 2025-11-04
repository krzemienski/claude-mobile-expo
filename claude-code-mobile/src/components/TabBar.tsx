/**
 * TabBar - Bottom navigation tabs
 * Provides access to main screens: Chat, Projects, Skills, Agents, Settings
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../constants/theme';

interface TabBarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

interface Tab {
  id: string;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'Chat', label: 'Chat', icon: '💬' },
  { id: 'Projects', label: 'Projects', icon: '📁' },
  { id: 'Skills', label: 'Skills', icon: '⚡' },
  { id: 'Agents', label: 'Agents', icon: '🤖' },
  { id: 'Settings', label: 'Settings', icon: '⚙️' },
];

export const TabBar: React.FC<TabBarProps> = ({ currentScreen, onNavigate }) => {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = currentScreen === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              testID={`tab-${tab.id.toLowerCase()}`}
              style={styles.tab}
              onPress={() => onNavigate(tab.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.icon, isActive && styles.iconActive]}>
                {tab.icon}
              </Text>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    paddingHorizontal: SPACING.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
  },
  icon: {
    fontSize: 24,
    marginBottom: 2,
    opacity: 0.6,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
