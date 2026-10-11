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
  return (
    <TouchableOpacity
      onPress={onPress}
      className="border-b border-border py-4"
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
            <Text className="font-semibold">{token.author.name || token.author.username}</Text>
            <View className="rounded-full bg-purple-100 px-2 py-0.5 dark:bg-purple-900">
              <Text className="text-xs font-semibold text-purple-600 dark:text-purple-300">TOKEN</Text>
            </View>
          </View>
          <Text className="mt-1" numberOfLines={2}>{token.content}</Text>
          <View className="mt-2 flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <Icon as={Coins} size={14} className="text-purple-600" />
              <Text className="text-sm font-semibold text-purple-600">{token.tokenPrice} MON</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Icon as={TrendingUp} size={14} className="text-muted-foreground" />
              <Text className="text-sm text-muted-foreground">
                {token.tokensSold}/{token.tokenSupply} sold
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
