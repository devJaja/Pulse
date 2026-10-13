import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  subtitle?: string;
}

export function EmptyState({ icon, message, subtitle }: EmptyStateProps) {
  return (
    <View className="items-center px-8 py-20">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-accent">
        <Icon as={icon} size={34} className="text-primary" strokeWidth={1.8} />
      </View>
      <Text className="mt-5 text-base font-semibold text-foreground">{message}</Text>
      {subtitle && (
        <Text className="mt-1.5 max-w-xs text-center text-sm leading-5 text-muted-foreground">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
