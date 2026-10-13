import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { FeedHeader, FeedContent, FeedImages } from '@/components/feed';
import type { Post } from '@/types';

interface PostDetailCardProps {
  post: Post;
}

export function PostDetailCard({ post }: PostDetailCardProps) {
  return (
    <View className="mx-4 mt-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
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

      <View className="mt-4 flex-row items-center gap-6 border-t border-border pt-4">
        <View>
          <Text className="text-2xl font-bold text-foreground">{post.likesCount || 0}</Text>
          <Text className="text-[12.5px] text-muted-foreground">Likes</Text>
        </View>
        <View>
          <Text className="text-2xl font-bold text-foreground">{post.commentsCount || 0}</Text>
          <Text className="text-[12.5px] text-muted-foreground">Comments</Text>
        </View>
        {post.isTokenized && (
          <View>
            <Text className="text-2xl font-bold text-foreground">{post.tokenSupply}</Text>
            <Text className="text-[12.5px] text-muted-foreground">Tokens</Text>
          </View>
        )}
      </View>
    </View>
  );
}
