import { View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, CheckCheck } from 'lucide-react-native';
import { useNotifications } from '@/hooks/useNotifications';
import { router } from 'expo-router';
import type { Notification } from '@/types';
import { NotificationCard } from '@/components/notifications';

export default function NotificationsScreen() {
  const { notifications, unreadCount, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, markAsRead, markAllAsRead } = useNotifications();

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.type === 'payment_received' && notification.signature) {
      // Navigate to transaction details page
      router.push(`/transaction/${notification.signature}`);
    } else if (notification.post) {
      router.push(`/post/${notification.post._id}`);
    } else if (notification.type === 'follow') {
      router.push(`/(tabs)/profile?username=${notification.sender.username}`);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="border-b border-border bg-card px-4 pb-4 pt-12">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <Icon as={ArrowLeft} size={24} className="text-foreground" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold">Notifications</Text>
              {unreadCount > 0 && (
                <Text className="text-sm text-muted-foreground">
                  {unreadCount} unread
                </Text>
              )}
            </View>
          </View>
          
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={() => markAllAsRead()}
              className="flex-row items-center gap-1 rounded-lg bg-purple-100 px-3 py-2"
            >
              <Icon as={CheckCheck} size={16} className="text-purple-600" />
              <Text className="text-sm font-medium text-purple-600">Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          if (isCloseToBottom && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        scrollEventThrottle={400}
      >
        {isLoading && notifications.length === 0 ? (
          <View className="items-center py-20">
            <ActivityIndicator size="large" color="#6e54ff" />
          </View>
        ) : notifications.length === 0 ? (
          <View className="items-center py-20">
            <Text className="text-muted-foreground">No notifications yet</Text>
            <Text className="mt-2 text-sm text-muted-foreground">
              We&apos;ll notify you when something happens
            </Text>
          </View>
        ) : (
          notifications.map((notification: Notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onPress={() => handleNotificationPress(notification)}
            />
          ))
        )}
        
        {isFetchingNextPage && (
          <View className="py-4">
            <ActivityIndicator size="small" color="#6e54ff" />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
