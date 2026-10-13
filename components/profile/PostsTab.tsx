import { View } from 'react-native';
import { CloudOff } from 'lucide-react-native';
import { PostCard } from './PostCard';
import { EmptyState, LoadingSpinner } from '../common';
import type { Post } from '@/types';

interface PostsTabProps {
  posts: Post[];
  isLoading: boolean;
}

export function PostsTab({ posts, isLoading }: PostsTabProps) {
  if (isLoading) {
    return <LoadingSpinner />;
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
