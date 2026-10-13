import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Heart, MessageCircle } from 'lucide-react-native';
import { TokenBadge } from './TokenBadge';

interface FeedStatsProps {
  likesCount: number;
  commentsCount: number;
  isTokenized?: boolean;
}

export function FeedStats({ likesCount, commentsCount, isTokenized }: FeedStatsProps) {
  return (
    <View className="flex-row items-center gap-4">
      <View className="flex-row items-center gap-1.5">
        <Icon as={Heart} size={13} className="text-muted-foreground" />
        <Text className="text-[12.5px] text-muted-foreground">{likesCount || 0}</Text>
      </View>
      <View className="flex-row items-center gap-1.5">
        <Icon as={MessageCircle} size={13} className="text-muted-foreground" />
        <Text className="text-[12.5px] text-muted-foreground">{commentsCount || 0}</Text>
      </View>
      <TokenBadge isTokenized={isTokenized} />
    </View>
  );
}
