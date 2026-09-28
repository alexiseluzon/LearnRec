import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { showAlert } from '../utils/alert';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = isEmailValid && password.length >= 8 && !isSubmitting;

  const handleLogin = async () => {
    setIsSubmitting(true);
    try {
      await login(email, password);
      // navigation to app stack happens automatically via RootNavigator
      // reacting to isAuthenticated changing
    } catch (err: any) {
      const message =
        err.response?.data?.message ?? 'Login failed. Please try again.';
        showAlert('Login Error', Array.isArray(message) ? message[0] : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      const message =
        err.response?.data?.message ?? 'Google sign-in failed. Please try again.';
        showAlert('Login Error', Array.isArray(message) ? message[0] : message);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleDemo = async () => {
    setIsSubmitting(true);
    try {
      await login('demo@learnrec.app', 'Demo1234!');
    } catch {
      showAlert('Demo unavailable', 'The demo server may be waking up. Try again in 30 seconds.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LearnRec</Text>
      <Text style={styles.subtitle}>Log in to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#94a3b8"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        accessibilityLabel="Email input"
      />
      {email.length > 0 && !isEmailValid && (
        <Text style={styles.errorText}>Enter a valid email address</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#94a3b8"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        accessibilityLabel="Password input"
      />

      <TouchableOpacity
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={!canSubmit}
        accessibilityRole="button"
        accessibilityLabel="Log in"
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Log In</Text>
        )}
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.divider} />
      </View>

      {/* <TouchableOpacity
        style={[styles.googleButton, isGoogleSubmitting && styles.buttonDisabled]}
        onPress={handleGoogleLogin}
        disabled={isGoogleSubmitting || isSubmitting}
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
      >
        {isGoogleSubmitting ? (
          <ActivityIndicator color="#0f172a" />
        ) : (
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        )}
      </TouchableOpacity> */}

      <TouchableOpacity
        style={styles.demoButton}
        onPress={handleDemo}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel="Try demo account"
      >
        <Text style={styles.demoButtonText}>Try demo account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('Signup')}
        accessibilityRole="button"
        accessibilityLabel="Go to sign up"
      >
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#0f172a',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#f8fafc',
    marginBottom: 8,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#334155',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    color: '#94a3b8',
    fontSize: 13,
    marginHorizontal: 12,
  },
  googleButton: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  googleButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: '#818cf8',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  demoButton: {
    borderWidth: 1,
    borderColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  demoButtonText: {
    color: '#818cf8',
    fontSize: 16,
    fontWeight: '600',
  },
});