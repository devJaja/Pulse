import { View, ScrollView, TouchableOpacity, Switch, Alert, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Grid, Users, Bell, Moon, Globe, HelpCircle, FileText, LogOut, ChevronRight, Check, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useThemeStore } from '@/store/useThemeStore';
import * as ExpoNotifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { api } from '@/lib/api';
import { toast } from 'sonner-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/types';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
];

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const [showModal, setShowModal] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const { logout, user } = useAuth();
  const { i18n, t } = useTranslation();

  useEffect(() => {
    checkNotificationStatus();
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      // First try to get from user profile
      const userWithLang = user as User | null;
      if (userWithLang?.language) {
        setCurrentLang(userWithLang.language);
        await i18n.changeLanguage(userWithLang.language);
      } else {
        // Fallback to AsyncStorage
        const savedLang = await AsyncStorage.getItem('userLanguage');
        if (savedLang) {
          setCurrentLang(savedLang);
          await i18n.changeLanguage(savedLang);
        }
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  };

  const checkNotificationStatus = async () => {
    const { status } = await ExpoNotifications.getPermissionsAsync();
    setNotifications(status === 'granted');
  };

  const handlePress = () => {
    console.log('Language button pressed');
    setShowModal(true);
  };

  const handleLanguageChange = async (languageCode: string) => {
    console.log('Language selected:', languageCode);
    try {
      // Update i18n
      await i18n.changeLanguage(languageCode);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('userLanguage', languageCode);
      
      // Save to backend
      const response = await api.updateLanguage(languageCode);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setCurrentLang(languageCode);
      const language = LANGUAGES.find(lang => lang.code === languageCode);
      toast.success(`Language changed to ${language?.nativeName}`);
      setShowModal(false);
    } catch (error) {
      console.error('Language change error:', error);
      toast.error('Failed to change language');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.signOut'),
      t('settings.logoutConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('auth.signOut'),
          style: 'destructive',
          onPress: () => logout(),
        },
      ],
      { cancelable: true }
    );
  };

  const handleThemeToggle = async () => {
    await toggleTheme();
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      // Request permission and register token
      const { status: existingStatus } = await ExpoNotifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await ExpoNotifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        toast.error('Failed to get push notification permissions');
        setNotifications(false);
        return;
      }

      // Set up notification channel for Android
      if (Platform.OS === 'android') {
        await ExpoNotifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: ExpoNotifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6e54ff',
        });
      }

      // Get push token
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;

        if (!projectId) {
          toast.error('Push notifications require EAS Build');
          setNotifications(false);
          return;
        }

        const token = (await ExpoNotifications.getExpoPushTokenAsync({ projectId })).data;

        // Register token with backend
        const response = await api.registerPushToken(token);
        if (response.error) {
          toast.error('Failed to register push token');
          setNotifications(false);
          return;
        }

        setNotifications(true);
        toast.success('Notifications enabled!');
      } catch (error: any) {
        console.error('Error getting push token:', error);

        if (__DEV__) {
          toast.error('Push notifications not available in dev build');
        } else {
          toast.error('Failed to enable notifications');
        }

        setNotifications(false);
      }
    } else {
      // Disable notifications
      setNotifications(false);
      toast.success('Notifications disabled');
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header */}
        <View className="px-4 pt-12">
          <Text className="text-3xl font-bold">{t('settings.settings')}</Text>
        </View>

        {/* Account Section */}
        <View className="mt-6 px-4">
          <Text className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            {t('settings.account')}
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/profile/edit')}
            className="mb-3 flex-row items-center gap-4 rounded-2xl bg-card p-4"
          >
            <View className="h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Icon as={Grid} size={24} className="text-purple-600" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold">{t('settings.editProfile')}</Text>
              <Text className="text-sm text-muted-foreground">
                {t('settings.editProfileDesc')}
              </Text>
            </View>
            <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/profile/security')}
            className="flex-row items-center gap-4 rounded-2xl bg-card p-4"
          >
            <View className="h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Icon as={Users} size={24} className="text-purple-600" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold">{t('settings.securityPrivacy')}</Text>
              <Text className="text-sm text-muted-foreground">
                {t('settings.securityPrivacyDesc')}
              </Text>
            </View>
            <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View className="mt-6 px-4">
          <Text className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            {t('settings.preferences')}
          </Text>

          <View className="mb-3 flex-row items-center gap-4 rounded-2xl bg-card p-4">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Icon as={Bell} size={24} className="text-purple-600" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold">{t('settings.notifications')}</Text>
              <Text className="text-sm text-muted-foreground">
                {notifications ? t('settings.notificationsEnabled') : t('settings.notificationsDisabled')}
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#E4DFFF', true: '#6e54ff' }}
              thumbColor="#ffffff"
            />
          </View>

          <View className="mb-3 flex-row items-center gap-4 rounded-2xl bg-card p-4">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Icon as={Moon} size={24} className="text-purple-600" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold">{t('settings.darkMode')}</Text>
              <Text className="text-sm text-muted-foreground">
                {theme === 'dark' ? t('settings.darkModeEnabled') : t('settings.darkModeDisabled')}
              </Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={handleThemeToggle}
              trackColor={{ false: '#E4DFFF', true: '#6e54ff' }}
              thumbColor="#ffffff"
            />
          </View>

          <TouchableOpacity 
            onPress={handlePress}
            className="flex-row items-center gap-4 rounded-2xl bg-card p-4"
          >
            <View className="h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Icon as={Globe} size={24} className="text-purple-600" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold">{t('settings.language')}</Text>
              <Text className="text-sm text-muted-foreground">
                {LANGUAGES.find(lang => lang.code === currentLang)?.nativeName || 'English'}
              </Text>
            </View>
            <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View className="mt-6 px-4 pb-6">
          <Text className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            {t('settings.support')}
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/profile/help')}
            className="mb-3 flex-row items-center gap-4 rounded-2xl bg-card p-4"
          >
            <View className="h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Icon as={HelpCircle} size={24} className="text-purple-600" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold">{t('settings.helpSupport')}</Text>
              <Text className="text-sm text-muted-foreground">
                {t('settings.helpSupportDesc')}
              </Text>
            </View>
            <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/profile/terms')}
            className="flex-row items-center gap-4 rounded-2xl bg-card p-4"
          >
            <View className="h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Icon as={FileText} size={24} className="text-purple-600" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold">{t('settings.termsPrivacy')}</Text>
              <Text className="text-sm text-muted-foreground">
                {t('settings.termsPrivacyDesc')}
              </Text>
            </View>
            <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View className="px-4 pb-8">
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-primary py-4"
          >
            <Icon as={LogOut} size={20} className="text-primary-foreground" />
            <Text className="text-lg font-semibold text-primary-foreground">{t('auth.signOut')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LanguageModal 
        showModal={showModal}
        setShowModal={setShowModal}
        currentLang={currentLang}
        handleLanguageChange={handleLanguageChange}
      />
    </View>
  );
}

const LanguageModal = ({ showModal, setShowModal, currentLang, handleLanguageChange }: { showModal: boolean; currentLang: string; setShowModal: (value: boolean) => void; handleLanguageChange: (code: string) => void; }) => {
  return (<Modal
    visible={showModal}
    transparent
    animationType="slide"
    onRequestClose={() => setShowModal(false)}
  >
    <View className="flex-1 bg-black/50 justify-end">
      <View className="rounded-t-3xl bg-background p-6 max-h-[80%]">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold">Select Language</Text>
          <TouchableOpacity onPress={() => setShowModal(false)}>
            <Icon as={X} size={24} className="text-foreground" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {LANGUAGES.map((language) => (
            <TouchableOpacity
              key={language.code}
              onPress={() => handleLanguageChange(language.code)}
              className="flex-row items-center justify-between rounded-xl bg-card p-4 mb-2"
              activeOpacity={0.7}
            >
              <View>
                <Text className="font-semibold">{language.nativeName}</Text>
                <Text className="text-sm text-muted-foreground">{language.name}</Text>
              </View>
              {currentLang === language.code && (
                <Icon as={Check} size={20} className="text-purple-600" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>)
}