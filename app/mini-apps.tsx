import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, Sparkles, Gamepad2, Coins, Zap, Gift, TrendingUp, UtensilsCrossed } from 'lucide-react-native';
import { router } from 'expo-router';

const liveApps = [
  {
    id: 'swap',
    name: 'Token Swap',
    description: 'Swap MON for tokens instantly',
    icon: Coins,
    color: 'bg-blue-500',
    route: '/mini-apps/swap',
  },
  {
    id: 'food',
    name: 'Food Delivery',
    description: 'Order food and pay with MON',
    icon: UtensilsCrossed,
    color: 'bg-orange-500',
    route: '/mini-apps/food',
  },
  {
    id: 'dice',
    name: 'Dice Game',
    description: 'Roll the dice and win MON',
    icon: Gamepad2,
    color: 'bg-success/100',
    route: '/mini-apps/dice',
  },
  {
    id: 'coinflip',
    name: 'Coin Flip',
    description: 'Heads or tails? Double your bet!',
    icon: Coins,
    color: 'bg-yellow-500',
    route: '/mini-apps/coinflip',
  },
  {
    id: 'spin',
    name: 'Lucky Spin',
    description: 'Spin the wheel for big wins',
    icon: Sparkles,
    color: 'bg-pink-500',
    route: '/mini-apps/spin',
  },
  {
    id: 'airdrop',
    name: 'Daily Airdrop',
    description: 'Claim your daily MON rewards',
    icon: Gift,
    color: 'bg-purple-500',
    route: '/mini-apps/airdrop',
  },
];

const upcomingApps = [
  {
    id: '4',
    name: 'DeFi Staking',
    description: 'Stake tokens and earn yields',
    icon: Zap,
    color: 'bg-yellow-500',
  },
  {
    id: '5',
    name: 'Price Predictor',
    description: 'Predict MON price and win',
    icon: TrendingUp,
    color: 'bg-red-500',
  },
];

export default function MiniAppsScreen() {
  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-[#0e100f] px-4 pb-8 pt-12">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <Icon as={ArrowLeft} size={24} className="text-white" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-white">Mini Apps</Text>
          </View>

          {/* Hero Section */}
          <View className="mt-6 items-center">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-white/20">
              <Icon as={Sparkles} size={48} className="text-white" />
            </View>
            <Text className="mt-4 text-center text-2xl font-bold text-white">
              Explore Mini Apps
            </Text>
            <Text className="mt-2 text-center text-sm text-white/90">
              Swap, play, earn and more!
            </Text>
          </View>
        </View>

        {/* Live Apps */}
        <View className="mt-6 px-4">
          <View className="flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-success/100" />
            <Text className="text-xl font-bold">Live Now</Text>
          </View>
          <Text className="mt-1 text-sm text-muted-foreground">
            Try these apps right now
          </Text>

          <View className="mt-4 gap-3">
            {liveApps.map((app) => (
              <TouchableOpacity
                key={app.id}
                onPress={() => router.push(app.route as any)}
                className="overflow-hidden rounded-2xl bg-card active:opacity-80"
              >
                <View className="bg-[#0e100f] p-4">
                  <View className="flex-row items-center gap-3">
                    <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                      <Icon as={app.icon} size={28} className="text-white" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-white">{app.name}</Text>
                      <Text className="mt-1 text-sm text-white/90">{app.description}</Text>
                    </View>
                    <Icon as={ArrowLeft} size={20} className="text-white rotate-180" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Coming Soon */}
        <View className="mt-6 px-4">
          <Text className="text-xl font-bold">Coming Soon</Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            More apps in development
          </Text>

          <View className="mt-4 gap-3">
            {upcomingApps.map((app) => (
              <View
                key={app.id}
                className="overflow-hidden rounded-2xl bg-card opacity-60"
              >
                <View className="bg-gray-400 dark:bg-gray-700 p-4">
                  <View className="flex-row items-center gap-3">
                    <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                      <Icon as={app.icon} size={28} className="text-white" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-white">{app.name}</Text>
                      <Text className="mt-1 text-sm text-white/90">{app.description}</Text>
                    </View>
                  </View>
                </View>
                <View className="flex-row items-center justify-between bg-card p-4">
                  <Text className="text-sm text-muted-foreground">Status</Text>
                  <View className="rounded-full bg-yellow-100 dark:bg-yellow-900 px-3 py-1">
                    <Text className="text-xs font-medium text-yellow-700 dark:text-yellow-300">In Development</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
