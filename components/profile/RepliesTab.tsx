import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { CloudOff } from 'lucide-react-native';
import { router } from 'expo-router';
import { ProfileAvatar } from './ProfileAvatar';
import { EmptyState } from '../common/EmptyState';
import { useTranslation } from 'react-i18next';

interface RepliesTabProps {
  comments: any[];
  isLoading: boolean;
}

export function RepliesTab({ comments, isLoading }: RepliesTabProps) {
  const { t } = useTranslation();
  
  if (isLoading) {
    return (
      <View className="items-center py-20">
        <ActivityIndicator size="large" color="#6e54ff" />
      </View>
    );
  }

  if (!comments || comments.length === 0) {
    return <EmptyState icon={CloudOff} message={t('profile.noCommentsYet')} />;
  }

  return (
    <View className="px-4 py-4">
      {comments.map((comment: any) => (
        <TouchableOpacity 
          key={comment.id} 
          onPress={() => router.push(`/post/${comment.post.id}`)}
          className="mb-4 rounded-2xl bg-card p-4"
        >
          <View className="flex-row items-center gap-3 mb-3">
            <ProfileAvatar 
              avatar={comment.author?.avatar}
              name={comment.author?.name}
              username={comment.author?.username}
              size="small"
            />
            <View className="flex-1">
              <Text className="font-semibold">{comment.author?.name || comment.author?.username}</Text>
              <Text className="text-xs text-muted-foreground">
                {t('profile.repliedTo')} @{comment.post?.author?.username}
              </Text>
            </View>
          </View>
          <Text className="mb-2">{comment.content}</Text>
          <View className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Text className="text-sm text-muted-foreground" numberOfLines={2}>
              {comment.post?.content}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
