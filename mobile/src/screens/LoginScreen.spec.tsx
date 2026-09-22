import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from './LoginScreen';
import { useAuth } from '../context/AuthContext';

jest.mock('../context/AuthContext');

const mockNavigate = jest.fn();
const navigationProp = { navigate: mockNavigate } as any;
const routeProp = {} as any;

describe('LoginScreen', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ login: mockLogin });
  });

  it('disables the login button until email and password are valid', async () => {
    await render(<LoginScreen navigation={navigationProp} route={routeProp} />);

    const button = screen.getByRole('button', { name: 'Log in' });
    expect(button.props.accessibilityState.disabled).toBe(true);

    await fireEvent.changeText(screen.getByLabelText('Email input'), 'test@test.com');
    await fireEvent.changeText(screen.getByLabelText('Password input'), 'password123');

    expect(screen.getByRole('button', { name: 'Log in' }).props.accessibilityState.disabled).toBe(false);
  });

  it('shows a validation message for an invalid email', async () => {
    await render(<LoginScreen navigation={navigationProp} route={routeProp} />);

    await fireEvent.changeText(screen.getByLabelText('Email input'), 'not-an-email');

    expect(screen.getByText('Enter a valid email address')).toBeTruthy();
  });

  it('calls login with entered credentials on submit', async () => {
    mockLogin.mockResolvedValue(undefined);

    await render(<LoginScreen navigation={navigationProp} route={routeProp} />);

    await fireEvent.changeText(screen.getByLabelText('Email input'), 'test@test.com');
    await fireEvent.changeText(screen.getByLabelText('Password input'), 'password123');
    await fireEvent.press(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
    });
  });

  it('navigates to Signup when the link is pressed', async () => {
    await render(<LoginScreen navigation={navigationProp} route={routeProp} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Go to sign up' }));

    expect(mockNavigate).toHaveBeenCalledWith('Signup');
  });
});