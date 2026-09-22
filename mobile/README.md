# LearnRec Mobile

React Native (Expo) app for LearnRec — browse, save, and rate learning resources; get tag-based recommendations. Pairs with the [LearnRec backend](../backend).

## Stack

- **Framework:** Expo (React Native, TypeScript)
- **Navigation:** React Navigation (native stack)
- **HTTP:** Axios with auth interceptors
- **Secure storage:** expo-secure-store (Keychain / EncryptedSharedPreferences — not AsyncStorage)

## Requirements

- **Node 22.13.0 or newer** (Metro 0.84.x / Expo SDK 57 will fail to bundle on Node 24.x or Node <22.13.0 — use `nvm` if you need to switch versions)
- Expo Go app on your phone (easiest), or an Android/iOS emulator

## Setup

### 1. Install dependencies

```powershell
npm install
```

### 2. Configure environment

Create `.env` in this folder:

```
EXPO_PUBLIC_API_URL=http://<your-PC-LAN-IP>:3000
```

Find your LAN IP with `ipconfig` (Windows) — do **not** use `localhost`, since your phone/emulator can't reach your PC's localhost. Restart the dev server after changing this file (env vars are read at bundle time).

Make sure the [backend](../backend) is running and listening on `0.0.0.0` (not just `localhost`) so your phone can reach it.

### 3. Start the dev server

```powershell
npx expo start
```

Scan the QR code with Expo Go, or press `a` for Android emulator / `w` for web.

## Testing

```powershell
npm test
```

## Project structure

```
src/
├── api/            # Axios client, typed API calls, secure token storage
├── context/         # Auth context (session state, login/signup/logout)
├── navigation/       # Auth stack, App stack, Root navigator (switches on auth state)
├── screens/          # Login, Signup, ResourceList, ResourceDetail, AddResource, Recommendations
└── types/            # Shared TypeScript types (mirrors backend DTOs)
```

## Known issues / notes

- Placeholder app icons/splash in `assets/` — swap with real branding before a public release
- Google OAuth login is wired on the backend but not yet added as a UI button here
- `metro.config.js` uses Expo's default config — required for Expo-specific asset/resolver behavior

## License

This project is for portfolio/demonstration purposes. No warranty; use at your own risk.