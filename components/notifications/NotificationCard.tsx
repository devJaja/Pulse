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
        return <Icon as={Heart} size={20} className="text-red-600" />;
      case 'comment':
        return <Icon as={MessageCircle} size={20} className="text-blue-600" />;
      case 'follow':
        return <Icon as={UserPlus} size={20} className="text-success" />;
      case 'tip':
      case 'payment_received':
        return <Icon as={DollarSign} size={20} className="text-success" />;
      case 'token_purchase':
        return <Icon as={Coins} size={20} className="text-purple-600" />;
      default:
        return <Icon as={MessageCircle} size={20} className="text-gray-600" />;
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
      className={`border-b border-border p-4 ${
        !notification.isRead ? 'bg-purple-50 dark:bg-purple-950/30' : 'bg-card'
      }`}
    >
      <View className="flex-row gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          {getNotificationIcon(notification.type)}
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="font-medium">{notification.message}</Text>
              {notification.amount && (
                <Text className="mt-1 text-sm font-semibold text-success">
                  {notification.amount} MON
                </Text>
              )}
              {notification.post && (
                <Text className="mt-1 text-sm text-muted-foreground" numberOfLines={2}>
                  {`"${notification.post.content}"`}
                </Text>
              )}
            </View>
            {!notification.isRead && (
              <View className="ml-2 h-2 w-2 rounded-full bg-[#0e100f]" />
            )}
          </View>
          <Text className="mt-1 text-xs text-muted-foreground">
            {formatTime(notification.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
