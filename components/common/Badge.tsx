import { View } from 'react-native';
import { Text } from '@/components/ui/text';

interface BadgeProps {
  count?: number;
  variant?: 'primary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md';
  showZero?: boolean;
}

const variantStyles = {
  primary: 'bg-[#0e100f]',
  success: 'bg-success',
  danger: 'bg-red-600',
  warning: 'bg-yellow-600',
};

const sizeStyles = {
  sm: { container: 'h-4 min-w-4 px-1', text: 'text-xs' },
  md: { container: 'h-5 min-w-5 px-1.5', text: 'text-xs' },
};

export function Badge({ count = 0, variant = 'danger', size = 'sm', showZero = false }: BadgeProps) {
  if (count === 0 && !showZero) return null;

  const { container, text } = sizeStyles[size];
  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <View className={`${container} ${variantStyles[variant]} items-center justify-center rounded-full`}>
      <Text className={`${text} font-bold text-white`}>{displayCount}</Text>
    </View>
  );
}
