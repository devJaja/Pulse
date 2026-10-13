import { cn } from '@/lib/utils';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';

function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: ViewProps & {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}) {
  return (
    <View
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
      {...props}
    />
  );
}

export { Separator };
