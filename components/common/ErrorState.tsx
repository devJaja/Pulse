import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <View className="items-center px-8 py-20">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-destructive/15">
        <Icon as={AlertCircle} size={36} className="text-destructive" strokeWidth={1.8} />
      </View>
      <Text className="mt-5 max-w-xs text-center text-sm leading-5 text-muted-foreground">
        {message}
      </Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          className="mt-5 flex-row items-center gap-2 rounded-xl bg-primary px-6 py-3 active:bg-primary/90"
        >
          <Icon as={RefreshCw} size={16} className="text-primary-foreground" />
          <Text className="text-sm font-semibold text-primary-foreground">Try Again</Text>
        </Pressable>
      )}
    </View>
  );
}
