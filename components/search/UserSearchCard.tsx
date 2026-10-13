import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ChevronRight } from 'lucide-react-native';
import { Avatar } from '@/components/common/Avatar';

interface UserSearchCardProps {
  user: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
  };
  onPress: () => void;
}

export function UserSearchCard({ user, onPress }: UserSearchCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="mb-2.5 flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft active:bg-secondary"
    >
      <Avatar
        uri={user.avatar}
        name={user.name}
        username={user.username}
        size="md"
      />
      <View className="flex-1">
        <Text numberOfLines={1} className="text-[15px] font-semibold text-foreground">{user.name || user.username}</Text>
        <Text numberOfLines={1} className="text-sm text-muted-foreground">@{user.username}</Text>
      </View>
      <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
    </TouchableOpacity>
  );
}
