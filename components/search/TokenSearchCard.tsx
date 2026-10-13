import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Coins, TrendingUp } from 'lucide-react-native';
import { Avatar } from '@/components/common/Avatar';

interface TokenSearchCardProps {
  token: {
    id: string;
    content: string;
    author: {
      username: string;
      name: string;
      avatar?: string;
    };
    tokenPrice: number;
    tokenSupply: number;
    tokensSold: number;
  };
  onPress: () => void;
}

export function TokenSearchCard({ token, onPress }: TokenSearchCardProps) {
  const progress =
    token.tokenSupply > 0
      ? Math.min(100, Math.round((token.tokensSold / token.tokenSupply) * 100))
      : 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="mb-2.5 rounded-2xl border border-border bg-card p-4 shadow-soft active:bg-secondary"
    >
      <View className="flex-row items-start gap-3">
        <Avatar
          uri={token.author.avatar}
          name={token.author.name}
          username={token.author.username}
          size="sm"
        />
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text numberOfLines={1} className="shrink text-[14px] font-semibold text-foreground">
              {token.author.name || token.author.username}
            </Text>
            <View className="flex-row items-center gap-1 rounded-full bg-accent px-2 py-0.5">
              <Icon as={Coins} size={11} className="text-primary" />
              <Text className="text-3xs font-semibold tracking-wide text-primary">TOKEN</Text>
            </View>
          </View>
          <Text className="mt-1 text-[15px] leading-5 text-foreground" numberOfLines={2}>
            {token.content}
          </Text>

          <View className="mt-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Icon as={TrendingUp} size={14} className="text-primary" />
              <Text className="text-sm font-semibold text-primary">{token.tokenPrice} MON</Text>
            </View>
            <Text className="text-sm text-muted-foreground">
              {token.tokensSold}/{token.tokenSupply} sold
            </Text>
          </View>

          <View className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <View className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
