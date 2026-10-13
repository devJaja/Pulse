import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Heart, MessageCircle } from 'lucide-react-native';
import { Avatar } from '@/components/common/Avatar';
import { formatDistanceToNow } from 'date-fns';

interface PostSearchCardProps {
  post: {
    id: string;
    content: string;
    author: {
      username: string;
      name: string;
      avatar?: string;
    };
    createdAt: string;
    likesCount: number;
    commentsCount: number;
  };
  onPress: () => void;
}

export function PostSearchCard({ post, onPress }: PostSearchCardProps) {
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
      activeOpacity={0.85}
      className="mb-2.5 rounded-2xl border border-border bg-card p-4 shadow-soft active:bg-secondary"
    >
      <View className="flex-row items-center gap-3">
        <Avatar
          uri={post.author.avatar}
          name={post.author.name}
          username={post.author.username}
          size="sm"
        />
        <View className="flex-1">
          <Text numberOfLines={1} className="text-[14px] font-semibold text-foreground">
            {post.author.name || post.author.username}
          </Text>
          <Text numberOfLines={1} className="text-2xs text-muted-foreground">
            @{post.author.username} · {formatTime(post.createdAt)}
          </Text>
        </View>
      </View>

      <Text className="mt-3 text-[15px] leading-5 text-foreground" numberOfLines={3}>
        {post.content}
      </Text>

      <View className="mt-3 flex-row items-center gap-4">
        <View className="flex-row items-center gap-1.5">
          <Icon as={Heart} size={14} className="text-red-500" />
          <Text className="text-sm text-muted-foreground">{post.likesCount}</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Icon as={MessageCircle} size={14} className="text-muted-foreground" />
          <Text className="text-sm text-muted-foreground">{post.commentsCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
