import { Modal, View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Share, Edit, Settings } from 'lucide-react-native';
import { router } from 'expo-router';

interface ProfileMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileMenu({ visible, onClose }: ProfileMenuProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 justify-end bg-black/50"
      >
        <View className="rounded-t-3xl border-t border-border bg-card pb-8 shadow-elevated">
          <View className="items-center py-3">
            <View className="h-1 w-12 rounded-full bg-border" />
          </View>

          <TouchableOpacity
            onPress={() => {
              onClose();
            }}
            className="flex-row items-center gap-4 px-6 py-4 active:bg-accent"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <Icon as={Share} size={20} className="text-foreground" />
            </View>
            <Text className="text-base font-semibold text-foreground">Share Profile</Text>
          </TouchableOpacity>

          <View className="mx-6 h-px bg-border" />

          <TouchableOpacity
            onPress={() => {
              onClose();
              router.push('/profile/edit');
            }}
            className="flex-row items-center gap-4 px-6 py-4 active:bg-accent"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <Icon as={Edit} size={20} className="text-foreground" />
            </View>
            <Text className="text-base font-semibold text-foreground">Edit Profile</Text>
          </TouchableOpacity>

          <View className="mx-6 h-px bg-border" />

          <TouchableOpacity
            onPress={() => {
              onClose();
              router.push('/settings');
            }}
            className="flex-row items-center gap-4 px-6 py-4 active:bg-accent"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <Icon as={Settings} size={20} className="text-foreground" />
            </View>
            <Text className="text-base font-semibold text-foreground">Settings</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
