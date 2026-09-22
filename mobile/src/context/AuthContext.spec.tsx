import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AuthProvider, useAuth } from './AuthContext';
import { authApi } from '../api/auth';
import { tokenStorage } from '../api/tokenStorage';
import { setUnauthorizedHandler } from '../api/client';

jest.mock('../api/auth');
jest.mock('../api/tokenStorage');
jest.mock('../api/client', () => ({
  setUnauthorizedHandler: jest.fn(),
}));

function TestConsumer() {
  const { isAuthenticated, isLoading, login, signup, logout } = useAuth();
  return (
    <>
      <Text testID="loading">{String(isLoading)}</Text>
      <Text testID="authenticated">{String(isAuthenticated)}</Text>
      <Text testID="login" onPress={() => login('a@test.com', 'password123')}>
        login
      </Text>
      <Text testID="signup" onPress={() => signup('a@test.com', 'password123', 'A')}>
        signup
      </Text>
      <Text testID="logout" onPress={() => logout()}>
        logout
      </Text>
    </>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with isLoading true, then resolves to unauthenticated if no token is stored', async () => {
    (tokenStorage.get as jest.Mock).mockResolvedValue(null);

    await render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').props.children).toBe('false');
    });
    expect(screen.getByTestId('authenticated').props.children).toBe('false');
  });

  it('resolves to authenticated if a token is already stored (session restore)', async () => {
    (tokenStorage.get as jest.Mock).mockResolvedValue('existing-token');

    await render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').props.children).toBe('true');
    });
  });

  it('registers a 401 handler on mount', async () => {
    (tokenStorage.get as jest.Mock).mockResolvedValue(null);

    await render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(setUnauthorizedHandler).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  it('login stores the token and sets authenticated to true', async () => {
    (tokenStorage.get as jest.Mock).mockResolvedValue(null);
    (authApi.login as jest.Mock).mockResolvedValue({ accessToken: 'new-token' });

    await render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading').props.children).toBe('false'));

    await act(async () => {
      screen.getByTestId('login').props.onPress();
    });

    expect(tokenStorage.set).toHaveBeenCalledWith('new-token');
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').props.children).toBe('true');
    });
  });

  it('signup stores the token and sets authenticated to true', async () => {
    (tokenStorage.get as jest.Mock).mockResolvedValue(null);
    (authApi.signup as jest.Mock).mockResolvedValue({ accessToken: 'signup-token' });

    await render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading').props.children).toBe('false'));

    await act(async () => {
      screen.getByTestId('signup').props.onPress();
    });

    expect(tokenStorage.set).toHaveBeenCalledWith('signup-token');
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').props.children).toBe('true');
    });
  });

  it('logout clears the token and sets authenticated to false', async () => {
    (tokenStorage.get as jest.Mock).mockResolvedValue('existing-token');

    await render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('authenticated').props.children).toBe('true'));

    await act(async () => {
      screen.getByTestId('logout').props.onPress();
    });

    expect(tokenStorage.clear).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').props.children).toBe('false');
    });
  });

  it('throws if useAuth is called outside AuthProvider', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    function Orphan() {
      useAuth();
      return null;
    }

    await expect(render(<Orphan />)).rejects.toThrow(
      'useAuth must be used within an AuthProvider',
    );

    consoleError.mockRestore();
  });
});