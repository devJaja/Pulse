# Biometric Authentication

## Overview
Biometric authentication (fingerprint/Face ID) has been added to Pulse for quick and secure sign-in.

## Features

### 1. Biometric Sign In
- Users can sign in using fingerprint or Face ID
- Credentials are securely stored locally
- Automatic detection of available biometric hardware
- Fallback to device passcode if biometric fails

### 2. Settings Management
- Enable/disable biometric authentication from Settings
- Requires biometric authentication to enable the feature
- Clear indication of biometric availability
- Support for multiple biometric types (fingerprint, Face ID, iris)

### 3. Security
- Credentials stored in device's secure storage (AsyncStorage)
- Biometric authentication required before accessing stored credentials
- Users must authenticate with biometric to enable the feature
- Can be disabled at any time from Settings

## Implementation

### Files Created
- `lib/biometric.ts` - Core biometric utility functions
- `components/auth/BiometricButton.tsx` - Biometric sign-in button
- `components/settings/BiometricSettings.tsx` - Settings toggle component
- `app/settings/index.tsx` - Settings screen with biometric options

### Files Modified
- `lib/storage.ts` - Added biometric credential storage
- `components/auth/SignInForm.tsx` - Integrated biometric button
- `components/profile/ProfileMenu.tsx` - Added settings navigation

## Usage

### For Users

1. **Enable Biometric Authentication:**
   - Go to Profile → Settings
   - Toggle "Fingerprint/Face ID Sign In"
   - Authenticate with your biometric
   - Sign in normally once to save credentials

2. **Sign In with Biometric:**
   - Open the app
   - Tap "Sign in with Fingerprint/Face ID" button
   - Authenticate with your biometric
   - Automatically signed in

3. **Disable Biometric:**
   - Go to Profile → Settings
   - Toggle off "Fingerprint/Face ID Sign In"
   - Credentials are removed from storage

### For Developers

```typescript
import { biometric } from '@/lib/biometric';

// Check if biometric is available
const available = await biometric.canUseBiometric();

// Authenticate user
const result = await biometric.authenticate('Sign in to Pulse');
if (result.success) {
  // Authentication successful
}

// Enable/disable biometric
await biometric.enableBiometric();
await biometric.disableBiometric();

// Check if enabled
const enabled = await biometric.isBiometricEnabled();
```

## Supported Platforms
- iOS: Face ID, Touch ID
- Android: Fingerprint, Face unlock, Iris

## Dependencies
- `expo-local-authentication` - Biometric authentication API
- `@react-native-async-storage/async-storage` - Secure credential storage

## Security Considerations

1. **Credential Storage:**
   - Credentials are stored in AsyncStorage
   - Only accessible after biometric authentication
   - Automatically cleared when biometric is disabled

2. **Authentication Flow:**
   - Biometric authentication required before accessing credentials
   - Fallback to device passcode if biometric fails
   - User can cancel authentication at any time

3. **Best Practices:**
   - Never store credentials in plain text
   - Always require biometric authentication before accessing stored data
   - Provide clear UI feedback for authentication status
   - Allow users to disable biometric at any time

## Future Enhancements
- [ ] Add biometric for transaction confirmation
- [ ] Support for hardware security keys
- [ ] Biometric for sensitive operations (wallet access, etc.)
- [ ] Multi-factor authentication options
- [ ] Biometric re-authentication timeout settings
