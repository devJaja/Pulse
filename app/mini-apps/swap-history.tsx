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
      <View className="bg-[#0e100f] px-4 pb-6 pt-12">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Icon as={ArrowLeft} size={24} className="text-white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">Swap History</Text>
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
        <View className="mt-6 pb-6">
          {isLoading ? (
            <View className="items-center py-10">
              <ActivityIndicator size="large" color="#6e54ff" />
            </View>
          ) : swaps.length === 0 ? (
            <View className="items-center py-10">
              <Text className="text-muted-foreground">No swap history yet</Text>
            </View>
          ) : (
            <>
              {swaps.map((swap) => (
                <View
                  key={swap.id}
                  className="mb-3 rounded-2xl bg-card p-4"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                        <Icon as={ArrowRightLeft} size={20} className="text-blue-600" />
                      </View>
                      <View>
                        <View className="flex-row items-center gap-2">
                          <View className={`h-6 w-6 items-center justify-center rounded-full ${getTokenColor(swap.fromToken)}`}>
                            <Text className="text-xs text-white font-semibold">{getTokenIcon(swap.fromToken)}</Text>
                          </View>
                          <Text className="font-semibold">
                            {swap.fromAmount.toFixed(4)} {swap.fromToken}
                          </Text>
                          <Text className="text-muted-foreground">→</Text>
                          <View className={`h-6 w-6 items-center justify-center rounded-full ${getTokenColor(swap.toToken)}`}>
                            <Text className="text-xs text-white font-semibold">{getTokenIcon(swap.toToken)}</Text>
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
                  </View>
                  
                  <View className="mt-3 flex-row items-center justify-between rounded-lg bg-blue-50 dark:bg-blue-950 p-2">
                    <Text className="text-xs text-blue-700 dark:text-blue-300">
                      Rate: 1 {swap.fromToken} = {swap.rate.toFixed(6)} {swap.toToken}
                    </Text>
                    {swap.priceImpact > 0 && (
                      <Text className="text-xs text-blue-600 dark:text-blue-400">
                        Impact: {swap.priceImpact.toFixed(2)}%
                      </Text>
                    )}
                  </View>
                  
                  <Text className="mt-2 text-xs text-muted-foreground capitalize">
                    Status: {swap.status}
                  </Text>
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
