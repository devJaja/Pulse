import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Fingerprint } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { biometric } from '@/lib/biometric';

interface BiometricButtonProps {
  onAuthenticate: () => void;
  biometricName?: string;
}

export function BiometricButton({ onAuthenticate, biometricName }: BiometricButtonProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [canUse, setCanUse] = useState(false);
  const [displayName, setDisplayName] = useState('Biometric');

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const available = await biometric.canUseBiometric();
    setCanUse(available);

    if (available && !biometricName) {
      const types = await biometric.getSupportedTypes();
      setDisplayName(biometric.getBiometricName(types));
    } else if (biometricName) {
      setDisplayName(biometricName);
    }
  };

  const handlePress = async () => {
    setIsAuthenticating(true);
    const result = await biometric.authenticate(`Sign in with ${displayName}`);
    setIsAuthenticating(false);

    if (result.success) {
      onAuthenticate();
    }
  };

  if (!canUse) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isAuthenticating}
      className="mb-4 h-14 flex-row items-center justify-center gap-2 rounded-2xl border-2 border-purple-600 bg-background active:bg-purple-50"
    >
      {isAuthenticating ? (
        <ActivityIndicator color="#6e54ff" />
      ) : (
        <>
          <Icon as={Fingerprint} size={24} className="text-purple-600" />
          <Text className="text-base font-medium text-purple-600">
            Sign in with {displayName}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
