import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { Zap, Sparkles, ShieldCheck } from 'lucide-react-native';
import * as React from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { useThemeStore, resolveTheme } from '@/store/useThemeStore';
import { useOnboarding } from '@/hooks/useOnboarding';

const ONBOARDING_DATA = [
  {
    icon: Zap,
    title: 'Lightning Fast\nPayments',
    description: 'Send and receive money in seconds\nwith Monad\'s speed',
  },
  {
    icon: Sparkles,
    title: 'Welcome to\nPulse',
    description: 'Your all-in-one super app for\npayments, social and more',
  },
  {
    icon: ShieldCheck,
    title: 'Your Wallet,\nYour Keys',
    description: 'Secure, self-custodial wallet created\njust for you',
  },
];

export default function OnboardingScreen() {
  const scrollX = useSharedValue(0);
  const { theme } = useThemeStore();
  const { completeOnboarding } = useOnboarding();
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleCreateAccount = async () => {
    await completeOnboarding();
    router.push('/auth/email');
  };

  const handleSignIn = async () => {
    await completeOnboarding();
    router.push('/auth/signin');
  };

  return (
    <View className="flex-1 bg-background">
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 200 }}
      >
        {ONBOARDING_DATA.map((item, index) => (
          <OnboardingSlide key={index} {...item} theme={resolveTheme(theme)} screenWidth={SCREEN_WIDTH} />
        ))}
      </Animated.ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-6 pb-12 pt-6">
        <View className="mb-8 flex-row justify-center gap-2">
          {ONBOARDING_DATA.map((_, index) => (
            <Dot key={index} index={index} scrollX={scrollX} screenWidth={SCREEN_WIDTH} />
          ))}
        </View>

        <Button className="mb-3 h-14 rounded-2xl bg-primary shadow-soft active:bg-primary/90" onPress={handleCreateAccount}>
          <Text className="text-base font-medium text-primary-foreground">Create Account</Text>
        </Button>

        <Button variant="ghost" className="h-14 rounded-2xl" onPress={handleSignIn}>
          <Text className="text-base font-medium text-primary">Sign in</Text>
        </Button>
      </View>
    </View>
  );
}

function OnboardingSlide({
  icon: Icon,
  title,
  description,
  theme,
  screenWidth,
}: {
  icon: typeof Zap;
  title: string;
  description: string;
  theme: 'light' | 'dark';
  screenWidth: number;
}) {
  return (
    <View style={{ width: screenWidth }} className="items-center justify-center px-8 pt-24">
      <View className="mb-12 h-24 w-24 items-center justify-center rounded-3xl border border-border bg-card shadow-card">
        <Icon size={44} color="#6e54ff" strokeWidth={2} />
      </View>

      <View className="mb-5 flex-row items-center gap-1.5">
        <View className="h-2 w-2 rounded-full bg-primary" />
        <Text className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          Pulse
        </Text>
      </View>

      <Text className="mb-4 text-center text-3xl font-bold leading-tight text-foreground">
        {title}
      </Text>

      <Text className="text-center text-base leading-relaxed text-muted-foreground">{description}</Text>
    </View>
  );
}

function Dot({ index, scrollX, screenWidth }: { index: number; scrollX: SharedValue<number>; screenWidth: number }) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * screenWidth,
      index * screenWidth,
      (index + 1) * screenWidth,
    ];

    const width = interpolate(scrollX.value, inputRange, [8, 24, 8]);
    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3]);

    return {
      width,
      opacity,
    };
  });

  return (
    <Animated.View
      style={animatedStyle}
      className="h-2 rounded-full bg-primary"
    />
  );
}
