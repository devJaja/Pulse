import { View, ScrollView, TouchableOpacity, Share, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, Copy, Share2, Download } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import QRCode from 'react-native-qrcode-svg';
import { toast } from 'sonner-native';
import * as Clipboard from 'expo-clipboard';
import { useWallet } from '@/hooks/useWallet';

export default function ReceiveMoneyScreen() {
  const { walletAddress, balance } = useWallet();
  const [showAddress, setShowAddress] = useState(false);

  const copyToClipboard = async () => {
    if (walletAddress) {
      await Clipboard.setStringAsync(walletAddress);
      toast.success('Address copied to clipboard');
    }
  };

  const shareAddress = async () => {
    if (!walletAddress) return;
    
    try {
      await Share.share({
        message: `Send MON to my wallet:\n${walletAddress}`,
        title: 'My Monad Wallet Address',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center gap-3 px-4 pt-12">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-soft active:bg-accent"
          >
            <Icon as={ArrowLeft} size={20} className="text-foreground" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">Receive MON</Text>
        </View>

        {/* Balance Display */}
        <View className="mx-4 mt-6 rounded-2xl border border-primary/15 bg-accent p-4">
          <Text className="text-xs font-semibold uppercase tracking-wide text-accent-foreground/70">
            Current Balance
          </Text>
          <Text className="mt-1 text-2xl font-bold tabular-nums text-accent-foreground">
            {balance.toFixed(4)} MON
          </Text>
        </View>

        {/* QR Code Section */}
        <View className="mt-8 items-center px-4">
          {showAddress ? (
            <View className="w-full items-center rounded-3xl border border-border bg-card p-6 shadow-card">
              <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your Wallet Address
              </Text>
              <View className="mt-4 w-full rounded-xl bg-muted p-4">
                <Text className="break-all font-mono text-sm text-foreground">
                  {walletAddress}
                </Text>
              </View>
              
              <View className="mt-6 w-full flex-row gap-3">
                <TouchableOpacity 
                  onPress={copyToClipboard}
                  activeOpacity={0.85}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3 active:bg-primary/90"
                >
                  <Icon as={Copy} size={18} className="text-primary-foreground" />
                  <Text className="font-semibold text-primary-foreground">Copy</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={shareAddress}
                  activeOpacity={0.85}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-3 active:bg-secondary/80"
                >
                  <Icon as={Share2} size={18} className="text-secondary-foreground" />
                  <Text className="font-semibold text-secondary-foreground">Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="items-center rounded-3xl border border-border bg-card p-8 shadow-card">
              <View className="rounded-2xl bg-white p-6 shadow-soft">
                {walletAddress ? (
                  <QRCode
                    value={walletAddress}
                    size={240}
                    backgroundColor="white"
                    color="black"
                  />
                ) : (
                  <View className="h-60 w-60 items-center justify-center">
                    <Text className="text-muted-foreground">Loading...</Text>
                  </View>
                )}
              </View>
              <Text className="mt-6 text-center text-sm text-muted-foreground">
                Scan this QR code to send MON to this wallet
              </Text>
              
              {/* Wallet Address Preview */}
              <View className="mt-4 rounded-full bg-muted px-4 py-2">
                <Text className="font-mono text-2xs text-muted-foreground">
                  {walletAddress?.slice(0, 12)}...{walletAddress?.slice(-12)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Toggle Button */}
        <View className="mt-6 px-4">
          <TouchableOpacity
            onPress={() => setShowAddress(!showAddress)}
            activeOpacity={0.7}
            className="items-center rounded-xl border border-primary/15 bg-accent py-3.5 active:bg-accent/70"
          >
            <Text className="font-semibold text-accent-foreground">
              {showAddress ? 'Show QR Code' : 'Show Full Address'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View className="mt-6 px-4">
          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={copyToClipboard}
              activeOpacity={0.7}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 shadow-soft active:bg-accent"
            >
              <Icon as={Copy} size={18} className="text-foreground" />
              <Text className="font-semibold text-foreground">Copy Address</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={shareAddress}
              activeOpacity={0.85}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3 active:bg-primary/90"
            >
              <Icon as={Share2} size={18} className="text-primary-foreground" />
              <Text className="font-semibold text-primary-foreground">Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* How to Receive */}
        <View className="mt-6 px-4 pb-6">
          <View className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <Text className="text-lg font-bold text-card-foreground">How to Receive MON</Text>
            <View className="mt-4 gap-3.5">
              <View className="flex-row gap-3">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <Text className="text-xs font-bold text-primary-foreground">1</Text>
                </View>
                <Text className="flex-1 text-sm text-muted-foreground">
                  Share your wallet address or QR code with the sender
                </Text>
              </View>
              
              <View className="flex-row gap-3">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <Text className="text-xs font-bold text-primary-foreground">2</Text>
                </View>
                <Text className="flex-1 text-sm text-muted-foreground">
                  Sender enters the amount and confirms the transaction
                </Text>
              </View>
              
              <View className="flex-row gap-3">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <Text className="text-xs font-bold text-primary-foreground">3</Text>
                </View>
                <Text className="flex-1 text-sm text-muted-foreground">
                  Funds arrive in your wallet within seconds on Monad
                </Text>
              </View>
            </View>
          </View>

          {/* Network Info */}
          <View className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted-foreground">Network</Text>
              <Text className="text-sm font-medium text-card-foreground">Monad Testnet</Text>
            </View>
            <View className="mt-2.5 flex-row items-center justify-between">
              <Text className="text-sm text-muted-foreground">Transaction Speed</Text>
              <Text className="text-sm font-medium tabular-nums text-card-foreground">~5s</Text>
            </View>
            <View className="mt-2.5 flex-row items-center justify-between">
              <Text className="text-sm text-muted-foreground">Network Fee</Text>
              <Text className="text-sm font-medium tabular-nums text-card-foreground">~0.00001 MON</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
