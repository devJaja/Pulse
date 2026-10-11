import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useWallet } from '@/hooks/useWallet';
import { formatDistanceToNow } from 'date-fns';
import type { Transaction } from '@/types';

export default function TransactionsScreen() {
  const { transactions, isLoadingTransactions, fetchNextPage, hasNextPage, isFetchingNextPage } = useWallet();

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
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Icon as={ArrowLeft} size={24} className="text-white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">All Transactions</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          if (isCloseToBottom && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        scrollEventThrottle={400}
      >
        <View className="px-4 py-6">
          {isLoadingTransactions && transactions.length === 0 ? (
            <View className="items-center py-10">
              <ActivityIndicator size="large" color="#6e54ff" />
            </View>
          ) : transactions.length === 0 ? (
            <View className="items-center py-10">
              <Text className="text-muted-foreground">No transactions yet</Text>
            </View>
          ) : (
            <>
              {transactions.map((tx: Transaction) => (
                <TouchableOpacity
                  key={tx.signature}
                  onPress={() => router.push(`/transaction/${tx.signature}`)}
                  className="mb-3 flex-row items-center justify-between rounded-2xl bg-card p-4"
                >
                  <View className="flex-row items-center gap-3">
                    <View className={`h-12 w-12 items-center justify-center rounded-full ${tx.type === 'receive' ? 'bg-success/10' : 'bg-purple-100'}`}>
                      <Icon 
                        as={tx.type === 'receive' ? ArrowDownLeft : ArrowUpRight} 
                        size={20} 
                        className={tx.type === 'receive' ? 'text-success' : 'text-purple-600'}
                      />
                    </View>
                    <View>
                      <Text className="font-semibold">
                        {tx.type === 'receive' ? 'Received' : tx.type === 'send' ? 'Sent' : 'Airdrop'}
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        {tx.blockTime ? formatTime(tx.blockTime) : 'Pending'}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className={`font-semibold ${tx.type === 'receive' ? 'text-success' : 'text-foreground'}`}>
                      {tx.type === 'receive' ? '+' : '-'}{tx.amount.toFixed(4)} MON
                    </Text>
                    <Text className="text-sm text-muted-foreground capitalize">{tx.status}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              
              {isFetchingNextPage && (
                <View className="py-4">
                  <ActivityIndicator size="small" color="#6e54ff" />
                </View>
              )}
              
              {!hasNextPage && transactions.length > 0 && (
                <View className="py-4">
                  <Text className="text-center text-sm text-muted-foreground">
                    No more transactions
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
