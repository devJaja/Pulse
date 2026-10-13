import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
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
        <View className="flex-row items-center gap-3 px-4 pt-14 pb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={12}
            className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-soft active:bg-secondary"
          >
            <Icon as={ArrowLeft} size={20} className="text-foreground" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold tracking-tight text-foreground">
            Security & Privacy
          </Text>
        </View>

        {/* Security Settings */}
        <View className="mt-6 px-4">
          <Text className="mb-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
            Authentication
          </Text>

          <View className="gap-3">
            <TwoFactorSettings />
            <BiometricSettings />
          </View>
        </View>

        {/* Change Password */}
        <View className="mt-6 px-4">
          <Text className="mb-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
            Change Password
          </Text>

          {/* Current Password */}
          <View className="mb-3">
            <Text className="mb-2 text-sm font-semibold text-foreground">Current Password</Text>
            <View className="flex-row items-center rounded-xl border border-border bg-card px-4">
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="#727285"
                secureTextEntry={!showCurrentPassword}
                className="flex-1 py-3.5 text-base text-foreground"
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                hitSlop={12}
              >
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
            <Text className="mb-2 text-sm font-semibold text-foreground">New Password</Text>
            <View className="flex-row items-center rounded-xl border border-border bg-card px-4">
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor="#727285"
                secureTextEntry={!showNewPassword}
                className="flex-1 py-3.5 text-base text-foreground"
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                hitSlop={12}
              >
                <Icon
                  as={showNewPassword ? EyeOff : Eye}
                  size={20}
                  className="text-muted-foreground"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-foreground">
              Confirm New Password
            </Text>
            <View className="rounded-xl border border-border bg-card px-4">
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#727285"
                secureTextEntry
                className="py-3.5 text-base text-foreground"
              />
            </View>
          </View>

          <Button onPress={handleChangePassword} disabled={isUpdatingPassword} className="rounded-xl">
            {isUpdatingPassword ? <Text>Updating...</Text> : <Text>Update Password</Text>}
          </Button>
        </View>

        {/* Wallet Security */}
        <View className="mt-6 px-4 pb-8">
          <Text className="mb-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
            Wallet Security
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile/recovery-phrase')}
            className="mb-3 flex-row items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft active:bg-secondary"
          >
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Icon as={Lock} size={20} className="text-primary" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground">Recovery Phrase</Text>
              <Text className="text-2xs text-muted-foreground">
                View wallet information and security
              </Text>
            </View>
            <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft active:bg-secondary">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Icon as={Shield} size={20} className="text-primary" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground">Connected Apps</Text>
              <Text className="text-2xs text-muted-foreground">
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
