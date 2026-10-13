import { Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { PenLine } from 'lucide-react-native';

interface CreatePostButtonProps {
  onPress?: () => void;
}

export function CreatePostButton({ onPress }: CreatePostButtonProps) {
  const insets = useSafeAreaInsets();

  // Sits clear of the tab bar so it is never overlapped or pushed off-screen.
  const bottom = Math.max(insets.bottom, Platform.OS === 'ios' ? 12 : 16) + 62;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Create a new post"
      className="absolute right-4 flex-row items-center gap-2 rounded-full bg-primary px-5 shadow-glow active:opacity-90"
      style={{ bottom, height: 52 }}
    >
      <Icon as={PenLine} size={18} className="text-primary-foreground" strokeWidth={2.4} />
      <Text className="text-[14.5px] font-bold text-primary-foreground">New post</Text>
    </Pressable>
  );
}
