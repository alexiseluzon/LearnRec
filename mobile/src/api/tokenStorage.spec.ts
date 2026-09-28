import * as SecureStore from 'expo-secure-store';
import { tokenStorage } from './tokenStorage';

import { Platform } from 'react-native';

jest.mock('expo-secure-store');

describe('tokenStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('returns the stored token', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('abc123');

      const result = await tokenStorage.get();

      expect(result).toBe('abc123');
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('learnrec_access_token');
    });

    it('returns null if no token is stored', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await tokenStorage.get();

      expect(result).toBeNull();
    });

    it('returns null instead of throwing if SecureStore fails', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error('boom'));

      const result = await tokenStorage.get();

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('stores the token', async () => {
      await tokenStorage.set('new-token');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'learnrec_access_token',
        'new-token',
      );
    });
  });

  describe('clear', () => {
    it('deletes the token', async () => {
      await tokenStorage.clear();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('learnrec_access_token');
    });
  });
});

describe('tokenStorage (web)', () => {
  const store: Record<string, string> = {};

  beforeEach(() => {
    jest.resetModules();
    Object.keys(store).forEach((k) => delete store[k]);
    Platform.OS = 'web';
    (globalThis as any).localStorage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
    };
  });

  afterEach(() => {
    Platform.OS = 'ios';
    delete (globalThis as any).localStorage;
  });

  it('round-trips a token via localStorage', async () => {
    const { tokenStorage } = require('./tokenStorage');
    await tokenStorage.set('web-token');
    expect(await tokenStorage.get()).toBe('web-token');
    await tokenStorage.clear();
    expect(await tokenStorage.get()).toBeNull();
  });
});