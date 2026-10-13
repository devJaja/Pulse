import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { FeedHeader } from './FeedHeader';
import { FeedContent } from './FeedContent';
import { FeedImages } from './FeedImages';
import { FeedStats } from './FeedStats';
import type { Post } from '@/types';

interface FeedCardProps {
  post: Post;
  onPress?: () => void;
  showActions?: boolean;
}

export function FeedCard({ post, onPress, showActions = false }: FeedCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/post/${post.id}`);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Post by ${post.author?.name || post.author?.username || ''}`}
      className="mb-4 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-soft active:bg-secondary/40 dark:active:bg-secondary/30"
      activeOpacity={0.98}
    >
      <FeedHeader
        author={{
          avatar: post.author?.avatar,
          name: post.author?.name,
          username: post.author?.username || '',
        }}
        createdAt={post.createdAt}
      />
      <FeedContent content={post.content} />
      <FeedImages images={post.images || []} />
      <FeedStats
        likesCount={post.likesCount || 0}
        commentsCount={post.commentsCount || 0}
        isTokenized={post.isTokenized}
      />
    </TouchableOpacity>
  );
}
