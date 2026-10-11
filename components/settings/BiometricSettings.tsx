import { View, TouchableOpacity, Switch } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Fingerprint, AlertCircle } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { biometric } from '@/lib/biometric';
import { toast } from 'sonner-native';

interface BiometricSettingsProps {
  onToggle?: (enabled: boolean) => void;
}

export function BiometricSettings({ onToggle }: BiometricSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [canUse, setCanUse] = useState(false);
  const [biometricName, setBiometricName] = useState('Biometric');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    setIsLoading(true);
    const available = await biometric.canUseBiometric();
    setCanUse(available);

    if (available) {
      const types = await biometric.getSupportedTypes();
      setBiometricName(biometric.getBiometricName(types));
      
      const enabled = await biometric.isBiometricEnabled();
      setIsEnabled(enabled);
    }
    setIsLoading(false);
  };

  const handleToggle = async (value: boolean) => {
    if (value) {
      // Enable biometric - authenticate first
      const result = await biometric.authenticate(`Enable ${biometricName}`);
      
      if (result.success) {
        await biometric.enableBiometric();
        setIsEnabled(true);
        toast.success(`${biometricName} enabled`);
        onToggle?.(true);
      } else {
        toast.error(result.error || 'Authentication failed');
      }
    } else {
      // Disable biometric
      await biometric.disableBiometric();
      setIsEnabled(false);
      toast.success(`${biometricName} disabled`);
      onToggle?.(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (!canUse) {
    return (
      <View className="rounded-2xl bg-yellow-50 p-4 dark:bg-yellow-950/30">
        <View className="flex-row items-start gap-3">
          <Icon as={AlertCircle} size={20} className="text-yellow-600 mt-0.5" />
          <View className="flex-1">
            <Text className="font-semibold text-yellow-900 dark:text-yellow-100">
              Biometric Not Available
            </Text>
            <Text className="mt-1 text-sm text-yellow-700 dark:text-yellow-200">
              Your device doesn't support biometric authentication or you haven't set it up yet.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="rounded-2xl bg-card p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
            <Icon as={Fingerprint} size={20} className="text-purple-600 dark:text-purple-300" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold">{biometricName} Sign In</Text>
            <Text className="text-sm text-muted-foreground">
              Use {biometricName.toLowerCase()} to sign in quickly
            </Text>
          </View>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={handleToggle}
          trackColor={{ false: '#E4DFFF', true: '#6e54ff' }}
          thumbColor="#ffffff"
        />
      </View>
    </View>
  );
}
