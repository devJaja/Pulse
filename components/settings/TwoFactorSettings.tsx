import { View, TouchableOpacity, Switch, Modal, ScrollView, ActivityIndicator, TextInput, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Shield, X, Copy, Download, AlertCircle } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { twoFactor } from '@/lib/twoFactor';
import { toast } from 'sonner-native';
import * as Clipboard from 'expo-clipboard';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface TwoFactorSettingsProps {
  onToggle?: (enabled: boolean) => void;
}

export function TwoFactorSettings({ onToggle }: TwoFactorSettingsProps) {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    checkTwoFactor();
  }, []);

  const checkTwoFactor = async () => {
    setIsLoading(true);
    // Prefer server truth from the auth profile when available
    const serverEnabled = (user as any)?.twoFactorEnabled;
    if (serverEnabled !== undefined) {
      setIsEnabled(!!serverEnabled);
      setIsLoading(false);
      return;
    }
    const enabled = await twoFactor.isEnabled();
    setIsEnabled(enabled);
    setIsLoading(false);
  };

  const handleEnable = async () => {
    try {
      // Request 2FA setup from backend
      const response = await api.setup2FA();

      if (response.error) {
        toast.error(response.error);
        return;
      }

      if (response.data) {
        setQrCodeUrl(response.data.qrCode);
        setSecret(response.data.secret);
        setShowSetupModal(true);
      }
    } catch (error) {
      toast.error('Failed to setup 2FA');
      console.error('2FA setup error:', error);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      // Verify the code with backend
      const response = await api.verify2FA({ code: verificationCode });

      if (response.error) {
        toast.error(response.error);
        return;
      }

      if (response.data?.success) {
        await twoFactor.enable();
        
        // Save recovery codes
        if (response.data.recoveryCodes) {
          await twoFactor.saveRecoveryCodes(response.data.recoveryCodes);
          setRecoveryCodes(response.data.recoveryCodes);
        }
        
        setIsEnabled(true);
        setShowSetupModal(false);
        setShowRecoveryModal(true);
        toast.success('2FA enabled successfully');
        onToggle?.(true);
      } else {
        toast.error('Invalid verification code');
      }
    } catch (error) {
      toast.error('Verification failed');
      console.error('2FA verification error:', error);
    } finally {
      setIsVerifying(false);
      setVerificationCode('');
    }
  };

  const handleDisable = async () => {
    try {
      const response = await api.disable2FA();
      if (response.error) {
        toast.error(response.error);
        return;
      }
      await twoFactor.disable();
      setIsEnabled(false);
      toast.success('2FA disabled');
      onToggle?.(false);
    } catch (error) {
      toast.error('Failed to disable 2FA');
      console.error('2FA disable error:', error);
    }
  };

  const handleCopySecret = async () => {
    await Clipboard.setStringAsync(secret);
    toast.success('Secret copied to clipboard');
  };

  const handleCopyRecoveryCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    toast.success('Recovery code copied');
  };

  const handleViewRecoveryCodes = async () => {
    const codes = await twoFactor.getRecoveryCodes();
    if (codes) {
      setRecoveryCodes(codes);
      setShowRecoveryModal(true);
    } else {
      toast.error('No recovery codes found');
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      <View className="rounded-2xl bg-card p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-success/10">
              <Icon as={Shield} size={20} className="text-success dark:text-success" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold">Two-Factor Authentication</Text>
              <Text className="text-sm text-muted-foreground">
                Add an extra layer of security
              </Text>
            </View>
          </View>
          <Switch
            value={isEnabled}
            onValueChange={(value) => value ? handleEnable() : handleDisable()}
            trackColor={{ false: '#E4DFFF', true: '#6e54ff' }}
            thumbColor="#ffffff"
          />
        </View>

        {isEnabled && (
          <TouchableOpacity
            onPress={handleViewRecoveryCodes}
            className="mt-3 rounded-xl bg-purple-50 p-3 dark:bg-purple-950/30"
          >
            <Text className="text-center text-sm font-medium text-purple-600">
              View Recovery Codes
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Setup Modal */}
      <Modal
        visible={showSetupModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSetupModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="mx-4 w-full max-w-md rounded-3xl bg-background p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold">Setup 2FA</Text>
              <TouchableOpacity onPress={() => setShowSetupModal(false)}>
                <Icon as={X} size={24} className="text-foreground" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="mb-4 text-muted-foreground">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </Text>

              {/* QR Code */}
              {qrCodeUrl ? (
                <View className="items-center justify-center rounded-2xl bg-white p-4 mb-4">
                  <Image
                    source={{ uri: qrCodeUrl }}
                    style={{ width: 220, height: 220 }}
                    resizeMode="contain"
                  />
                </View>
              ) : null}

              <Text className="mb-2 text-sm font-medium">Or enter this code manually:</Text>
              <View className="flex-row items-center gap-2 rounded-xl bg-card p-3 mb-4">
                <Text className="flex-1 font-mono text-sm">{secret}</Text>
                <TouchableOpacity onPress={handleCopySecret}>
                  <Icon as={Copy} size={20} className="text-purple-600" />
                </TouchableOpacity>
              </View>

              <Text className="mb-2 text-sm font-medium">Enter verification code:</Text>
              <View className="rounded-xl bg-card p-1 mb-4">
                <TextInput
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  placeholder="000000"
                  placeholderTextColor="#727285"
                  maxLength={6}
                  keyboardType="number-pad"
                  className="text-center text-2xl font-mono text-foreground py-3"
                />
              </View>

              <TouchableOpacity
                onPress={handleVerifyAndEnable}
                disabled={isVerifying || verificationCode.length !== 6}
                className={`rounded-2xl py-4 ${
                  isVerifying || verificationCode.length !== 6 ? 'bg-gray-300' : 'bg-primary'
                }`}
              >
                {isVerifying ? (
                  <ActivityIndicator color="#6e54ff" />
                ) : (
                  <Text className="text-center font-semibold text-primary-foreground">
                    Verify and Enable
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Recovery Codes Modal */}
      <Modal
        visible={showRecoveryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRecoveryModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="mx-4 w-full max-w-md rounded-3xl bg-background p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold">Recovery Codes</Text>
              <TouchableOpacity onPress={() => setShowRecoveryModal(false)}>
                <Icon as={X} size={24} className="text-foreground" />
              </TouchableOpacity>
            </View>

            <View className="rounded-2xl bg-yellow-50 p-4 mb-4 dark:bg-yellow-950/30">
              <View className="flex-row items-start gap-2">
                <Icon as={AlertCircle} size={20} className="text-yellow-600 mt-0.5" />
                <Text className="flex-1 text-sm text-yellow-900 dark:text-yellow-100">
                  Save these codes in a safe place. Each code can only be used once.
                </Text>
              </View>
            </View>

            <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
              {recoveryCodes.map((code, index) => (
                <View key={index} className="flex-row items-center justify-between rounded-xl bg-card p-3 mb-2">
                  <Text className="font-mono">{twoFactor.formatRecoveryCode(code)}</Text>
                  <TouchableOpacity onPress={() => handleCopyRecoveryCode(code)}>
                    <Icon as={Copy} size={18} className="text-purple-600" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowRecoveryModal(false)}
              className="mt-4 rounded-2xl bg-primary py-4"
            >
              <Text className="text-center font-semibold text-primary-foreground">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
