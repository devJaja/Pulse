import { View, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BiometricButton } from './BiometricButton';
import { biometric } from '@/lib/biometric';
import { storage } from '@/lib/storage';

interface SignInFormProps {
  onSubmit: (data: { email: string; password: string }) => void;
  onSignUp: () => void;
  onForgotPassword?: () => void;
  isSubmitting: boolean;
}

export function SignInForm({ onSubmit, onSignUp, onForgotPassword, isSubmitting }: SignInFormProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showBiometric, setShowBiometric] = useState(false);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const canUse = await biometric.canUseBiometric();
    const enabled = await biometric.isBiometricEnabled();
    const hasCredentials = await storage.getBiometricCredentials();
    setShowBiometric(canUse && enabled && hasCredentials !== null);
  };

  const handleSubmit = async () => {
    onSubmit({ email, password });

    // Save credentials for biometric if enabled
    const enabled = await biometric.isBiometricEnabled();
    if (enabled && email && password) {
      await storage.saveBiometricCredentials(email, password);
    }
  };

  const handleForgotPassword = () => {
    onForgotPassword?.();
  };

  const handleBiometricAuth = async () => {
    const credentials = await storage.getBiometricCredentials();
    if (credentials) {
      onSubmit({ email: credentials.email, password: credentials.password });
    }
  };

  return (
    <View className="flex-1">
      <View className="gap-6">
        <Input
          label={t('auth.email')}
          placeholder="john@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View>
          <Input
            label={t('auth.password')}
            placeholder="**********"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {onForgotPassword && (
            <Pressable className="mt-3" onPress={handleForgotPassword}>
              <Text className="text-sm font-medium text-purple-600">{t('auth.forgotPassword')}</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View className="mt-auto pb-12">
        {showBiometric && (
          <BiometricButton onAuthenticate={handleBiometricAuth} />
        )}

        <Button
          onPress={handleSubmit}
          disabled={isSubmitting}
          className="mb-6 h-14 rounded-2xl bg-primary active:bg-primary/90"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#6e54ff" />
          ) : (
            <Text className="text-base font-medium text-primary-foreground">{t('auth.signIn')}</Text>
          )}
        </Button>

        <View className="flex-row justify-center">
          <Text className="text-sm text-muted-foreground">{t('auth.dontHaveAccount')} </Text>
          <Pressable onPress={onSignUp}>
            <Text className="text-sm font-medium text-purple-600">{t('auth.signUp')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
