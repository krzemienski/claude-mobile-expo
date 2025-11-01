/**
 * useKeyboard Hook
 * Tracks keyboard show/hide state
 * Useful for adjusting UI when keyboard appears
 */

import { useState, useEffect } from 'react';
import { Keyboard, KeyboardEvent } from 'react-native';

export interface KeyboardInfo {
  isVisible: boolean;
  height: number;
}

export function useKeyboard(): KeyboardInfo {
  const [keyboardInfo, setKeyboardInfo] = useState<KeyboardInfo>({
    isVisible: false,
    height: 0,
  });

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      'keyboardWillShow',
      (e: KeyboardEvent) => {
        setKeyboardInfo({
          isVisible: true,
          height: e.endCoordinates.height,
        });
      }
    );

    const hideSubscription = Keyboard.addListener(
      'keyboardWillHide',
      () => {
        setKeyboardInfo({
          isVisible: false,
          height: 0,
        });
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return keyboardInfo;
}

/**
 * Usage:
 *
 * const keyboard = useKeyboard();
 *
 * <View style={{ marginBottom: keyboard.isVisible ? keyboard.height : 0 }}>
 *   {/* Content that should move up when keyboard appears *\/}
 * </View>
 */
