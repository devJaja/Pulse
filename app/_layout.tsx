import '@/global.css';
import 'react-native-gesture-handler';
import '@/lib/i18n'; // Initialize i18n

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts as useInterFonts,
} from '@expo-google-fonts/inter';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  useFonts as useMonoFonts,
} from '@expo-google-fonts/ibm-plex-mono';
import { useFonts as useBrandFonts } from 'expo-font';
import { Toaster } from 'sonner-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useThemeStore, useThemeSync } from '@/store/useThemeStore';
import { usePathname } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import {KeyboardProvider} from "react-native-keyboard-controller"
import { useLanguage } from '@/hooks/useLanguage';
import AppDownloadBanner from '@/components/web/AppDownloadBanner';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

function RootLayoutContent() {
  const { theme } = useThemeSync();
  const { loadTheme } = useThemeStore();
  const pathname = usePathname();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  
  // Initialize language preference
  useLanguage();

  // Load saved theme preference on mount
  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  // Handle notification interactions (deep linking)
  useEffect(() => {
    // Handle notification received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Handle notification tapped/clicked
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('Notification tapped with data:', data);
      
      // Navigate based on notification data
      handleNotificationNavigation(data);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Handle deep links from URLs
  useEffect(() => {
    // Handle initial URL when app is opened from a link
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl);
      }
    };

    handleInitialURL();

    // Handle URLs when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Parse and handle deep link URLs
  const handleDeepLink = (url: string) => {
    const { hostname, path, queryParams } = Linking.parse(url);
    
    // Ignore expo development client URLs
    if (hostname === 'expo-development-client') {
      return;
    }
    
    console.log('Deep link:', { hostname, path, queryParams });

    if (!path) return;

    // Handle different deep link paths
    if (path.startsWith('transaction/')) {
      const signature = path.replace('transaction/', '');
      router.push(`/transaction/${signature}`);
    } else if (path.startsWith('post/')) {
      const postId = path.replace('post/', '');
      router.push(`/post/${postId}`);
    } else if (path.startsWith('profile/')) {
      const username = path.replace('profile/', '');
      router.push(`/(tabs)/profile?username=${username}`);
    } else if (path.startsWith('chat/')) {
      const chatId = path.replace('chat/', '');
      router.push(`/(tabs)/chats/${chatId}`);
    } else if (path === 'notifications') {
      router.push('/(tabs)/notifications');
    }
  };

  // Handle navigation from notification data
  const handleNotificationNavigation = (data: any) => {
    if (!data) return;

    // Payment received notification
    if (data.signature) {
      router.push(`/transaction/${data.signature}`);
    }
    // Post notification (like, comment)
    else if (data.postId) {
      router.push(`/post/${data.postId}`);
    }
    // Follow notification
    else if (data.username) {
      router.push(`/(tabs)/profile?username=${data.username}`);
    }
    // Chat notification
    else if (data.chatId) {
      router.push(`/(tabs)/chats/${data.chatId}`);
    }
    // Default to notifications page
    else {
      router.push('/(tabs)/notifications');
    }
  };

  // Screens with a full-bleed off-black surface need light status bar content.
  const darkScreens = ['/(tabs)/wallet/history', '/wallet/transactions', '/mini-apps'];
  const usesNavySurface = darkScreens.some((route) => pathname.startsWith(route));

  const getStatusBarStyle = () => {
    if (usesNavySurface) {
      return 'light';
    }
    return theme === 'dark' ? 'light' : 'dark';
  };

  return (
    <ThemeProvider value={theme === 'dark' ? NAV_THEME.dark : NAV_THEME.light}>
      <StatusBar
        style={getStatusBarStyle()}
        backgroundColor={usesNavySurface ? '#0e100f' : undefined}
      />
      <Stack screenOptions={{ headerShown: false }} />
      <PortalHost />
      <Toaster richColors />
      <AppDownloadBanner />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [monoLoaded] = useMonoFonts({
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });

  // Monad brand display font (Britti Sans) for headings, logo and emphasis.
  const [brandLoaded] = useBrandFonts({
    BrittiSans_400Regular: require('../assets/fonts/BrittiSans_400Regular.ttf'),
    BrittiSans_500Medium: require('../assets/fonts/BrittiSans_500Medium.ttf'),
    BrittiSans_600SemiBold: require('../assets/fonts/BrittiSans_600SemiBold.ttf'),
    BrittiSans_700Bold: require('../assets/fonts/BrittiSans_700Bold.ttf'),
    BrittiSans_800ExtraBold: require('../assets/fonts/BrittiSans_800ExtraBold.ttf'),
  });

  const isFontsLoaded = interLoaded && monoLoaded && brandLoaded;

  useEffect(() => {
    if (isFontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isFontsLoaded]);

  if (!isFontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <RootLayoutContent />
          </KeyboardProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
