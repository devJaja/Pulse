import { useState } from 'react';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text, TextClassContext } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCcw,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { toast } from 'sonner-native';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useWalletStore } from '@/store/useWalletStore';
import { useShallow } from 'zustand/react/shallow';
import type { User } from '@/types';

function splitPhrase(phrase: string): string[] {
  return phrase.trim().split(/\s+/).filter(Boolean);
}

export default function RecoveryPhraseScreen() {
  const { user } = useAuth();
  const currentUser = user as User | null;
  const {
    address: deviceAddress,
    hasWallet,
    revealMnemonic,
    revealPrivateKey,
    importPrivateKey,
  } = useWalletStore(
    useShallow((state) => ({
      address: state.address,
      hasWallet: state.hasWallet,
      revealMnemonic: state.revealMnemonic,
      revealPrivateKey: state.revealPrivateKey,
      importPrivateKey: state.importPrivateKey,
    }))
  );

  const [phrase, setPhrase] = useState<string | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [exportingKey, setExportingKey] = useState(false);
  const [importing, setImporting] = useState(false);

  const isSelfCustodial =
    hasWallet &&
    !!deviceAddress &&
    !!currentUser?.walletAddress &&
    deviceAddress.toLowerCase() === currentUser.walletAddress.toLowerCase();

  const walletAddress = isSelfCustodial ? deviceAddress : (currentUser?.walletAddress ?? deviceAddress ?? '');

  const handleRevealPhrase = async () => {
    Alert.alert(
      'Security Warning',
      'Your recovery phrase gives full access to your wallet. Never share it with anyone and make sure no one is watching your screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I Understand',
          onPress: async () => {
            setRevealing(true);
            try {
              const recovered = await revealMnemonic();
              setPhrase(recovered);
              setWords(splitPhrase(recovered));
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Unable to reveal recovery phrase');
            } finally {
              setRevealing(false);
            }
          },
        },
      ]
    );
  };

  const handleExportPrivateKey = async () => {
    Alert.alert(
      'Export private key?',
      'Anyone with your private key can spend all your MON. Only export it to import into a trusted wallet app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            setExportingKey(true);
            try {
              const key = await revealPrivateKey();
              setPrivateKey(key);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Unable to export private key');
            } finally {
              setExportingKey(false);
            }
          },
        },
      ]
    );
  };

  const handleCopy = async (value: string, label: string) => {
    if (!value) return;
    await Clipboard.setStringAsync(value);
    toast.success(`${label} copied`);
  };

  const handleImportFromServer = async () => {
    Alert.alert(
      'Import wallet from Pulse servers',
      'This moves your current private key off our servers and onto this device only. This can only be done once. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import to Device',
          onPress: async () => {
            setImporting(true);
            try {
              const response = await api.exportLegacyKey();
              if (response.error) throw new Error(response.error);
              const data = response.data as { privateKey: string };
              await importPrivateKey(data.privateKey);
              toast.success('Wallet is now fully self-custodial');
              setWords([]);
              setPhrase(null);
              setPrivateKey(null);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Unable to import wallet');
            } finally {
              setImporting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center gap-3 px-4 pt-12">
          <TouchableOpacity onPress={() => router.back()}>
            <Icon as={ArrowLeft} size={24} className="text-foreground" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Recovery & Keys</Text>
        </View>

        {/* Warning Banner */}
        <View className="mx-4 mt-6 rounded-2xl bg-red-50 p-4 dark:bg-red-950/30">
          <View className="flex-row items-start gap-3">
            <Icon as={AlertTriangle} size={24} className="mt-0.5 text-red-600" />
            <View className="flex-1">
              <Text className="font-semibold text-red-900 dark:text-red-100">
                You control your keys
              </Text>
              <Text className="mt-2 text-sm text-red-800 dark:text-red-200">
                Your recovery phrase and private key live only on this device. Pulse cannot restore them if lost. Write the phrase down and keep it safe.
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
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-muted-foreground">Wallet Address</Text>
              <TouchableOpacity onPress={() => handleCopy(walletAddress, 'Wallet address')}>
                <Icon as={Copy} size={18} className="text-purple-600" />
              </TouchableOpacity>
            </View>
            <Text className="font-mono text-sm">{walletAddress}</Text>

            <View
              className={`mt-4 flex-row items-center gap-2 rounded-xl px-3 py-2 ${
                isSelfCustodial ? 'bg-success/10' : 'bg-yellow-50 dark:bg-yellow-950/30'
              }`}
            >
              <Icon
                as={isSelfCustodial ? CheckCircle2 : RefreshCcw}
                size={16}
                className={isSelfCustodial ? 'text-success' : 'text-yellow-600'}
              />
              <Text
                className={`text-xs font-semibold ${
                  isSelfCustodial
                    ? 'text-success'
                    : 'text-yellow-800 dark:text-yellow-200'
                }`}
              >
                {isSelfCustodial
                  ? 'Self-custodial wallet on this device'
                  : 'Keys held by Pulse servers'}
              </Text>
            </View>
          </View>
        </View>

        {/* Import legacy server wallet */}
        {!isSelfCustodial && currentUser?.walletAddress && (
          <View className="mx-4 mt-6">
            <View className="rounded-2xl bg-yellow-50 p-4 dark:bg-yellow-950/30">
              <Text className="font-semibold text-yellow-900 dark:text-yellow-100">
                Take control of your keys
              </Text>
              <Text className="mt-2 text-sm text-yellow-800 dark:text-yellow-200">
                This account was created while Pulse stored your private key on our servers. Import it once to this device and Pulse deletes its copy.
              </Text>
              <TouchableOpacity
                onPress={handleImportFromServer}
                disabled={importing}
                className="mt-3 rounded-xl bg-yellow-600 py-3"
              >
                <TextClassContext.Provider value="text-white">
                  <Text className="text-center font-semibold">
                    {importing ? 'Importing...' : 'Import private key to device'}
                  </Text>
                </TextClassContext.Provider>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Reveal recovery phrase */}
        <View className="mx-4 mt-6">
          <Text className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            RECOVERY PHRASE
          </Text>

          <View className="rounded-2xl bg-card p-4">
            {!phrase ? (
              <TouchableOpacity
                onPress={handleRevealPhrase}
                disabled={revealing}
                className="flex-row items-center justify-center gap-2 rounded-xl bg-purple-600 py-3"
              >
                <Icon as={Eye} size={18} className="text-white" />
                <Text className="font-semibold text-white">
                  {revealing ? 'Unlocking...' : 'Show my 12-word phrase'}
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-muted-foreground">
                    Your recovery phrase
                  </Text>
                  <TouchableOpacity onPress={() => handleCopy(phrase, 'Recovery phrase')}>
                    <Icon as={Copy} size={18} className="text-purple-600" />
                  </TouchableOpacity>
                </View>
                <View className="mt-4 flex-row flex-wrap gap-3">
                  {words.map((word, index) => (
                    <View
                      key={`${index}-${word}`}
                      className="w-[calc(50%_-_6px)] flex-row items-center gap-2 rounded-xl border border-border bg-background p-3"
                    >
                      <Text className="w-6 text-xs text-muted-foreground">{index + 1}</Text>
                      <Text className="font-mono text-sm font-semibold">{word}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setPhrase(null);
                    setWords([]);
                  }}
                  className="mt-4 flex-row items-center justify-center gap-2 rounded-xl border border-border py-2.5"
                >
                  <Icon as={EyeOff} size={16} className="text-muted-foreground" />
                  <Text className="text-sm font-semibold text-muted-foreground">Hide phrase</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Export private key */}
        <View className="mx-4 mt-6">
          <Text className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            PRIVATE KEY
          </Text>

          <View className="rounded-2xl bg-card p-4">
            <TouchableOpacity
              onPress={handleExportPrivateKey}
              disabled={exportingKey}
              className="flex-row items-center justify-center gap-2 rounded-xl border border-border py-3"
            >
              <Icon as={KeyRound} size={18} className="text-muted-foreground" />
              <Text className="font-semibold">
                {exportingKey ? 'Unlocking...' : 'Export private key'}
              </Text>
            </TouchableOpacity>

            {privateKey && (
              <View className="mt-4">
                <View className="rounded-xl bg-background p-3">
                  <Text className="font-mono text-xs break-all">{privateKey}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleCopy(privateKey, 'Private key')}
                  className="mt-3 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3"
                >
                  <Icon as={Download} size={16} className="text-primary-foreground" />
                  <Text className="font-semibold text-primary-foreground">Copy private key</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View className="mx-4 mt-6 pb-10">
          <Text className="text-center text-sm text-muted-foreground">
            Pulse never stores your keys. If you lose this device and your backup, no one — including Pulse — can recover your wallet.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}