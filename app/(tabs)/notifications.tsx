import { View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, CheckCheck, Bell } from 'lucide-react-native';
import { useNotifications } from '@/hooks/useNotifications';
import { router } from 'expo-router';
import type { Notification } from '@/types';
import { NotificationCard } from '@/components/notifications';
import { EmptyState, LoadingSpinner } from '@/components/common';

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
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              className="h-9 w-9 items-center justify-center rounded-full bg-secondary active:bg-accent"
            >
              <Icon as={ArrowLeft} size={20} className="text-foreground" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-foreground">Notifications</Text>
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
              activeOpacity={0.8}
              className="flex-row items-center gap-1.5 rounded-full border border-border bg-accent px-3 py-2 active:bg-secondary"
            >
              <Icon as={CheckCheck} size={16} className="text-primary" />
              <Text className="text-sm font-medium text-primary">Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#6e54ff" colors={['#6e54ff']} />
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
          <LoadingSpinner />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            message="No notifications yet"
            subtitle="We'll notify you when something happens"
          />
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
