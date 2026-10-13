import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

interface BadgeProps {
  count?: number;
  variant?: 'primary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md';
  showZero?: boolean;
}

const variantStyles = {
  primary: 'bg-primary',
  success: 'bg-success',
  danger: 'bg-destructive',
  warning: 'bg-yellow-500',
};

const sizeStyles = {
  sm: { container: 'h-4 min-w-4 px-1', text: 'text-3xs' },
  md: { container: 'h-5 min-w-5 px-1.5', text: 'text-3xs' },
};

export function Badge({ count = 0, variant = 'danger', size = 'sm', showZero = false }: BadgeProps) {
  if (count === 0 && !showZero) return null;

  const { container, text } = sizeStyles[size];
  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <View
      className={cn(
        'items-center justify-center rounded-full border border-card',
        container,
        variantStyles[variant]
      )}
    >
      <Text className={cn('font-bold leading-none text-white', text)}>{displayCount}</Text>
    </View>
  );
}
