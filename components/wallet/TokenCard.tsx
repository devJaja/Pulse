import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react-native';

interface TokenCardProps {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  change24h?: number;
  icon?: LucideIcon;
  onPress?: () => void;
}

export function TokenCard({
  symbol,
  name,
  balance,
  value,
  change24h = 0,
  icon: IconComponent,
  onPress,
}: TokenCardProps) {
  const isPositive = change24h >= 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mb-3 rounded-2xl border border-border bg-card p-4 shadow-soft active:bg-accent/50"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {IconComponent && (
            <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10">
              <Icon as={IconComponent} size={22} className="text-primary" strokeWidth={2} />
            </View>
          )}
          <View>
            <Text className="text-base font-semibold text-card-foreground">{symbol}</Text>
            <Text className="text-sm text-muted-foreground">{name}</Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-base font-semibold tabular-nums text-card-foreground">
            {balance.toFixed(4)}
          </Text>
          <Text className="text-sm tabular-nums text-muted-foreground">${value.toFixed(2)}</Text>
          {change24h !== 0 && (
            <View className="mt-0.5 flex-row items-center gap-1">
              <Icon
                as={isPositive ? TrendingUp : TrendingDown}
                size={12}
                className={isPositive ? 'text-success' : 'text-destructive'}
              />
              <Text
                className={`text-xs font-medium tabular-nums ${isPositive ? 'text-success' : 'text-destructive'}`}
              >
                {isPositive ? '+' : ''}{change24h.toFixed(2)}%
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
