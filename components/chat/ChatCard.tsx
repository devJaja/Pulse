import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { formatDistanceToNow } from 'date-fns';

interface ChatCardProps {
  id: string;
  participant: {
    avatar?: string;
    name?: string;
    username: string;
  };
  lastMessage?: {
    content: string;
    timestamp: string;
    isRead: boolean;
  };
  unreadCount: number;
  onPress: () => void;
}

export function ChatCard({
  participant,
  lastMessage,
  unreadCount,
  onPress,
}: ChatCardProps) {
  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: false });
    } catch {
      return '';
    }
  };

  const hasUnread = unreadCount > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="mb-2.5 flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft active:bg-secondary"
    >
      <Avatar
        uri={participant.avatar}
        name={participant.name}
        username={participant.username}
        size="md"
      />

      <View className="flex-1">
        <View className="flex-row items-center justify-between gap-2">
          <Text
            numberOfLines={1}
            className="flex-1 text-[15px] font-semibold text-foreground"
          >
            {participant.name || participant.username}
          </Text>
          {lastMessage && (
            <Text
              className={`text-2xs ${
                hasUnread ? 'font-semibold text-primary' : 'text-muted-foreground'
              }`}
            >
              {formatTime(lastMessage.timestamp)}
            </Text>
          )}
        </View>

        <View className="mt-1 flex-row items-center justify-between gap-2">
          <Text
            className={`flex-1 text-sm ${
              hasUnread ? 'font-medium text-foreground' : 'text-muted-foreground'
            }`}
            numberOfLines={1}
          >
            {lastMessage?.content || 'No messages yet'}
          </Text>
          {hasUnread && (
            <View className="ml-1">
              <Badge count={unreadCount} variant="primary" size="sm" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
