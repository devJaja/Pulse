import { View, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, ExternalLink, Copy, CheckCircle, XCircle, Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import * as Clipboard from 'expo-clipboard';
import { toast } from 'sonner-native';
import type { Transaction } from '@/types';

export default function TransactionDetailsScreen() {
  const { signature } = useLocalSearchParams<{ signature: string }>();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransaction();
  }, [signature]);

  const loadTransaction = async () => {
    if (!signature) return;
    
    setIsLoading(true);
    try {
      const response = await api.getTransactionDetails(signature);
      if (response.data) {
        setTransaction(response.data as Transaction);
      }
    } catch (error) {
      console.error('Error loading transaction:', error);
      toast.error('Failed to load transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const copySignature = async () => {
    if (signature) {
      await Clipboard.setStringAsync(signature);
      toast.success('Signature copied!');
    }
  };

  const copyAddress = async (address: string) => {
    await Clipboard.setStringAsync(address);
    toast.success('Address copied!');
  };

  const openInExplorer = () => {
    const url = `https://testnet.monadexplorer.com/tx/${signature}`;
    Linking.openURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Icon as={CheckCircle} size={24} className="text-success" />;
      case 'failed':
        return <Icon as={XCircle} size={24} className="text-destructive" />;
      default:
        return <Icon as={Clock} size={24} className="text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success/15 text-success';
      case 'failed':
        return 'bg-destructive/15 text-destructive';
      default:
        return 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <Icon as={ArrowUpRight} size={20} className="text-primary-foreground" />;
      case 'receive':
        return <Icon as={ArrowDownLeft} size={20} className="text-primary-foreground" />;
      default:
        return <Icon as={ArrowDownLeft} size={20} className="text-primary-foreground" />;
    }
  };

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#6e54ff" />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Transaction not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 rounded-xl bg-primary px-6 py-3">
          <Text className="font-semibold text-primary-foreground">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border bg-card px-4 pb-4 pt-12">
        <TouchableOpacity onPress={() => router.back()}>
          <Icon as={ArrowLeft} size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Transaction Details</Text>
        <TouchableOpacity onPress={openInExplorer}>
          <Icon as={ExternalLink} size={24} className="text-foreground" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Status Card */}
        <View className="m-4 items-center rounded-2xl border border-border bg-card p-6 shadow-soft">
          {getStatusIcon(transaction.status)}
          <Text className="mt-3 text-2xl font-bold capitalize text-card-foreground">
            {transaction.status}
          </Text>
          <View className={`mt-3 rounded-full px-3.5 py-1.5 ${getStatusColor(transaction.status)}`}>
            <Text className={`text-2xs font-semibold uppercase tracking-wide ${getStatusColor(transaction.status)}`}>
              {transaction.status}
            </Text>
          </View>
        </View>

        {/* Amount Card */}
        <View className="mx-4 mb-4 rounded-2xl bg-primary p-6 shadow-glow">
          <View className="flex-row items-center justify-center gap-2">
            {getTypeIcon(transaction.type)}
            <Text className="text-sm font-medium text-primary-foreground/80 capitalize">
              {transaction.type}
            </Text>
          </View>
          <Text className="mt-2 text-center text-4xl font-bold tabular-nums text-primary-foreground">
            {transaction.type === 'send' ? '-' : '+'}{transaction.amount.toFixed(4)} MON
          </Text>
          {transaction.fee && (
            <Text className="mt-2 text-center text-sm tabular-nums text-primary-foreground/70">
              Fee: {transaction.fee.toFixed(6)} MON
            </Text>
          )}
        </View>

        {/* Transaction Details */}
        <View className="mx-4 mb-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <Text className="mb-4 text-lg font-bold text-card-foreground">Details</Text>

          {/* Signature */}
          <View className="mb-4">
            <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Signature
            </Text>
            <View className="flex-row items-center justify-between rounded-xl bg-muted/60 p-3">
              <Text className="flex-1 font-mono text-2xs text-foreground" numberOfLines={1}>
                {transaction.signature}
              </Text>
              <TouchableOpacity onPress={copySignature} className="ml-2" hitSlop={8}>
                <Icon as={Copy} size={16} className="text-primary" />
              </TouchableOpacity>
            </View>
          </View>

          {/* From Address */}
          {transaction.fromAddress && (
            <View className="mb-4">
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                From
              </Text>
              <View className="flex-row items-center justify-between rounded-xl bg-muted/60 p-3">
                <Text className="flex-1 font-mono text-2xs text-foreground" numberOfLines={1}>
                  {transaction.fromAddress}
                </Text>
                <TouchableOpacity onPress={() => copyAddress(transaction.fromAddress!)} className="ml-2" hitSlop={8}>
                  <Icon as={Copy} size={16} className="text-primary" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* To Address */}
          {transaction.toAddress && (
            <View className="mb-4">
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                To
              </Text>
              <View className="flex-row items-center justify-between rounded-xl bg-muted/60 p-3">
                <Text className="flex-1 font-mono text-2xs text-foreground" numberOfLines={1}>
                  {transaction.toAddress}
                </Text>
                <TouchableOpacity onPress={() => copyAddress(transaction.toAddress!)} className="ml-2" hitSlop={8}>
                  <Icon as={Copy} size={16} className="text-primary" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Timestamp */}
          <View className="mb-4">
            <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Timestamp
            </Text>
            <View className="rounded-xl bg-muted/60 p-3">
              <Text className="text-sm text-foreground">{formatDate(transaction.blockTime)}</Text>
            </View>
          </View>

          {/* Block Slot */}
          {transaction.slot && (
            <View className="mb-4">
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Block Slot
              </Text>
              <View className="rounded-xl bg-muted/60 p-3">
                <Text className="font-mono text-sm text-foreground">{transaction.slot}</Text>
              </View>
            </View>
          )}

          {/* Type */}
          <View>
            <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Type
            </Text>
            <View className="rounded-xl bg-muted/60 p-3">
              <Text className="text-sm capitalize text-foreground">{transaction.type}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="mx-4 mb-6 gap-3">
          <TouchableOpacity
            onPress={openInExplorer}
            activeOpacity={0.85}
            className="flex-row items-center justify-center gap-2 rounded-xl bg-primary py-4 shadow-soft active:bg-primary/90"
          >
            <Icon as={ExternalLink} size={20} className="text-primary-foreground" />
            <Text className="font-semibold text-primary-foreground">View on Monad Explorer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={copySignature}
            activeOpacity={0.7}
            className="flex-row items-center justify-center gap-2 rounded-xl border border-border bg-card py-4 shadow-soft active:bg-accent"
          >
            <Icon as={Copy} size={20} className="text-foreground" />
            <Text className="font-semibold text-foreground">Copy Signature</Text>
          </TouchableOpacity>
        </View>

        {/* Network Info */}
        <View className="mx-4 mb-6 rounded-2xl border border-border bg-accent p-4">
          <Text className="text-center text-sm font-medium text-accent-foreground">
            Monad Testnet Transaction
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
