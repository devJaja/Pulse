import { View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface VerificationInputProps {
  onVerify: (code: string) => void;
  onResend: () => void;
  onBack?: () => void;
  isVerifying: boolean;
  isResending: boolean;
}

export function VerificationInput({
  onVerify,
  onResend,
  onBack,
  isVerifying,
  isResending
}: VerificationInputProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    if (text && !/^\d+$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const verificationCode = code.join('');
    onVerify(verificationCode);
  };

  const handleResend = () => {
    onResend();
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <>
      <View className="mb-auto flex-row justify-center gap-2">
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            keyboardType="number-pad"
            maxLength={1}
            className={`h-14 w-12 rounded-xl bg-card text-center text-lg font-semibold text-foreground border-2 ${
              focusedIndex === index ? 'border-purple-600' : 'border-transparent'
            }`}
            placeholder="0"
            placeholderTextColor="#E4DFFF"
            autoFocus={index === 0}
          />
        ))}
      </View>

      <View className="pb-12">
        <Button
          onPress={handleVerify}
          disabled={isVerifying}
          className="mb-4 h-14 rounded-2xl bg-primary active:bg-primary/90"
        >
          {isVerifying ? (
            <ActivityIndicator color="#6e54ff" />
          ) : (
            <Text className="text-base font-medium text-primary-foreground">{t('auth.verify')}</Text>
          )}
        </Button>

        <Pressable onPress={handleResend} disabled={isResending}>
          <Text className="mb-4 text-center text-base font-medium text-purple-600">
            {isResending ? t('common.loading') : t('auth.resendCode')}
          </Text>
        </Pressable>

        {onBack && (
          <Pressable onPress={onBack}>
            <Text className="text-center text-base font-medium text-muted-foreground">{t('common.back')}</Text>
          </Pressable>
        )}
      </View>
    </>
  );
}
