import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// Web-type OAuth client (matches backend GOOGLE_CLIENT_ID).
// Safe to expose on-device: Google web clients are not treated as secret
// for the implicit/id_token flow, and the backend re-verifies the token.
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
};

/**
 * Runs the Google sign-in flow through Expo's auth proxy (auth.expo.io).
 * Works in Expo Go without any native config. Returns the Google id_token
 * to send to POST /auth/google/token, or null if the user cancelled.
 */
export async function signInWithGoogle(): Promise<string | null> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('EXPO_PUBLIC_GOOGLE_CLIENT_ID is not set');
  }

  // expo-auth-session no longer auto-selects the proxy via useProxy.
  // Build the auth.expo.io URL directly — this must exactly match the
  // "Authorized redirect URI" registered in Google Cloud Console.
  const redirectUri = 'https://auth.expo.io/@lextric/learnrec';

  const request = new AuthSession.AuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    redirectUri,
    responseType: AuthSession.ResponseType.IdToken,
    // Google rejects code_challenge params on the implicit/id_token flow.
    usePKCE: false,
    extraParams: { nonce: Math.random().toString(36).slice(2) },
  });

  const result = await request.promptAsync(discovery, { url: redirectUri });

  if (result.type !== 'success') {
    return null;
  }

  const idToken = result.params?.id_token;
  if (!idToken) {
    throw new Error('Google sign-in did not return an id_token');
  }

  return idToken;
}