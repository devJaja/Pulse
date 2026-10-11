import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Get FCM token for push notifications
 * Works with both Expo Go and production builds
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    // Request permissions first
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Push notification permissions not granted');
      return null;
    }

    // Set up notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6e54ff',
        sound: 'default',
      });
    }

    // Get the native FCM token (not Expo token)
    const tokenData = await Notifications.getDevicePushTokenAsync();
    console.log('FCM Token:', tokenData.data);
    
    return tokenData.data;
  } catch (error: any) {
    console.error('Error getting FCM token:', error?.message || error);
    
    if (__DEV__) {
      console.log('Push notifications not available in development build.');
      console.log('To enable push notifications:');
      console.log('1. Build with EAS: eas build --profile production --platform android');
      console.log('2. Or use Expo Go for testing');
    }
    
    return null;
  }
}

/**
 * Configure notification handler
 */
export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}
