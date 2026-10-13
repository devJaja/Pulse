import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Image, View } from 'react-native';

const sizeMap = {
  xs: { box: 'h-6 w-6', text: 'text-3xs' },
  sm: { box: 'h-9 w-9', text: 'text-xs' },
  md: { box: 'h-12 w-12', text: 'text-base' },
  lg: { box: 'h-16 w-16', text: 'text-xl' },
  xl: { box: 'h-24 w-24', text: 'text-3xl' },
  '2xl': { box: 'h-32 w-32', text: 'text-4xl' },
} as const;

type AvatarSize = keyof typeof sizeMap;

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  username?: string | null;
  size?: AvatarSize;
  className?: string;
  ring?: boolean;
}

function Avatar({ uri, name, username, size = 'md', className, ring = false }: AvatarProps) {
  const { box, text } = sizeMap[size];
  const initial =
    name?.trim()?.charAt(0)?.toUpperCase() ||
    username?.trim()?.charAt(0)?.toUpperCase() ||
    '?';

  return (
    <View
      className={cn(
        'items-center justify-center overflow-hidden rounded-full bg-accent',
        ring && 'border-2 border-card shadow-soft',
        box,
        className
      )}
    >
      {uri ? (
        <Image source={{ uri }} className={cn('h-full w-full')} resizeMode="cover" />
      ) : (
        <Text className={cn('font-bold text-primary', text)}>{initial}</Text>
      )}
    </View>
  );
}

export { Avatar };
export type { AvatarProps, AvatarSize };
