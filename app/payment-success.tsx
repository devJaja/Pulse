import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { X, CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';

export default function PaymentSuccessScreen() {
  return (
    <View className="flex-1 bg-background">
      {/* Close Button */}
      <View className="absolute right-4 top-12 z-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-secondary active:opacity-70"
        >
          <Icon as={X} size={20} className="text-foreground" />
        </TouchableOpacity>
      </View>

      {/* Success Content */}
      <View className="flex-1 items-center justify-center px-4">
        {/* Success Icon with Confetti */}
        <View className="relative mb-8 h-48 w-48 items-center justify-center">
          {/* Confetti pieces */}
          <View className="absolute left-8 top-4 h-3 w-6 rotate-12 rounded-full bg-red-500" />
          <View className="absolute right-12 top-8 h-4 w-4 -rotate-45 bg-blue-500" />
          <View className="absolute left-16 top-12 h-3 w-3 rotate-45 rounded-full bg-success" />
          <View className="absolute right-8 top-16 h-4 w-6 -rotate-12 rounded-full bg-yellow-500" />
          <View className="absolute left-12 top-20 h-3 w-4 rotate-45 bg-orange-500" />
          <View className="absolute right-16 top-6 h-3 w-3 -rotate-12 rounded-full bg-pink-500" />

          {/* Success Circle */}
          <View className="h-40 w-40 items-center justify-center rounded-full border border-success/20 bg-success/10">
            <Icon as={CheckCircle} size={80} className="text-success" />
          </View>
        </View>

        <Text className="text-3xl font-bold">Payment Sent!</Text>
        <Text className="mt-2 text-center text-sm text-muted-foreground">
          Your transaction has been completed successfully
        </Text>

        {/* Transaction Details */}
        <View className="mt-8 w-full rounded-2xl border border-border bg-card p-6 shadow-soft">
          <View className="flex-row items-center justify-between border-b border-border pb-4">
            <Text className="text-sm text-muted-foreground">Amount</Text>
            <Text className="text-xl font-bold">10 MON</Text>
          </View>
          <View className="flex-row items-center justify-between pt-4">
            <Text className="text-sm text-muted-foreground">Recipient</Text>
            <Text className="text-xl font-bold">@monadfan</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3 p-4">
        <TouchableOpacity
          onPress={() => router.dismissAll()}
          className="flex-1 items-center rounded-xl border border-border bg-card py-4 active:opacity-70"
        >
          <Text className="text-lg font-semibold text-foreground">Done</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            router.dismissAll();
            router.push('/(tabs)/wallet/send');
          }}
          className="flex-1 items-center rounded-xl bg-primary py-4 active:bg-primary/90"
        >
          <Text className="text-lg font-semibold text-primary-foreground">Send Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
