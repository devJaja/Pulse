import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { View, ActivityIndicator } from 'react-native';

export default function Screen() {
  const { isAuthenticated, isLoadingUser } = useAuth();
  const { isFirstTimeUser, isLoading: isOnboardingLoading } = useOnboarding();

  if (isLoadingUser || isOnboardingLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#6e54ff" />
      </View>
    );
  }

  // First-time users go to onboarding
  if (isFirstTimeUser) {
    return <Redirect href="/onboarding" />;
  }

  // Authenticated users go to feed
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/feed" />;
  }

  // Non-authenticated users go to sign in
  return <Redirect href="/auth/signin" />;
}
