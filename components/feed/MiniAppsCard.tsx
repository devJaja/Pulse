import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import {
  ArrowRight,
  ChevronRight,
  Coins,
  Dice5,
  Gift,
  RotateCw,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react-native';
import { router } from 'expo-router';

interface MiniApp {
  id: string;
  name: string;
  icon: LucideIcon;
  route: string;
  tint: string;
  tintActive: string;
}

const MINI_APPS: MiniApp[] = [
  {
    id: 'swap',
    name: 'Swap',
    icon: Coins,
    route: '/mini-apps/swap',
    tint: 'bg-[#E4DFFF] dark:bg-[#1D1554]',
    tintActive: 'text-[#5A3FE0] dark:text-brand-300',
  },
  {
    id: 'airdrop',
    name: 'Airdrop',
    icon: Gift,
    route: '/mini-apps/airdrop',
    tint: 'bg-[#E4DFFF] dark:bg-[#1D1554]',
    tintActive: 'text-[#5A3FE0] dark:text-brand-300',
  },
  {
    id: 'dice',
    name: 'Dice',
    icon: Dice5,
    route: '/mini-apps/dice',
    tint: 'bg-[#F1EEFF] dark:bg-[#1D1554]',
    tintActive: 'text-[#6E54FF] dark:text-brand-300',
  },
  {
    id: 'coinflip',
    name: 'Coin Flip',
    icon: Coins,
    route: '/mini-apps/coinflip',
    tint: 'bg-[#FBE9F3] dark:bg-[#3A0F2A]',
    tintActive: 'text-[#A0055D] dark:text-pink-300',
  },
  {
    id: 'spin',
    name: 'Spin',
    icon: RotateCw,
    route: '/mini-apps/spin',
    tint: 'bg-[#F1EEFF] dark:bg-[#1D1554]',
    tintActive: 'text-[#6E54FF] dark:text-brand-300',
  },
  {
    id: 'food',
    name: 'Food',
    icon: UtensilsCrossed,
    route: '/mini-apps/food',
    tint: 'bg-[#FBE9F3] dark:bg-[#3A0F2A]',
    tintActive: 'text-[#A0055D] dark:text-pink-300',
  },
];

export function MiniAppsCard() {
  return (
    <View className="mt-5">
      <View className="flex-row items-center justify-between px-4">
        <View className="flex-row items-center gap-2">
          <View className="h-6 w-6 items-center justify-center rounded-lg bg-accent">
            <Icon as={Sparkles} size={13} className="text-primary dark:text-brand-300" />
          </View>
          <Text className="text-[15px] font-semibold text-foreground">Mini Apps</Text>
        </View>
        <Pressable
          onPress={() => router.push('/mini-apps')}
          accessibilityRole="button"
          accessibilityLabel="See all mini apps"
          hitSlop={8}
          className="flex-row items-center gap-0.5 active:opacity-60"
        >
          <Text className="text-[13px] font-semibold text-primary dark:text-brand-300">
            See all
          </Text>
          <Icon as={ChevronRight} size={14} className="text-primary dark:text-brand-300" />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingTop: 12 }}
      >
        {MINI_APPS.map((app) => (
          <Pressable
            key={app.id}
            onPress={() => router.push(app.route as never)}
            accessibilityRole="button"
            accessibilityLabel={app.name}
            className="w-[86px] items-center rounded-2xl border border-border bg-card px-2 py-3.5 shadow-soft active:bg-secondary dark:active:bg-secondary/80"
          >
            <View className={`h-10 w-10 items-center justify-center rounded-xl ${app.tint}`}>
              <Icon as={app.icon} size={19} className={app.tintActive} />
            </View>
            <Text
              numberOfLines={1}
              className="mt-2 text-[11.5px] font-medium text-foreground"
            >
              {app.name}
            </Text>
          </Pressable>
        ))}

        <Pressable
          onPress={() => router.push('/mini-apps')}
          accessibilityRole="button"
          accessibilityLabel="Browse all mini apps"
          className="w-[86px] items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 py-3.5 active:bg-secondary dark:active:bg-secondary/80"
        >
          <Icon as={ArrowRight} size={18} className="text-muted-foreground" />
          <Text
            numberOfLines={1}
            className="mt-2 text-[11.5px] font-medium text-muted-foreground"
          >
            Browse
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
