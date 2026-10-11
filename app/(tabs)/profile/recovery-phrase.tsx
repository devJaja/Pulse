import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, Copy, AlertTriangle, Eye, EyeOff, Shield } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { toast } from 'sonner-native';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types';

export default function RecoveryPhraseScreen() {
  const { user } = useAuth();
  const currentUser = user as User;
  const [showPhrase, setShowPhrase] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  const handleRevealPhrase = () => {
    Alert.alert(
      'Security Warning',
      'Your recovery phrase gives full access to your wallet. Never share it with anyone. Make sure no one is watching your screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I Understand',
          onPress: () => {
            setHasAcknowledged(true);
            setShowPhrase(true);
          },
        },
      ]
    );
  };

  const handleCopyAddress = async () => {
    if (currentUser?.walletAddress) {
      await Clipboard.setStringAsync(currentUser.walletAddress);
      toast.success('Wallet address copied');
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
          <Text className="text-2xl font-bold">Recovery Phrase</Text>
        </View>

        {/* Warning Banner */}
        <View className="mx-4 mt-6 rounded-2xl bg-red-50 p-4 dark:bg-red-950/30">
          <View className="flex-row items-start gap-3">
            <Icon as={AlertTriangle} size={24} className="text-red-600 mt-0.5" />
            <View className="flex-1">
              <Text className="font-semibold text-red-900 dark:text-red-100">
                Important Security Information
              </Text>
              <Text className="mt-2 text-sm text-red-800 dark:text-red-200">
                Your wallet is managed by Pulse (custodial). We securely store your private keys encrypted on our servers.
              </Text>
            </View>
          </View>
        </View>

        {/* Wallet Info */}
        <View className="mx-4 mt-6">
          <Text className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            YOUR WALLET
          </Text>

          <View className="rounded-2xl bg-card p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-muted-foreground">
                Wallet Address
              </Text>
              <TouchableOpacity onPress={handleCopyAddress}>
                <Icon as={Copy} size={18} className="text-purple-600" />
              </TouchableOpacity>
            </View>
            <Text className="font-mono text-sm">
              {currentUser?.walletAddress}
            </Text>
          </View>
        </View>

        {/* Custodial Wallet Info */}
        <View className="mx-4 mt-6">
          <Text className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            ABOUT CUSTODIAL WALLETS
          </Text>

          <View className="rounded-2xl bg-card p-4 gap-4">
            <View className="flex-row items-start gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <Icon as={Shield} size={20} className="text-purple-600 dark:text-purple-300" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold">Secure Storage</Text>
                <Text className="mt-1 text-sm text-muted-foreground">
                  Your private keys are encrypted and securely stored on our servers using industry-standard encryption.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Icon as={Shield} size={20} className="text-blue-600 dark:text-blue-300" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold">Easy Recovery</Text>
                <Text className="mt-1 text-sm text-muted-foreground">
                  If you lose access to your account, you can recover it using your email and password. No need to manage seed phrases.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <Icon as={Shield} size={20} className="text-success dark:text-success" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold">Account Security</Text>
                <Text className="mt-1 text-sm text-muted-foreground">
                  Enable 2FA and biometric authentication for additional security layers.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Security Tips */}
        <View className="mx-4 mt-6 mb-6">
          <Text className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            SECURITY TIPS
          </Text>

          <View className="rounded-2xl bg-card p-4 gap-3">
            <Text className="text-sm text-muted-foreground">
              • Use a strong, unique password for your account
            </Text>
            <Text className="text-sm text-muted-foreground">
              • Enable two-factor authentication (2FA)
            </Text>
            <Text className="text-sm text-muted-foreground">
              • Enable biometric login for quick access
            </Text>
            <Text className="text-sm text-muted-foreground">
              • Never share your password with anyone
            </Text>
            <Text className="text-sm text-muted-foreground">
              • Be cautious of phishing attempts
            </Text>
            <Text className="text-sm text-muted-foreground">
              • Keep your email account secure
            </Text>
          </View>
        </View>

        {/* Export Option (Future Feature) */}
        <View className="mx-4 mb-6">
          <View className="rounded-2xl bg-yellow-50 p-4 dark:bg-yellow-950/30">
            <Text className="font-semibold text-yellow-900 dark:text-yellow-100">
              Want to export your wallet?
            </Text>
            <Text className="mt-2 text-sm text-yellow-800 dark:text-yellow-200">
              Contact support if you need to export your private key to use with other wallets. This feature requires additional verification for security.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile/help')}
              className="mt-3 rounded-xl bg-yellow-600 py-3"
            >
              <Text className="text-center font-semibold text-white">
                Contact Support
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
