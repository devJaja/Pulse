import { View, ActivityIndicator } from 'react-native';
import { CloudOff } from 'lucide-react-native';
import { PostCard } from './PostCard';
import { EmptyState } from '../common/EmptyState';
import type { Post } from '@/types';

interface LikesTabProps {
  posts: Post[];
  isLoading: boolean;
}

export function LikesTab({ posts, isLoading }: LikesTabProps) {
  if (isLoading) {
    return (
      <View className="items-center py-20">
        <ActivityIndicator size="large" color="#6e54ff" />
      </View>
    );
  }

  if (!posts || posts.length === 0) {
    return <EmptyState icon={CloudOff} message="No liked posts yet" />;
  }

  return (
    <View className="px-4 py-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </View>
  );
}
