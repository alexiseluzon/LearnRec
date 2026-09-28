import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'learnrec_access_token';
const isWeb = Platform.OS === 'web';

/**
 * JWT persistence.
 * Native: Keychain / EncryptedSharedPreferences via expo-secure-store.
 * Web: localStorage (SecureStore is unavailable in browsers).
 */
export const tokenStorage = {
  async get(): Promise<string | null> {
    try {
      if (isWeb) return globalThis.localStorage?.getItem(TOKEN_KEY) ?? null;
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async set(token: string): Promise<void> {
    if (isWeb) {
      globalThis.localStorage?.setItem(TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async clear(): Promise<void> {
    if (isWeb) {
      globalThis.localStorage?.removeItem(TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};