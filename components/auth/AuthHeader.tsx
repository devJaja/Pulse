import { View } from 'react-native';
import { Text } from '@/components/ui/text';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <View className="mb-8">
      <View className="mb-3 flex-row items-center gap-1.5">
        <View className="h-2 w-2 rounded-full bg-gold" />
        <Text className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-purple-300">
          Pulse
        </Text>
      </View>
      <Text className="mb-2 text-[28px] font-bold leading-9 text-foreground">{title}</Text>
      <Text className="text-base leading-6 text-muted-foreground">{subtitle}</Text>
    </View>
  );
}