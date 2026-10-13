import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, ArrowRightLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSwapHistory } from '@/hooks/useSwapHistory';
import { formatDistanceToNow } from 'date-fns';
import { getTokenIcon, getTokenColor } from '@/lib/tokens';

export default function SwapHistoryScreen() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useSwapHistory();

  const swaps = data?.pages.flatMap((page) => page.swaps) || [];

  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="border-b border-border bg-card px-4 pb-5 pt-12">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-secondary active:opacity-70"
          >
            <Icon as={ArrowLeft} size={20} className="text-foreground" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold">Swap History</Text>
            <Text className="mt-0.5 text-sm text-muted-foreground">
              All your past swaps
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-4"
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          if (isCloseToBottom && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        scrollEventThrottle={400}
      >
        <View className="mt-5 pb-6">
          {isLoading ? (
            <View className="items-center py-10">
              <ActivityIndicator size="large" color="#6e54ff" />
            </View>
          ) : swaps.length === 0 ? (
            <View className="items-center py-16">
              <View className="h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                <Icon as={ArrowRightLeft} size={28} className="text-muted-foreground" />
              </View>
              <Text className="mt-4 font-semibold">No swap history yet</Text>
              <Text className="mt-1 text-sm text-muted-foreground">
                Your completed swaps will show up here
              </Text>
            </View>
          ) : (
            <>
              {swaps.map((swap) => (
                <View
                  key={swap.id}
                  className="mb-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/15">
                      <Icon as={ArrowRightLeft} size={20} className="text-blue-600 dark:text-blue-300" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row flex-wrap items-center gap-2">
                        <View className={`h-6 w-6 items-center justify-center rounded-full ${getTokenColor(swap.fromToken)}`}>
                          <Text className="text-2xs font-semibold text-white">{getTokenIcon(swap.fromToken)}</Text>
                        </View>
                        <Text className="font-semibold">
                          {swap.fromAmount.toFixed(4)} {swap.fromToken}
                        </Text>
                        <Text className="text-muted-foreground">→</Text>
                        <View className={`h-6 w-6 items-center justify-center rounded-full ${getTokenColor(swap.toToken)}`}>
                          <Text className="text-2xs font-semibold text-white">{getTokenIcon(swap.toToken)}</Text>
                        </View>
                        <Text className="font-semibold">
                          {swap.toAmount.toFixed(4)} {swap.toToken}
                        </Text>
                      </View>
                      <Text className="mt-1 text-sm text-muted-foreground">
                        {formatTime(swap.createdAt)}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-3 flex-row items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-500/30 dark:bg-blue-500/10">
                    <Text className="text-xs text-blue-700 dark:text-blue-300">
                      Rate: 1 {swap.fromToken} = {swap.rate.toFixed(6)} {swap.toToken}
                    </Text>
                    {swap.priceImpact > 0 && (
                      <Text className="text-xs text-blue-600 dark:text-blue-300/80">
                        Impact: {swap.priceImpact.toFixed(2)}%
                      </Text>
                    )}
                  </View>

                  <View className="mt-3 flex-row items-center justify-between">
                    <Text className="text-xs text-muted-foreground">Status</Text>
                    <View className="rounded-full bg-success/10 px-2.5 py-1">
                      <Text className="text-xs font-medium capitalize text-success">{swap.status}</Text>
                    </View>
                  </View>
                </View>
              ))}
              {isFetchingNextPage && (
                <View className="py-4">
                  <ActivityIndicator size="small" color="#6e54ff" />
                </View>
              )}
              {!hasNextPage && swaps.length > 0 && (
                <View className="py-4">
                  <Text className="text-center text-sm text-muted-foreground">
                    No more swaps
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
