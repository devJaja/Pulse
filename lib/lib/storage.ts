import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: '@pulse:token',
  USER: '@pulse:user',
  ONBOARDING_COMPLETED: '@pulse:onboarding_completed',
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
};
