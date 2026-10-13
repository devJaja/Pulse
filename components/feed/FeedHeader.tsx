import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { Avatar } from '@/components/ui/avatar';

interface FeedHeaderProps {
  author: {
    avatar?: string;
    name?: string;
    username: string;
  };
  createdAt: string;
  onAuthorPress?: () => void;
}

export function FeedHeader({ author, createdAt, onAuthorPress }: FeedHeaderProps) {
  const handlePress = () => {
    if (onAuthorPress) {
      onAuthorPress();
    } else {
      router.push(`/(tabs)/profile?username=${author.username}`);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`View ${author.name || author.username}'s profile`}
      className="mb-3 flex-row items-center gap-3 active:opacity-70"
    >
      <Avatar
        uri={author.avatar}
        name={author.name}
        username={author.username}
        size="sm"
        ring
      />
      <View className="flex-1">
        <Text numberOfLines={1} className="text-[14.5px] font-semibold text-foreground">
          {author.name || author.username}
        </Text>
        <Text numberOfLines={1} className="mt-0.5 text-[12.5px] text-muted-foreground">
          @{author.username} · {new Date(createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
