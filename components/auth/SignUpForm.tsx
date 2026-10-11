import { View, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SignUpFormProps {
  onSubmit: (data: { email: string; password: string; username: string }) => void;
  isSubmitting: boolean;
}

export function SignUpForm({ onSubmit, isSubmitting }: SignUpFormProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = () => {
    onSubmit({ email, password, username });
  };

  return (
    <>
      <View className="gap-4">
        <Input
          label={t('auth.username')}
          placeholder="johndoe"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Input
          label={t('auth.email')}
          placeholder="john@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Input
          label={t('auth.password')}
          placeholder="At least 8 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View className="mt-auto px-5 pb-12">
        <Button
          onPress={handleSubmit}
          disabled={isSubmitting}
          className="h-14 rounded-2xl bg-primary active:bg-primary/90"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#6e54ff" />
          ) : (
            <Text className="text-base font-medium text-primary-foreground">{t('auth.signUp')}</Text>
          )}
        </Button>
      </View>
    </>
  );
}
