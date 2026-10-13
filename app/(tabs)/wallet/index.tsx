import { View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowUpRight, ArrowDownLeft, PieChart, Coins, TrendingUp, TrendingDown, Receipt } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/common';
import { useWallet } from '@/hooks/useWallet';
import { useTokenHoldings } from '@/hooks/usePortfolio';
import { useAuth } from '@/hooks/useAuth';
import { useAllTokenPrices } from '@/hooks/useTokenPrice';
import { useSeekerBalance } from '@/hooks/useSeekerBalance';
import type { Transaction, User } from '@/types';
import { TOKENS } from '@/lib/tokens';
import { TransactionCard } from '@/components/wallet';

export default function WalletScreen() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isSmall = width < 375;
  const { balance, walletAddress, isLoadingBalance, refetchBalance, transactions, isLoadingTransactions } = useWallet();
  const { user } = useAuth();
  const userId = (user as User)?.id || '';
  const { holdings, totalValue, isLoading: isLoadingHoldings, refetch: refetchHoldings } = useTokenHoldings(userId);
  const { data: tokenPrices, isLoading: isLoadingPrices, refetch: refetchPrices } = useAllTokenPrices();
  const { data: seekerBalance, isLoading: isLoadingSeekerBalance, refetch: refetchSeekerBalance } = useSeekerBalance();

  const monPrice = tokenPrices?.MON || 0;
  const usdValue = balance * monPrice;
  
  // Debug logging
  console.log('Wallet Debug:', {
    balance,
    monPrice,
    usdValue,
    isLoadingPrices,
  });

  const handleRefresh = async () => {
    await Promise.all([refetchBalance(), refetchHoldings(), refetchSeekerBalance(), refetchPrices()]);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoadingBalance} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View className="px-4 pt-12">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground">{t('wallet.wallet')}</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-soft active:bg-accent"
            >
              <Icon as={PieChart} size={20} className="text-foreground" />
            </TouchableOpacity>
          </View>

          {/* Balance Card */}
          <View className="mt-5 overflow-hidden rounded-3xl border border-border bg-card px-5 pb-5 pt-7 shadow-card">
            <View className="items-center">
              <Text className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {t('wallet.totalBalance')}
              </Text>
              {isLoadingBalance || isLoadingPrices ? (
                <ActivityIndicator size="large" color="#6e54ff" className="mt-3" />
              ) : (
                <>
                  <Text
                    className={`mt-3 ${isSmall ? 'text-4xl' : 'text-5xl'} font-bold tracking-tight tabular-nums text-foreground`}
                  >
                    ${usdValue.toFixed(2)}
                  </Text>
                  <View className="mt-2 rounded-full bg-muted px-3 py-1">
                    <Text className="text-sm font-semibold tabular-nums text-muted-foreground">
                      {balance.toFixed(4)} MON
                    </Text>
                  </View>
                  <Text className="mt-3 font-mono text-2xs text-muted-foreground">
                    {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-8)}
                  </Text>
                </>
              )}
            </View>

            {/* Action Buttons */}
            <View className="mt-7 flex-row gap-3">
              <TouchableOpacity
                onPress={() => router.push('/wallet/send')}
                activeOpacity={0.85}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 shadow-soft active:bg-primary/90"
              >
                <Icon as={ArrowUpRight} size={20} className="text-primary-foreground" />
                <Text className="font-semibold text-primary-foreground">{t('wallet.send')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/wallet/receive')}
                activeOpacity={0.85}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-3.5 active:bg-secondary/80"
              >
                <Icon as={ArrowDownLeft} size={20} className="text-secondary-foreground" />
                <Text className="font-semibold text-secondary-foreground">{t('wallet.receive')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Your Assets */}
        <View className="mt-7 px-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-foreground">{t('wallet.yourAssets')}</Text>
          </View>

          <View className="mt-4 gap-3">
            {TOKENS.map((token) => {
              const tokenBalance = token.symbol === 'MON' ? balance : token.symbol === 'SEEKER' ? (seekerBalance || 0) : 0;
              const tokenPrice = tokenPrices?.[token.symbol] || 0;
              const tokenValue = tokenBalance * tokenPrice;

              return (
                <View
                  key={token.symbol}
                  className="flex-row items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft"
                >
                  <View className="flex-row items-center gap-3">
                    <View className={`h-11 w-11 items-center justify-center rounded-full ${token.color}`}>
                      <Text className="text-lg font-bold text-white">{token.icon}</Text>
                    </View>
                    <View>
                      <Text className="text-base font-semibold text-card-foreground">{token.name}</Text>
                      <Text className="text-sm tabular-nums text-muted-foreground">
                        {isLoadingSeekerBalance && token.symbol === 'SEEKER' ? '...' : tokenBalance.toFixed(token.symbol === 'MON' ? 4 : 2)} {token.symbol}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-base font-semibold tabular-nums text-card-foreground">${tokenValue.toFixed(2)}</Text>
                    {tokenPrice > 0 && (
                      <Text className="text-sm tabular-nums text-muted-foreground">
                        ${tokenPrice.toFixed(token.symbol === 'MON' ? 2 : 4)}/{token.symbol}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}

            {/* Token Holdings */}
            {isLoadingHoldings ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#6e54ff" />
              </View>
            ) : holdings.length > 0 ? (
              <>
                <View className="mt-3">
                  <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('wallet.postTokens')}
                  </Text>
                </View>
                {holdings.map((holding) => (
                  <TouchableOpacity
                    key={holding.id}
                    onPress={() => router.push(`/post/${holding.post.id}`)}
                    activeOpacity={0.7}
                    className="flex-row items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft active:bg-accent/50"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                        <Icon as={Coins} size={20} className="text-primary" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-semibold text-card-foreground" numberOfLines={1}>
                          {holding.post.content.slice(0, 30)}...
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                          {holding.amount} {t('wallet.tokensCount')}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="font-semibold tabular-nums text-card-foreground">
                        {holding.currentValue.toFixed(4)} MON
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <Icon 
                          as={holding.profitLoss >= 0 ? TrendingUp : TrendingDown} 
                          size={12} 
                          className={holding.profitLoss >= 0 ? "text-success" : "text-destructive"}
                        />
                        <Text className={`text-xs font-medium tabular-nums ${holding.profitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {holding.profitLossPercentage >= 0 ? '+' : ''}{holding.profitLossPercentage.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
                <View className="mt-2 flex-row items-center justify-between rounded-2xl border border-primary/15 bg-accent px-4 py-3.5">
                  <Text className="text-sm font-medium text-accent-foreground">
                    {t('profile.totalPortfolioValue')}
                  </Text>
                  <Text className="text-sm font-bold tabular-nums text-accent-foreground">
                    {totalValue.toFixed(4)} MON
                  </Text>
                </View>
              </>
            ) : null}
          </View>
        </View>

        {/* Recent Activity */}
        <View className="mt-7 px-4 pb-8">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-foreground">{t('wallet.recentActivity')}</Text>
            {transactions.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/wallet/history')} hitSlop={8}>
                <Text className="text-sm font-semibold text-primary">{t('wallet.viewAll')}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="mt-4">
            {isLoadingTransactions && transactions.length === 0 ? (
              <View className="items-center py-10">
                <ActivityIndicator size="large" color="#6e54ff" />
              </View>
            ) : transactions.length === 0 ? (
              <EmptyState icon={Receipt} message={t('wallet.noTransactions')} />
            ) : (
              transactions.slice(0, 5).map((tx: Transaction) => (
                <TransactionCard
                  key={tx.signature}
                  type={tx.type === 'airdrop' ? 'receive' : tx.type}
                  amount={tx.amount}
                  token="MON"
                  timestamp={tx.blockTime || new Date().toISOString()}
                  status={tx.status}
                  from={tx.type === 'receive' ? tx.fromAddress : undefined}
                  to={tx.type === 'send' ? tx.toAddress : undefined}
                  onPress={() => router.push(`/transaction/${tx.signature}`)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
