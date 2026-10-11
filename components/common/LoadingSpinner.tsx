import { View, ActivityIndicator } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = 'large', color = '#6e54ff', fullScreen = false }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }

  return (
    <View className="items-center py-20">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}
