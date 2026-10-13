import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, User, Bell, Lock, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { BiometricSettings, TwoFactorSettings, LanguageSelector } from '@/components/settings';

export default function SettingsScreen() {
  const { logout } = useAuth();

  const handleSignOut = () => {
    logout();
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="border-b border-border bg-card px-4 pb-5 pt-12">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-secondary active:opacity-70"
          >
            <Icon as={ArrowLeft} size={20} className="text-foreground" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold">Settings</Text>
            <Text className="mt-0.5 text-sm text-muted-foreground">
              Manage your account and preferences
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View className="px-4 pt-6">
          <Text className="mb-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </Text>

          <View className="gap-3">
            <TouchableOpacity className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft active:opacity-80">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-500/15">
                <Icon as={User} size={20} className="text-purple-600 dark:text-purple-300" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold">Profile Settings</Text>
                <Text className="mt-0.5 text-sm text-muted-foreground">Edit your profile information</Text>
              </View>
              <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft active:opacity-80">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/15">
                <Icon as={Bell} size={20} className="text-blue-600 dark:text-blue-300" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold">Notifications</Text>
                <Text className="mt-0.5 text-sm text-muted-foreground">Manage notification preferences</Text>
              </View>
              <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
            </TouchableOpacity>

            <LanguageSelector />
          </View>
        </View>

        {/* Security Section */}
        <View className="px-4 pt-6">
          <Text className="mb-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
            Security
          </Text>

          <View className="gap-3">
            <BiometricSettings />

            <TwoFactorSettings />

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile/security')}
              className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft active:opacity-80"
            >
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-success/10">
                <Icon as={Lock} size={20} className="text-success" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold">Change Password</Text>
                <Text className="mt-0.5 text-sm text-muted-foreground">Update your password</Text>
              </View>
              <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft active:opacity-80">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-500/15">
                <Icon as={Shield} size={20} className="text-orange-600 dark:text-orange-300" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold">Privacy</Text>
                <Text className="mt-0.5 text-sm text-muted-foreground">Control your privacy settings</Text>
              </View>
              <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View className="px-4 pt-6">
          <Text className="mb-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
            Help &amp; Support
          </Text>

          <View className="gap-3">
            <TouchableOpacity className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft active:opacity-80">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-500/15">
                <Icon as={HelpCircle} size={20} className="text-gray-600 dark:text-gray-300" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold">Help &amp; Support</Text>
                <Text className="mt-0.5 text-sm text-muted-foreground">Get help with your account</Text>
              </View>
              <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out */}
        <View className="px-4 py-6">
          <TouchableOpacity
            onPress={handleSignOut}
            className="flex-row items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 active:opacity-80 dark:border-red-900/40 dark:bg-red-950/30"
          >
            <Icon as={LogOut} size={20} className="text-red-600 dark:text-red-400" />
            <Text className="font-semibold text-red-600 dark:text-red-400">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
