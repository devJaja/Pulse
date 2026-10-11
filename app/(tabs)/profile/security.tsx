import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, Lock, Shield, Eye, EyeOff, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { toast } from 'sonner-native';
import { TwoFactorSettings, BiometricSettings } from '@/components/settings';
import { api } from '@/lib/api';

export default function SecurityPrivacyScreen() {
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const response = await api.changePassword(currentPassword, newPassword);
      if (response.error) throw new Error(response.error);

      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
      console.error('Change password error:', error);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center gap-3 px-4 pt-12">
          <TouchableOpacity onPress={() => router.back()}>
            <Icon as={ArrowLeft} size={24} className="text-foreground" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Security & Privacy</Text>
        </View>

        {/* Security Settings */}
        <View className="mt-6 px-4">
          <Text className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            AUTHENTICATION
          </Text>

          <View className="mb-3 gap-3">
            <TwoFactorSettings />

            <BiometricSettings />
          </View>
        </View>

        {/* Change Password */}
        <View className="mt-6 px-4">
          <Text className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            CHANGE PASSWORD
          </Text>

          {/* Current Password */}
          <View className="mb-3">
            <Text className="mb-2 text-sm font-semibold text-muted-foreground">
              Current Password
            </Text>
            <View className="flex-row items-center rounded-2xl bg-card px-4">
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="#727285"
                secureTextEntry={!showCurrentPassword}
                className="flex-1 py-4 text-base text-foreground"
              />
              <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                <Icon
                  as={showCurrentPassword ? EyeOff : Eye}
                  size={20}
                  className="text-muted-foreground"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View className="mb-3">
            <Text className="mb-2 text-sm font-semibold text-muted-foreground">
              New Password
            </Text>
            <View className="flex-row items-center rounded-2xl bg-card px-4">
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor="#727285"
                secureTextEntry={!showNewPassword}
                className="flex-1 py-4 text-base text-foreground"
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                <Icon
                  as={showNewPassword ? EyeOff : Eye}
                  size={20}
                  className="text-muted-foreground"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View className="mb-3">
            <Text className="mb-2 text-sm font-semibold text-muted-foreground">
              Confirm New Password
            </Text>
            <View className="rounded-2xl bg-card p-4">
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#727285"
                secureTextEntry
                className="text-base text-foreground"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleChangePassword}
            disabled={isUpdatingPassword}
            className={`items-center rounded-2xl py-4 ${
              isUpdatingPassword ? 'bg-gray-300' : 'bg-primary active:bg-primary/90'
            }`}
          >
            <Text className="text-lg font-semibold text-primary-foreground">
              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Wallet Security */}
        <View className="mt-6 px-4 pb-6">
          <Text className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            WALLET SECURITY
          </Text>

          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/profile/recovery-phrase')}
            className="mb-3 flex-row items-center gap-4 rounded-2xl bg-card p-4"
          >
            <View className="h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Icon as={Lock} size={24} className="text-purple-600" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold">Recovery Phrase</Text>
              <Text className="text-sm text-muted-foreground">
                View wallet information and security
              </Text>
            </View>
            <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center gap-4 rounded-2xl bg-card p-4">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Icon as={Shield} size={24} className="text-purple-600" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold">Connected Apps</Text>
              <Text className="text-sm text-muted-foreground">
                Manage apps with wallet access
              </Text>
            </View>
            <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
