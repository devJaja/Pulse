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
      <View className="flex-1 px-6 pt-14">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-8 h-11 w-11 items-center justify-center rounded-xl border border-border bg-card active:bg-accent"
        >
          <Icon as={ArrowLeft} size={22} className="text-foreground" />
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
              <View className="mb-5 h-20 w-20 items-center justify-center rounded-full border border-success/20 bg-success/10">
                <Icon as={Mail} size={38} className="text-success" strokeWidth={1.8} />
              </View>
              <Text className="mb-2 text-center text-2xl font-bold tracking-tight text-foreground">{t('auth.checkYourEmail')}</Text>
              <Text className="text-center text-base leading-6 text-muted-foreground">
                {t('auth.resetLinkSent')} {email}
              </Text>
            </View>

            <View className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-soft">
              <Text className="text-sm leading-5 text-muted-foreground">
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
                className="mt-4 h-11 items-center justify-center"
              >
                <Text className="text-center text-sm font-medium text-primary">
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
