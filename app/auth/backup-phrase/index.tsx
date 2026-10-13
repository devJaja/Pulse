import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { router } from 'expo-router';
import { AuthHeader, AuthLayout } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useWalletStore } from '@/store/useWalletStore';
import { useShallow } from 'zustand/react/shallow';

function splitPhrase(phrase: string): string[] {
  return phrase.trim().split(/\s+/).filter(Boolean);
}

export default function BackupPhraseScreen() {
  const { pendingBackup, confirmBackup, revealMnemonic, hasWallet } = useWalletStore(
    useShallow((state) => ({
      pendingBackup: state.pendingBackup,
      confirmBackup: state.confirmBackup,
      revealMnemonic: state.revealMnemonic,
      hasWallet: state.hasWallet,
    }))
  );

  const [words, setWords] = useState<string[]>(() =>
    pendingBackup ? splitPhrase(pendingBackup) : []
  );
  const [loading, setLoading] = useState(!pendingBackup);

  useEffect(() => {
    if (pendingBackup) return;
    let active = true;
    (async () => {
      try {
        const recovered = await revealMnemonic();
        if (active) {
          setWords(splitPhrase(recovered));
        }
      } catch (error) {
        if (active) {
          Alert.alert(
            'No recovery phrase available',
            error instanceof Error ? error.message : 'No self-custody wallet was found on this device.',
          );
          router.replace('/auth/signin');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [pendingBackup, revealMnemonic]);

  const handleContinue = () => {
    confirmBackup();
    router.replace('/auth/signup');
  };

  return (
    <AuthLayout>
      <View className="flex-1 px-5 pt-16">
        <AuthHeader
          title="Back up your recovery phrase"
          subtitle="These 12 words are the only way to restore your wallet if you lose access. Write them down and keep them somewhere private."
        />

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <>
            <View className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
              <Text className="text-sm leading-5 text-destructive">
                Never share your recovery phrase. Anyone with these words can spend your MON. Do not screenshot it and do not send it over chat.
              </Text>
            </View>

            {words.length > 0 && (
              <View className="mt-6 flex-row flex-wrap gap-3">
                {words.map((word, index) => (
                  <View
                    key={`${index}-${word}`}
                    className="w-[calc(50%_-_6px)] flex-row items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-soft"
                  >
                    <Text className="w-6 text-xs text-muted-foreground">{index + 1}</Text>
                    <Text className="font-mono text-sm font-semibold text-foreground">{word}</Text>
                  </View>
                ))}
              </View>
            )}

            {hasWallet && words.length === 0 && (
              <View className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-soft">
                <Text className="text-sm leading-5 text-muted-foreground">
                  Your wallet was imported with a private key, so there is no recovery phrase to show.
                </Text>
              </View>
            )}

            <View className="flex-1" />

            <Button
              size="lg"
              className="mb-8 mt-6 h-14 w-full rounded-2xl bg-primary shadow-soft active:bg-primary/90"
              onPress={handleContinue}
            >
              <Text className="text-base font-medium text-primary-foreground">I saved it — continue</Text>
            </Button>
          </>
        )}
      </View>
    </AuthLayout>
  );
}