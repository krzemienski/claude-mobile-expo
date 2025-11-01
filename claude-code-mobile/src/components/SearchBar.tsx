/**
 * SearchBar Component
 * Reusable search input with clear button
 * Debounced search for performance
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: (text: string) => void;
  placeholder?: string;
  debounceMs?: number;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300,
  autoFocus = false,
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleTextChange = (text: string) => {
    setInternalValue(text);
    onChangeText(text);

    // Debounced search
    if (onSearch && debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (onSearch) {
      debounceTimer.current = setTimeout(() => {
        onSearch(text);
      }, debounceMs);
    }
  };

  const handleClear = () => {
    setInternalValue('');
    onChangeText('');
    if (onSearch) {
      onSearch('');
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.input}
        value={internalValue}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textTertiary}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={() => onSearch?.(internalValue)}
      />
      {internalValue.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.clearIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.input,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.base,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    padding: 0,
  },
  clearButton: {
    marginLeft: SPACING.sm,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearIcon: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
});
