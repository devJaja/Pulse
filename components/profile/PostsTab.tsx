import { View, ActivityIndicator } from 'react-native';
import { CloudOff } from 'lucide-react-native';
import { PostCard } from './PostCard';
import { EmptyState } from '../common/EmptyState';
import type { Post } from '@/types';

interface PostsTabProps {
  posts: Post[];
  isLoading: boolean;
}

export function PostsTab({ posts, isLoading }: PostsTabProps) {
  if (isLoading) {
    return (
      <View className="items-center py-20">
        <ActivityIndicator size="large" color="#6e54ff" />
      </View>
    );
  }

  if (!posts || posts.length === 0) {
    return <EmptyState icon={CloudOff} message="No posts yet" />;
  }

  return (
    <View className="px-4 py-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </View>
  );
}
