import { cn } from '@/lib/utils';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';

function Card({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn(
        'rounded-2xl border border-border bg-card shadow-soft',
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cn('gap-1 p-5 pb-3', className)} {...props} />;
}

function CardTitle({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cn('', className)} {...props} />;
}

function CardContent({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cn('px-5 pb-5', className)} {...props} />;
}

function CardFooter({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View className={cn('flex-row items-center gap-3 border-t border-border px-5 py-4', className)} {...props} />
  );
}

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
