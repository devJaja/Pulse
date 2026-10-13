import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Coins, TrendingUp, TrendingDown } from 'lucide-react-native';
import { router } from 'expo-router';
import { EmptyState, LoadingSpinner } from '../common';
import { useTranslation } from 'react-i18next';

interface PortfolioTabProps {
  portfolio: any;
  isLoading: boolean;
  isOwnProfile: boolean;
  onNavigateToProfile: (username: string) => void;
}

export function PortfolioTab({ portfolio, isLoading, isOwnProfile, onNavigateToProfile }: PortfolioTabProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!portfolio || !portfolio.holdings || portfolio.holdings.length === 0) {
    return (
      <EmptyState
        icon={Coins}
        message={t('profile.noTokenHoldings')}
        subtitle={isOwnProfile ? t('profile.buyPostTokens') : undefined}
      />
    );
  }

  const isProfitable = portfolio.totalProfitLoss >= 0;

  return (
    <View className="px-4 py-4">
      <View className="mb-4 overflow-hidden rounded-2xl bg-primary p-5 shadow-glow">
        <Text className="text-2xs font-semibold uppercase tracking-wider text-primary-foreground/80">
          {t('profile.totalPortfolioValue')}
        </Text>
        <Text className="mt-1 text-3xl font-bold tracking-tight text-primary-foreground">
          {portfolio.totalValue.toFixed(4)} MON
        </Text>

        <View className="mt-3 flex-row items-center gap-2">
          <Icon
            as={isProfitable ? TrendingUp : TrendingDown}
            size={16}
            className={isProfitable ? 'text-green-200' : 'text-red-200'}
          />
          <Text className={`font-semibold ${isProfitable ? 'text-green-200' : 'text-red-200'}`}>
            {isProfitable ? '+' : ''}{portfolio.totalProfitLoss.toFixed(4)} MON
          </Text>
          <Text className={`text-sm ${isProfitable ? 'text-green-200' : 'text-red-200'}`}>
            ({portfolio.totalProfitLossPercentage >= 0 ? '+' : ''}
            {portfolio.totalProfitLossPercentage.toFixed(2)}%)
          </Text>
        </View>

        <View className="mt-4 flex-row gap-6">
          <View>
            <Text className="text-2xs font-semibold uppercase tracking-wider text-primary-foreground/70">
              {t('profile.invested')}
            </Text>
            <Text className="mt-0.5 text-sm font-semibold text-primary-foreground">
              {portfolio.totalInvested.toFixed(4)} MON
            </Text>
          </View>
          <View>
            <Text className="text-2xs font-semibold uppercase tracking-wider text-primary-foreground/70">
              {t('profile.holdings')}
            </Text>
            <Text className="mt-0.5 text-sm font-semibold text-primary-foreground">
              {portfolio.holdings.length} {t('profile.postsCount')}
            </Text>
          </View>
        </View>
      </View>

      {portfolio.holdings.map((holding: any) => {
        const holdingProfitable = holding.profitLoss >= 0;
        return (
          <TouchableOpacity
            key={holding.id}
            onPress={() => router.push(`/post/${holding.post.id}`)}
            className="mb-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-sm font-semibold leading-5 text-foreground" numberOfLines={2}>
                  {holding.post.content}
                </Text>
                <TouchableOpacity onPress={() => onNavigateToProfile(holding.post.author.username)}>
                  <Text className="mt-1 text-2xs text-muted-foreground">
                    {t('profile.by')} @{holding.post.author.username}
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                className={`flex-row items-center gap-1 rounded-full px-2 py-1 ${
                  holdingProfitable ? 'bg-success/10' : 'bg-destructive/10'
                }`}
              >
                <Icon
                  as={holdingProfitable ? TrendingUp : TrendingDown}
                  size={14}
                  className={holdingProfitable ? 'text-success' : 'text-destructive'}
                />
                <Text
                  className={`text-2xs font-semibold ${
                    holdingProfitable ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {holding.profitLossPercentage >= 0 ? '+' : ''}
                  {holding.profitLossPercentage.toFixed(1)}%
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row flex-wrap gap-x-6 gap-y-3">
              <View>
                <Text className="text-3xs uppercase tracking-wide text-muted-foreground">
                  {t('wallet.tokens')}
                </Text>
                <Text className="text-sm font-semibold text-foreground">{holding.amount}</Text>
              </View>
              <View>
                <Text className="text-3xs uppercase tracking-wide text-muted-foreground">
                  {t('profile.avgPrice')}
                </Text>
                <Text className="text-sm font-semibold text-foreground">
                  {holding.purchasePrice.toFixed(4)}
                </Text>
              </View>
              <View>
                <Text className="text-3xs uppercase tracking-wide text-muted-foreground">
                  {t('profile.current')}
                </Text>
                <Text className="text-sm font-semibold text-foreground">
                  {holding.currentPrice.toFixed(4)}
                </Text>
              </View>
              <View>
                <Text className="text-3xs uppercase tracking-wide text-muted-foreground">
                  {t('profile.value')}
                </Text>
                <Text className="text-sm font-semibold text-foreground">
                  {holding.currentValue.toFixed(4)} MON
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
