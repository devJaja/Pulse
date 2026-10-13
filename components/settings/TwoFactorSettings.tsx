import { View, TouchableOpacity, Switch, Modal, ScrollView, ActivityIndicator, TextInput, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Shield, X, Copy, AlertCircle } from 'lucide-react-native';
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
      <View className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-success/10">
            <Icon as={Shield} size={20} className="text-success" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold">Two-Factor Authentication</Text>
            <Text className="mt-0.5 text-sm text-muted-foreground">
              Add an extra layer of security
            </Text>
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
            className="mt-3 flex-row items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 py-2.5 dark:border-purple-500/30 dark:bg-purple-500/10"
          >
            <Icon as={Shield} size={16} className="text-purple-600 dark:text-purple-300" />
            <Text className="text-sm font-medium text-purple-600 dark:text-purple-300">
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
        <View className="flex-1 items-center justify-center bg-black/60 px-4">
          <View className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-elevated">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-2xl font-bold">Setup 2FA</Text>
              <TouchableOpacity
                onPress={() => setShowSetupModal(false)}
                className="h-9 w-9 items-center justify-center rounded-full bg-secondary active:opacity-70"
              >
                <Icon as={X} size={20} className="text-foreground" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="mb-4 text-sm leading-5 text-muted-foreground">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </Text>

              {/* QR Code */}
              {qrCodeUrl ? (
                <View className="mb-4 items-center justify-center rounded-2xl border border-border bg-white p-4">
                  <Image
                    source={{ uri: qrCodeUrl }}
                    style={{ width: 220, height: 220 }}
                    resizeMode="contain"
                  />
                </View>
              ) : null}

              <Text className="mb-2 text-sm font-medium">Or enter this code manually:</Text>
              <View className="mb-4 flex-row items-center gap-2 rounded-xl border border-input bg-background p-3">
                <Text className="flex-1 font-mono text-sm">{secret}</Text>
                <TouchableOpacity
                  onPress={handleCopySecret}
                  className="h-8 w-8 items-center justify-center rounded-full bg-secondary active:opacity-70"
                >
                  <Icon as={Copy} size={16} className="text-purple-600 dark:text-purple-300" />
                </TouchableOpacity>
              </View>

              <Text className="mb-2 text-sm font-medium">Enter verification code:</Text>
              <View className="mb-4 rounded-xl border border-input bg-background">
                <TextInput
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  placeholder="000000"
                  placeholderTextColor="#727285"
                  maxLength={6}
                  keyboardType="number-pad"
                  className="py-3 text-center font-mono text-2xl tracking-[0.5em] text-foreground"
                />
              </View>

              <TouchableOpacity
                onPress={handleVerifyAndEnable}
                disabled={isVerifying || verificationCode.length !== 6}
                className={`items-center rounded-xl py-4 ${
                  isVerifying || verificationCode.length !== 6
                    ? 'bg-muted'
                    : 'bg-primary active:bg-primary/90'
                }`}
              >
                {isVerifying ? (
                  <ActivityIndicator color="#6e54ff" />
                ) : (
                  <Text
                    className={`text-center font-semibold ${
                      verificationCode.length !== 6 ? 'text-muted-foreground' : 'text-primary-foreground'
                    }`}
                  >
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
        <View className="flex-1 items-center justify-center bg-black/60 px-4">
          <View className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-elevated">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-2xl font-bold">Recovery Codes</Text>
              <TouchableOpacity
                onPress={() => setShowRecoveryModal(false)}
                className="h-9 w-9 items-center justify-center rounded-full bg-secondary active:opacity-70"
              >
                <Icon as={X} size={20} className="text-foreground" />
              </TouchableOpacity>
            </View>

            <View className="mb-4 flex-row items-start gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/40 dark:bg-yellow-950/30">
              <Icon as={AlertCircle} size={20} className="mt-0.5 text-yellow-600 dark:text-yellow-300" />
              <Text className="flex-1 text-sm leading-5 text-yellow-900 dark:text-yellow-100">
                Save these codes in a safe place. Each code can only be used once.
              </Text>
            </View>

            <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
              {recoveryCodes.map((code, index) => (
                <View
                  key={index}
                  className="mb-2 flex-row items-center justify-between rounded-xl border border-border bg-background p-3"
                >
                  <Text className="font-mono tracking-wider">{twoFactor.formatRecoveryCode(code)}</Text>
                  <TouchableOpacity
                    onPress={() => handleCopyRecoveryCode(code)}
                    className="h-8 w-8 items-center justify-center rounded-full bg-secondary active:opacity-70"
                  >
                    <Icon as={Copy} size={16} className="text-purple-600 dark:text-purple-300" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowRecoveryModal(false)}
              className="mt-4 items-center rounded-xl bg-primary py-4 active:bg-primary/90"
            >
              <Text className="text-center font-semibold text-primary-foreground">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
