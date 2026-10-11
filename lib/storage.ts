import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: '@pulse:token',
  USER: '@pulse:user',
  ONBOARDING_COMPLETED: '@pulse:onboarding_completed',
  FIRST_TIME_USER: '@pulse:first_time_user',
  BIOMETRIC_ENABLED: '@pulse:biometric_enabled',
  BIOMETRIC_CREDENTIALS: '@pulse:biometric_credentials',
  TWO_FA_ENABLED: '@pulse:2fa_enabled',
  RECOVERY_CODES: '@pulse:recovery_codes',
};

export const storage = {
  // Token
  async saveToken(token: string) {
    await AsyncStorage.setItem(KEYS.TOKEN, token);
  },

  async getToken() {
    return await AsyncStorage.getItem(KEYS.TOKEN);
  },

  async removeToken() {
    await AsyncStorage.removeItem(KEYS.TOKEN);
  },

  // User
  async saveUser(user: any) {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  async getUser() {
    const user = await AsyncStorage.getItem(KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  async removeUser() {
    await AsyncStorage.removeItem(KEYS.USER);
  },

  // Clear all
  async clear() {
    await AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER]);
  },

  // Onboarding
  async setOnboardingCompleted() {
    await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETED, 'true');
  },

  async hasCompletedOnboarding() {
    const completed = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETED);
    return completed === 'true';
  },

  // First Time User
  async setFirstTimeUser(isFirstTime: boolean) {
    await AsyncStorage.setItem(KEYS.FIRST_TIME_USER, isFirstTime ? 'true' : 'false');
  },

  async isFirstTimeUser() {
    const firstTime = await AsyncStorage.getItem(KEYS.FIRST_TIME_USER);
    // If not set, default to true (first time)
    return firstTime === null ? true : firstTime === 'true';
  },

  // Biometric
  async setBiometricEnabled(enabled: boolean) {
    await AsyncStorage.setItem(KEYS.BIOMETRIC_ENABLED, enabled ? 'true' : 'false');
  },

  async getBiometricEnabled() {
    const enabled = await AsyncStorage.getItem(KEYS.BIOMETRIC_ENABLED);
    return enabled === 'true';
  },

  async saveBiometricCredentials(email: string, password: string) {
    const credentials = { email, password };
    await AsyncStorage.setItem(KEYS.BIOMETRIC_CREDENTIALS, JSON.stringify(credentials));
  },

  async getBiometricCredentials() {
    const credentials = await AsyncStorage.getItem(KEYS.BIOMETRIC_CREDENTIALS);
    return credentials ? JSON.parse(credentials) : null;
  },

  async removeBiometricCredentials() {
    await AsyncStorage.removeItem(KEYS.BIOMETRIC_CREDENTIALS);
  },

  // Two-Factor Authentication
  async set2FAEnabled(enabled: boolean) {
    await AsyncStorage.setItem(KEYS.TWO_FA_ENABLED, enabled ? 'true' : 'false');
  },

  async get2FAEnabled() {
    const enabled = await AsyncStorage.getItem(KEYS.TWO_FA_ENABLED);
    return enabled === 'true';
  },

  async saveRecoveryCodes(codes: string[]) {
    await AsyncStorage.setItem(KEYS.RECOVERY_CODES, JSON.stringify(codes));
  },

  async getRecoveryCodes() {
    const codes = await AsyncStorage.getItem(KEYS.RECOVERY_CODES);
    return codes ? JSON.parse(codes) : null;
  },

  async removeRecoveryCodes() {
    await AsyncStorage.removeItem(KEYS.RECOVERY_CODES);
  },
};
