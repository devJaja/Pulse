import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Text, View, type ViewProps } from 'react-native';

const badgeVariants = cva(
  'flex-row items-center gap-1 rounded-full border px-2.5 py-1',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary',
        secondary: 'border-transparent bg-secondary',
        outline: 'border-border bg-transparent',
        success: 'border-transparent bg-success/15',
        destructive: 'border-transparent bg-destructive/15',
        muted: 'border-transparent bg-muted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const badgeTextVariants = cva('text-3xs font-semibold uppercase tracking-wide', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      outline: 'text-foreground',
      success: 'text-success',
      destructive: 'text-destructive',
      muted: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type BadgeProps = ViewProps &
  VariantProps<typeof badgeVariants> & {
    className?: string;
    labelClassName?: string;
    label?: string;
  };

function Badge({ className, variant, labelClassName, label, children, ...props }: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)} {...props}>
      {label ? (
        <Text className={cn(badgeTextVariants({ variant }), labelClassName)}>{label}</Text>
      ) : typeof children === 'string' ? (
        <Text className={cn(badgeTextVariants({ variant }), labelClassName)}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

export { Badge, badgeVariants, badgeTextVariants };
