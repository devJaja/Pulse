import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useWallet } from '@/hooks/useWallet';
import type { Transaction } from '@/types';
import { TransactionCard } from '@/components/wallet';

export default function TransactionHistoryScreen() {
  const { transactions, isLoadingTransactions, fetchNextPage, hasNextPage, isFetchingNextPage } = useWallet();

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-[#0e100f] px-4 pb-6 pt-12">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Icon as={ArrowLeft} size={24} className="text-white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">Transaction History</Text>
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
                <TransactionCard
                  key={tx.signature}
                  type={tx.type === 'airdrop' ? 'receive' : tx.type}
                  amount={tx.amount}
                  token="MON"
                  timestamp={tx.blockTime || new Date().toISOString()}
                  status={tx.status}
                  from={tx.type === 'receive' ? tx.fromAddress : undefined}
                  to={tx.type === 'send' ? tx.toAddress : undefined}
                  onPress={() => router.push(`/transaction/${tx.signature}`)}
                />
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
