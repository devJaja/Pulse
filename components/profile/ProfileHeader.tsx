import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Settings, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

interface ProfileHeaderProps {
  isOwnProfile: boolean;
  onSettingsPress: () => void;
}

export function ProfileHeader({ isOwnProfile, onSettingsPress }: ProfileHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center justify-between px-4 pt-14 pb-2">
      {!isOwnProfile ? (
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-soft active:bg-secondary"
        >
          <Icon as={ArrowLeft} size={20} className="text-foreground" />
        </TouchableOpacity>
      ) : (
        <Text className="text-2xl font-bold tracking-tight text-foreground">
          {t('profile.profile')}
        </Text>
      )}
      {isOwnProfile && (
        <TouchableOpacity
          onPress={onSettingsPress}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-soft active:bg-secondary"
        >
          <Icon as={Settings} size={20} className="text-foreground" />
        </TouchableOpacity>
      )}
    </View>
  );
}
