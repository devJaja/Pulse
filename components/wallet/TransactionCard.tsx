import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

interface TransactionCardProps {
  type: 'send' | 'receive' | 'swap';
  amount: number;
  token: string;
  timestamp: string;
  status: 'confirmed' | 'pending' | 'failed';
  from?: string;
  to?: string;
  onPress?: () => void;
}

export function TransactionCard({
  type,
  amount,
  token,
  timestamp,
  status,
  from,
  to,
  onPress,
}: TransactionCardProps) {
  const getIcon = () => {
    switch (type) {
      case 'send':
        return ArrowUpRight;
      case 'receive':
        return ArrowDownLeft;
      case 'swap':
        return RefreshCw;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'send':
        return 'text-foreground';
      case 'receive':
        return 'text-success';
      case 'swap':
        return 'text-primary';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'send':
        return 'text-destructive';
      case 'receive':
        return 'text-success';
      case 'swap':
        return 'text-primary';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'confirmed':
        return 'text-success';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'failed':
        return 'text-destructive';
    }
  };

  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mb-3 rounded-2xl border border-border bg-card p-4 shadow-soft active:bg-accent/50"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className={`h-11 w-11 items-center justify-center rounded-full ${
            type === 'send' ? 'bg-destructive/10' :
            type === 'receive' ? 'bg-success/10' :
            'bg-primary/10'
          }`}>
            <Icon as={getIcon()} size={20} className={getIconColor()} strokeWidth={2} />
          </View>
          <View>
            <Text className="text-base font-semibold capitalize text-card-foreground">{type}</Text>
            <Text className="text-sm text-muted-foreground">{formatTime(timestamp)}</Text>
          </View>
        </View>

        <View className="items-end">
          <Text className={`text-base font-semibold tabular-nums ${getColor()}`}>
            {type === 'send' ? '-' : '+'}{amount.toFixed(4)} {token}
          </Text>
          <Text className={`text-2xs font-semibold uppercase tracking-wide ${getStatusColor()}`}>
            {status}
          </Text>
        </View>
      </View>

      {(from || to) && (
        <View className="mt-3 rounded-xl bg-muted/60 px-3 py-2">
          {from && (
            <Text className="text-2xs font-mono text-muted-foreground">
              From: {from.slice(0, 8)}...{from.slice(-6)}
            </Text>
          )}
          {to && (
            <Text className="text-2xs font-mono text-muted-foreground">
              To: {to.slice(0, 8)}...{to.slice(-6)}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}
