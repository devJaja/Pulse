import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner-native';
import { AuthLayout, AuthHeader } from '@/components/auth';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!code.trim() || !password.trim() || !confirmPassword.trim()) {
      toast.error(t('auth.pleaseFillAllFields'));
      return;
    }
    if (password.length < 8) {
      toast.error(t('auth.passwordMinLength'));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t('auth.passwordsDoNotMatch'));
      return;
    }

    setIsResetting(true);
    try {
      const response = await api.resetPassword({ token: code, password });
      if ((response as any).error) throw new Error((response as any).error);
      setResetSuccess(true);
      toast.success(t('auth.passwordResetSuccessToast'));
    } catch (error: any) {
      toast.error(error.message || t('auth.failedToResetPassword'));
    } finally {
      setIsResetting(false);
    }
  };

  if (resetSuccess) {
    return (
      <AuthLayout>
        <View className="flex-1 items-center justify-center px-5">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-success/10 mb-4">
            <Icon as={CheckCircle} size={40} className="text-success dark:text-success" />
          </View>
          <Text className="text-2xl font-bold text-center mb-2">{t('auth.passwordResetSuccess')}</Text>
          <Text className="text-center text-muted-foreground mb-8">
            {t('auth.passwordResetSuccessDesc')}
          </Text>
          <Button
            onPress={() => router.replace('/auth/signin')}
            className="w-full h-14 rounded-2xl bg-primary"
          >
            <Text className="text-base font-medium text-primary-foreground">{t('auth.signIn')}</Text>
          </Button>
        </View>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <View className="flex-1 px-5 pt-12">
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Icon as={ArrowLeft} size={24} className="text-foreground" />
        </TouchableOpacity>

        <AuthHeader
          title={t('auth.resetPassword')}
          subtitle={`Enter the 6-digit code sent to ${email ?? 'your email'} and choose a new password.`}
        />

        <View className="gap-6">
          <Input
            label="Reset Code"
            placeholder="123456"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
          />
          <Input
            label={t('auth.newPassword')}
            placeholder={t('auth.passwordMinLength')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Input
            label={t('auth.confirmPassword')}
            placeholder={t('auth.reenterPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <View className="mt-auto pb-12">
          <Button
            onPress={handleResetPassword}
            disabled={isResetting}
            className="h-14 rounded-2xl bg-primary active:bg-primary/90"
          >
            {isResetting ? (
              <ActivityIndicator color="#6e54ff" />
            ) : (
              <Text className="text-base font-medium text-primary-foreground">{t('auth.resetPassword')}</Text>
            )}
          </Button>
        </View>
      </View>
    </AuthLayout>
  );
}
