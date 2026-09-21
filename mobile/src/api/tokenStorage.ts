import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'learnrec_access_token';

/**
 * Wraps expo-secure-store for JWT persistence.
 * On iOS this uses the Keychain; on Android, EncryptedSharedPreferences —
 * safer than AsyncStorage for auth tokens.
 */
export const tokenStorage = {
  async get(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async set(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};