import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Coins, TrendingUp, TrendingDown } from 'lucide-react-native';
import { router } from 'expo-router';
import { EmptyState } from '../common/EmptyState';
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
    return (
      <View className="items-center py-20">
        <ActivityIndicator size="large" color="#6e54ff" />
      </View>
    );
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

  return (
    <View className="px-4 py-4">
      {/* Portfolio Summary */}
      <View className="mb-4 rounded-2xl bg-[#0e100f] p-6">
        <Text className="text-sm text-white/80">{t('profile.totalPortfolioValue')}</Text>
        <Text className="mt-1 text-3xl font-bold text-white">
          {portfolio.totalValue.toFixed(4)} MON
        </Text>
        <View className="mt-3 flex-row items-center gap-2">
          <Icon 
            as={portfolio.totalProfitLoss >= 0 ? TrendingUp : TrendingDown} 
            size={16} 
            className={portfolio.totalProfitLoss >= 0 ? "text-success" : "text-red-300"}
          />
          <Text className={`font-semibold ${portfolio.totalProfitLoss >= 0 ? 'text-success' : 'text-red-300'}`}>
            {portfolio.totalProfitLoss >= 0 ? '+' : ''}{portfolio.totalProfitLoss.toFixed(4)} MON
          </Text>
          <Text className={`text-sm ${portfolio.totalProfitLoss >= 0 ? 'text-success' : 'text-red-300'}`}>
            ({portfolio.totalProfitLossPercentage >= 0 ? '+' : ''}{portfolio.totalProfitLossPercentage.toFixed(2)}%)
          </Text>
        </View>
        <View className="mt-2 flex-row gap-4">
          <View>
            <Text className="text-xs text-white/60">{t('profile.invested')}</Text>
            <Text className="text-sm font-semibold text-white">
              {portfolio.totalInvested.toFixed(4)} MON
            </Text>
          </View>
          <View>
            <Text className="text-xs text-white/60">{t('profile.holdings')}</Text>
            <Text className="text-sm font-semibold text-white">
              {portfolio.holdings.length} {t('profile.postsCount')}
            </Text>
          </View>
        </View>
      </View>

      {/* Holdings List */}
      {portfolio.holdings.map((holding: any) => (
        <TouchableOpacity 
          key={holding.id} 
          onPress={() => router.push(`/post/${holding.post.id}`)}
          className="mb-3 rounded-2xl bg-card p-4"
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="font-semibold" numberOfLines={2}>
                {holding.post.content}
              </Text>
              <TouchableOpacity onPress={() => onNavigateToProfile(holding.post.author.username)}>
                <Text className="mt-1 text-sm text-muted-foreground">
                  {t('profile.by')} @{holding.post.author.username}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="ml-2 items-end">
              <View className="flex-row items-center gap-1">
                <Icon 
                  as={holding.profitLoss >= 0 ? TrendingUp : TrendingDown} 
                  size={14} 
                  className={holding.profitLoss >= 0 ? "text-success" : "text-red-600"}
                />
                <Text className={`text-sm font-semibold ${holding.profitLoss >= 0 ? 'text-success' : 'text-red-600'}`}>
                  {holding.profitLossPercentage >= 0 ? '+' : ''}{holding.profitLossPercentage.toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
          
          <View className="mt-3 flex-row gap-4">
            <View>
              <Text className="text-xs text-muted-foreground">{t('wallet.tokens')}</Text>
              <Text className="font-semibold">{holding.amount}</Text>
            </View>
            <View>
              <Text className="text-xs text-muted-foreground">{t('profile.avgPrice')}</Text>
              <Text className="font-semibold">{holding.purchasePrice.toFixed(4)}</Text>
            </View>
            <View>
              <Text className="text-xs text-muted-foreground">{t('profile.current')}</Text>
              <Text className="font-semibold">{holding.currentPrice.toFixed(4)}</Text>
            </View>
            <View>
              <Text className="text-xs text-muted-foreground">{t('profile.value')}</Text>
              <Text className="font-semibold">{holding.currentValue.toFixed(4)} MON</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
