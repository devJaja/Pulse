import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { CloudOff } from 'lucide-react-native';
import { router } from 'expo-router';
import { ProfileAvatar } from './ProfileAvatar';
import { EmptyState, LoadingSpinner } from '../common';
import { useTranslation } from 'react-i18next';

interface RepliesTabProps {
  comments: any[];
  isLoading: boolean;
}

export function RepliesTab({ comments, isLoading }: RepliesTabProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return <LoadingSpinner />;
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
          className="mb-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
        >
          <View className="flex-row items-center gap-3">
            <ProfileAvatar
              avatar={comment.author?.avatar}
              name={comment.author?.name}
              username={comment.author?.username}
              size="small"
            />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground">
                {comment.author?.name || comment.author?.username}
              </Text>
              <Text className="text-2xs text-muted-foreground">
                {t('profile.repliedTo')} @{comment.post?.author?.username}
              </Text>
            </View>
          </View>
          <Text className="mt-3 text-sm leading-5 text-foreground">{comment.content}</Text>
          <View className="mt-3 rounded-xl border border-border bg-secondary p-3">
            <Text className="text-sm leading-5 text-muted-foreground" numberOfLines={2}>
              {comment.post?.content}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
