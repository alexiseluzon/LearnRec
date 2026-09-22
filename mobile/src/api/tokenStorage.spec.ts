import * as SecureStore from 'expo-secure-store';
import { tokenStorage } from './tokenStorage';

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