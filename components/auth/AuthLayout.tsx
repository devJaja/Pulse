import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="relative flex-1 bg-background"
    >
      {/* Decorative Monad brand shapes */}
      <View pointerEvents="none" className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-purple-200/60 dark:bg-purple-950/40" />
      <View pointerEvents="none" className="absolute -left-16 top-40 h-40 w-40 rounded-full bg-purple-100/70 dark:bg-purple-900/30" />
      <View pointerEvents="none" className="absolute right-10 top-64 h-3 w-3 rounded-full bg-gold" />
      <View pointerEvents="none" className="absolute left-12 top-[15%] h-2 w-2 rounded-full bg-brand-400/60" />

      {children}
    </KeyboardAvoidingView>
  );
}