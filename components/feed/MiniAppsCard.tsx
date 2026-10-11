import { ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Pressable } from 'react-native';
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
    tint: 'bg-[#E4DFFF]',
    tintActive: 'text-[#5A3FE0]',
  },
  {
    id: 'airdrop',
    name: 'Airdrop',
    icon: Gift,
    route: '/mini-apps/airdrop',
    tint: 'bg-[#E4DFFF]',
    tintActive: 'text-[#5A3FE0]',
  },
  {
    id: 'dice',
    name: 'Dice',
    icon: Dice5,
    route: '/mini-apps/dice',
    tint: 'bg-[#F1EEFF]',
    tintActive: 'text-[#6E54FF]',
  },
  {
    id: 'coinflip',
    name: 'Coin Flip',
    icon: Coins,
    route: '/mini-apps/coinflip',
    tint: 'bg-[#FBE9F3]',
    tintActive: 'text-[#A0055D]',
  },
  {
    id: 'spin',
    name: 'Spin',
    icon: RotateCw,
    route: '/mini-apps/spin',
    tint: 'bg-[#F1EEFF]',
    tintActive: 'text-[#6E54FF]',
  },
  {
    id: 'food',
    name: 'Food',
    icon: UtensilsCrossed,
    route: '/mini-apps/food',
    tint: 'bg-[#FBE9F3]',
    tintActive: 'text-[#A0055D]',
  },
];

export function MiniAppsCard() {
  return (
    <View className="mt-5">
      <View className="flex-row items-center justify-between px-4">
        <View className="flex-row items-center gap-2">
          <Icon as={Sparkles} size={14} className="text-gold" />
          <Text className="text-[15px] font-semibold text-foreground">Mini Apps</Text>
        </View>
        <Pressable
          onPress={() => router.push('/mini-apps')}
          accessibilityRole="button"
          accessibilityLabel="See all mini apps"
          hitSlop={8}
          className="flex-row items-center gap-0.5 active:opacity-60"
        >
          <Text className="text-[13px] font-semibold text-brand-700 dark:text-gold">
            See all
          </Text>
          <Icon as={ChevronRight} size={14} className="text-brand-700 dark:text-gold" />
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
            className="w-[86px] items-center rounded-2xl border border-border bg-card px-2 py-3.5 active:opacity-70"
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
          className="w-[86px] items-center justify-center rounded-2xl border border-dashed border-border py-3.5 active:opacity-70"
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
