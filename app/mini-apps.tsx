import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, Sparkles, Gamepad2, Coins, Zap, Gift, TrendingUp, UtensilsCrossed, ChevronRight } from 'lucide-react-native';
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
            <Text className="text-2xl font-bold">Mini Apps</Text>
            <Text className="mt-0.5 text-sm text-muted-foreground">
              Swap, play, earn and more
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="mx-4 mt-5 overflow-hidden rounded-2xl bg-primary p-6 shadow-glow">
          <View className="items-center">
            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
              <Icon as={Sparkles} size={32} className="text-white" />
            </View>
            <Text className="mt-4 text-center text-xl font-bold text-white">
              Explore Mini Apps
            </Text>
            <Text className="mt-1.5 text-center text-sm text-white/80">
              Swap, play, earn and more!
            </Text>
          </View>
        </View>

        {/* Live Apps */}
        <View className="mt-6 px-4">
          <View className="flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-success" />
            <Text className="text-lg font-bold">Live Now</Text>
          </View>
          <Text className="mt-0.5 text-sm text-muted-foreground">
            Try these apps right now
          </Text>

          <View className="mt-4 gap-3">
            {liveApps.map((app) => (
              <TouchableOpacity
                key={app.id}
                onPress={() => router.push(app.route as any)}
                className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft active:opacity-80"
              >
                <View className={`h-12 w-12 items-center justify-center rounded-2xl ${app.color}`}>
                  <Icon as={app.icon} size={24} className="text-white" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold">{app.name}</Text>
                  <Text className="mt-0.5 text-sm text-muted-foreground">{app.description}</Text>
                </View>
                <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Coming Soon */}
        <View className="mt-6 px-4">
          <Text className="text-lg font-bold">Coming Soon</Text>
          <Text className="mt-0.5 text-sm text-muted-foreground">
            More apps in development
          </Text>

          <View className="mt-4 gap-3">
            {upcomingApps.map((app) => (
              <View
                key={app.id}
                className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 opacity-70"
              >
                <View className={`h-12 w-12 items-center justify-center rounded-2xl ${app.color}`}>
                  <Icon as={app.icon} size={24} className="text-white" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold">{app.name}</Text>
                  <Text className="mt-0.5 text-sm text-muted-foreground">{app.description}</Text>
                </View>
                <View className="rounded-full bg-yellow-100 px-3 py-1 dark:bg-yellow-500/15">
                  <Text className="text-2xs font-medium text-yellow-700 dark:text-yellow-300">
                    In Development
                  </Text>
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
