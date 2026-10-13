import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Heart, MessageCircle, UserPlus, DollarSign, Coins } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCardProps {
  notification: {
    id: string;
    type: string;
    message: string;
    amount?: number;
    isRead: boolean;
    createdAt: string;
    post?: {
      content: string;
    };
  };
  onPress: () => void;
}

export function NotificationCard({ notification, onPress }: NotificationCardProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Icon as={Heart} size={18} className="text-red-500" />;
      case 'comment':
        return <Icon as={MessageCircle} size={18} className="text-blue-500" />;
      case 'follow':
        return <Icon as={UserPlus} size={18} className="text-success" />;
      case 'tip':
      case 'payment_received':
        return <Icon as={DollarSign} size={18} className="text-success" />;
      case 'token_purchase':
        return <Icon as={Coins} size={18} className="text-primary" />;
      default:
        return <Icon as={MessageCircle} size={18} className="text-muted-foreground" />;
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
      activeOpacity={0.85}
      className={`mb-2.5 flex-row gap-3 rounded-2xl border p-4 shadow-soft ${
        !notification.isRead ? 'border-primary/30 bg-accent' : 'border-border bg-card'
      }`}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-background">
        {getNotificationIcon(notification.type)}
      </View>

      <View className="flex-1">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-2">
            <Text
              className={`text-[14px] leading-5 ${
                notification.isRead ? 'text-foreground' : 'font-semibold text-foreground'
              }`}
            >
              {notification.message}
            </Text>
            {notification.amount && (
              <Text className="mt-1 text-sm font-semibold text-success">
                {notification.amount} MON
              </Text>
            )}
            {notification.post && (
              <View className="mt-2 rounded-xl border border-border bg-background px-3 py-2">
                <Text className="text-sm text-muted-foreground" numberOfLines={2}>
                  {`"${notification.post.content}"`}
                </Text>
              </View>
            )}
          </View>
          {!notification.isRead && (
            <View className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
          )}
        </View>
        <Text className="mt-1.5 text-2xs text-muted-foreground">
          {formatTime(notification.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
