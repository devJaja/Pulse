import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner-native';
import { AuthLayout, AuthHeader } from '@/components/auth';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendReset = async () => {
    if (!email.trim()) {
      toast.error(t('auth.pleaseEnterEmail'));
      return;
    }

    setIsSending(true);
    try {
      await api.requestPasswordReset({ email });
      setEmailSent(true);
      toast.success(t('auth.passwordResetEmailSent'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('auth.failedToSendResetEmail'));
      console.error('Password reset error:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AuthLayout>
      <View className="flex-1 px-5 pt-12">
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Icon as={ArrowLeft} size={24} className="text-foreground" />
        </TouchableOpacity>

        {!emailSent ? (
          <>
            <AuthHeader
              title={t('auth.forgotPassword')}
              subtitle={t('auth.resetPasswordDesc')}
            />

            <View className="gap-6">
              <Input
                label={t('auth.email')}
                placeholder="john@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View className="mt-auto pb-12">
              <Button
                onPress={handleSendReset}
                disabled={isSending}
                className="h-14 rounded-2xl bg-primary active:bg-primary/90"
              >
                {isSending ? (
                  <ActivityIndicator color="#6e54ff" />
                ) : (
                  <Text className="text-base font-medium text-primary-foreground">{t('auth.sendResetLink')}</Text>
                )}
              </Button>
            </View>
          </>
        ) : (
          <>
            <View className="items-center mb-8">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-success/10 mb-4">
                <Icon as={Mail} size={40} className="text-success dark:text-success" />
              </View>
              <Text className="text-2xl font-bold text-center mb-2">{t('auth.checkYourEmail')}</Text>
              <Text className="text-center text-muted-foreground">
                {t('auth.resetLinkSent')} {email}
              </Text>
            </View>

            <View className="rounded-2xl bg-card p-4 mb-6">
              <Text className="text-sm text-muted-foreground">
                {t('auth.didntReceiveEmail')}
              </Text>
            </View>

            <View className="mt-auto pb-12">
              <Button
                onPress={() => router.push({ pathname: '/auth/reset-password', params: { email } })}
                className="h-14 rounded-2xl bg-primary active:bg-primary/90"
              >
                <Text className="text-base font-medium text-primary-foreground">Enter Reset Code</Text>
              </Button>

              <TouchableOpacity
                onPress={() => setEmailSent(false)}
                className="mt-4"
              >
                <Text className="text-center text-sm font-medium text-purple-600">
                  {t('auth.tryDifferentEmail')}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </AuthLayout>
  );
}
