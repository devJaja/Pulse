import { View, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { router } from 'expo-router';
import { Heart, MessageCircle, Coins } from 'lucide-react-native';
import { ProfileAvatar } from './ProfileAvatar';
import type { Post } from '@/types';
import { useTranslation } from 'react-i18next';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/post/${post.id}`)}
      className="mb-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
    >
      <View className="flex-row items-center gap-3">
        <ProfileAvatar
          avatar={post.author?.avatar}
          name={post.author?.name}
          username={post.author?.username}
          size="small"
        />
        <View className="flex-1">
          <Text className="text-sm font-semibold text-foreground">
            {post.author?.name || post.author?.username}
          </Text>
          <Text className="text-2xs text-muted-foreground">
            @{post.author?.username} · {new Date(post.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <Text className="mt-3 text-sm leading-5 text-foreground">{post.content}</Text>

      {post.images && post.images.length > 0 && (
        <View className="mt-3 flex-row flex-wrap gap-2">
          {post.images.slice(0, 4).map((img, idx) => (
            <Image
              key={idx}
              source={{ uri: img }}
              className={`rounded-xl ${
                post.images.length === 1
                  ? 'h-64 w-full'
                  : post.images.length === 2
                  ? 'h-48 w-[48%]'
                  : 'h-32 w-[48%]'
              }`}
              resizeMode="cover"
            />
          ))}
        </View>
      )}

      <View className="mt-3 flex-row items-center gap-5">
        <View className="flex-row items-center gap-1.5">
          <Icon as={Heart} size={15} className="text-muted-foreground" />
          <Text className="text-2xs text-muted-foreground">
            {post.likesCount || 0} {t('profile.likesCount')}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Icon as={MessageCircle} size={15} className="text-muted-foreground" />
          <Text className="text-2xs text-muted-foreground">
            {post.commentsCount || 0} {t('profile.commentsCount')}
          </Text>
        </View>
        {post.isTokenized && (
          <View className="ml-auto flex-row items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-1">
            <Icon as={Coins} size={12} className="text-primary" />
            <Text className="text-3xs font-semibold uppercase tracking-wide text-primary">
              {t('profile.tokenized')}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
