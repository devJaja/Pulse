import { Platform, Pressable, StyleSheet } from 'react-native';
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
      className="active:opacity-90"
      style={[styles.button, { bottom }]}
    >
      <Icon as={PenLine} size={18} className="text-[#6e54ff]" strokeWidth={2.4} />
      <Text className="text-[14.5px] font-bold text-[#6e54ff]">New post</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    height: 52,
    borderRadius: 999,
    backgroundColor: '#6e54ff',
    shadowColor: '#6e54ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 10,
  },
});
