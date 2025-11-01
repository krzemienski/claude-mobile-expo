/**
 * Storage Utilities
 * AsyncStorage helpers with type safety
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Type-safe storage get
 */
export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const item = await AsyncStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`[Storage] Error getting ${key}:`, error);
    return null;
  }
}

/**
 * Type-safe storage set
 */
export async function setItem<T>(key: string, value: T): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[Storage] Error setting ${key}:`, error);
    return false;
  }
}

/**
 * Remove item
 */
export async function removeItem(key: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[Storage] Error removing ${key}:`, error);
    return false;
  }
}

/**
 * Clear all storage
 */
export async function clearAll(): Promise<boolean> {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('[Storage] Error clearing:', error);
    return false;
  }
}

/**
 * Get all keys
 */
export async function getAllKeys(): Promise<string[]> {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('[Storage] Error getting keys:', error);
    return [];
  }
}

/**
 * Get multiple items
 */
export async function multiGet(keys: string[]): Promise<Record<string, any>> {
  try {
    const items = await AsyncStorage.multiGet(keys);
    const result: Record<string, any> = {};

    items.forEach(([key, value]) => {
      if (value) {
        try {
          result[key] = JSON.parse(value);
        } catch {
          result[key] = value;
        }
      }
    });

    return result;
  } catch (error) {
    console.error('[Storage] Error in multiGet:', error);
    return {};
  }
}

/**
 * Set multiple items
 */
export async function multiSet(items: Record<string, any>): Promise<boolean> {
  try {
    const pairs: [string, string][] = Object.entries(items).map(([key, value]) => [
      key,
      JSON.stringify(value),
    ]);

    await AsyncStorage.multiSet(pairs);
    return true;
  } catch (error) {
    console.error('[Storage] Error in multiSet:', error);
    return false;
  }
}
