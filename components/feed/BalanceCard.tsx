import { ActivityIndicator, Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Bell,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { Badge } from '@/components/common/Badge';
import { useTranslation } from 'react-i18next';

interface BalanceCardProps {
  balance: number;
  walletAddress: string;
  isLoading: boolean;
  showBalance: boolean;
  unreadCount: number;
  onToggleBalance: () => void;
  onCopyAddress: () => void;
  onRefresh: () => void;
}

export function BalanceCard({
  balance,
  walletAddress,
  isLoading,
  showBalance,
  unreadCount,
  onToggleBalance,
  onCopyAddress,
  onRefresh,
}: BalanceCardProps) {
  const { t } = useTranslation();

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : '—';

  return (
    <View className="mx-4 overflow-hidden rounded-2xl border border-border bg-card shadow-card dark:bg-[#0e100f]">
      <View className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-primary/60 dark:bg-[#5A3FE0]" />
      <View className="absolute -right-4 top-10 h-24 w-24 rounded-full bg-accent/60 dark:bg-[#1D1554]" />
      <View className="absolute bottom-0 right-10 h-1.5 w-1.5 rounded-full bg-primary dark:bg-gold" />

      <View className="p-5">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground dark:text-white/55">
                {t('wallet.totalBalance')}
              </Text>
              <Pressable
                onPress={onToggleBalance}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={showBalance ? 'Hide balance' : 'Show balance'}
                className="active:opacity-70"
              >
                <Icon
                  as={showBalance ? Eye : EyeOff}
                  size={14}
                  className="text-muted-foreground dark:text-white/45"
                />
              </Pressable>
            </View>

            {isLoading ? (
              <View className="mt-2.5 h-9 w-32 items-center justify-center">
                <ActivityIndicator size="small" color="#6e54ff" />
              </View>
            ) : (
              <View className="mt-1.5 flex-row items-baseline gap-2">
                <Text className="text-[34px] font-bold leading-[42px] tracking-tight text-foreground dark:text-white">
                  {showBalance ? balance.toFixed(2) : '••••••'}
                </Text>
                <Text className="text-base font-semibold text-primary dark:text-gold">MON</Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={onRefresh}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel={t('feed.balanceRefreshed')}
              className="h-9 w-9 items-center justify-center rounded-full bg-muted/60 active:bg-muted dark:bg-white/10 dark:active:bg-white/20"
              style={{ opacity: isLoading ? 0.5 : 1 }}
            >
              <Icon as={RefreshCw} size={16} className="text-foreground dark:text-white" />
            </Pressable>
            <Pressable
              onPress={() => router.push('/(tabs)/notifications')}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              className="relative h-9 w-9 items-center justify-center rounded-full bg-muted/60 active:bg-muted dark:bg-white/10 dark:active:bg-white/20"
            >
              <Icon as={Bell} size={16} className="text-foreground dark:text-white" />
              {unreadCount > 0 && (
                <View className="absolute -right-1.5 -top-1.5">
                  <Badge count={unreadCount} variant="danger" size="sm" />
                </View>
              )}
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={onCopyAddress}
          accessibilityRole="button"
          accessibilityLabel="Copy wallet address"
          className="mt-3 flex-row items-center gap-2 self-start rounded-full border border-border bg-muted/40 px-3 py-1.5 active:bg-muted dark:border-white/10 dark:bg-white/[0.07] dark:active:bg-white/15"
        >
          <Icon as={Copy} size={12} className="text-muted-foreground dark:text-white/50" />
          <Text className="font-mono text-[11px] text-muted-foreground dark:text-white/70">
            {shortAddress}
          </Text>
        </Pressable>

        {/* Quick actions */}
        <View className="mt-5 flex-row gap-2.5">
          <Pressable
            onPress={() => router.push('/(tabs)/wallet/send')}
            accessibilityRole="button"
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 shadow-glow active:opacity-90"
          >
            <Icon as={ArrowUpRight} size={17} className="text-primary-foreground" />
            <Text className="text-[15px] font-semibold text-primary-foreground">
              {t('common.send')}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(tabs)/wallet/receive')}
            accessibilityRole="button"
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-3.5 active:bg-muted dark:border-white/20 dark:bg-white/10 dark:active:bg-white/20"
          >
            <Icon as={ArrowDownLeft} size={17} className="text-foreground dark:text-white" />
            <Text className="text-[15px] font-semibold text-foreground dark:text-white">
              {t('common.receive')}
            </Text>
          </Pressable>
        </View>

        {/* Network */}
        <View className="mt-4 flex-row items-center gap-2 self-start rounded-full bg-muted/40 px-2.5 py-1 dark:bg-white/[0.07]">
          <View className="h-1.5 w-1.5 rounded-full bg-success" />
          <Text className="text-[10.5px] font-medium text-muted-foreground dark:text-white/70">
            {t('wallet.monadTestnet')}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function BalanceCardSkeleton() {
  return (
    <View className="mx-4 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft dark:bg-[#0e100f]">
      <View className="h-3 w-28 rounded-full bg-muted/60 dark:bg-white/15" />
      <View className="mt-3 h-9 w-40 rounded-full bg-muted/60 dark:bg-white/15" />
      <View className="mt-4 h-7 w-32 rounded-full bg-muted/40 dark:bg-white/10" />
      <View className="mt-5 flex-row gap-2.5">
        <View className="h-12 flex-1 rounded-xl bg-muted/40 dark:bg-white/10" />
        <View className="h-12 flex-1 rounded-xl bg-muted/40 dark:bg-white/10" />
      </View>
    </View>
  );
}
