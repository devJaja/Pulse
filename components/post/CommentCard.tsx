import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { Heart, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

interface CommentCardProps {
  comment: {
    id: string;
    content: string;
    author: {
      avatar?: string;
      name?: string;
      username: string;
    };
    createdAt: string;
    likesCount: number;
    repliesCount?: number;
    isLiked: boolean;
  };
  onLike: () => void;
  onReply?: () => void;
  onAuthorPress?: () => void;
  onViewReplies?: () => void;
  showReplies?: boolean;
  replies?: React.ReactNode;
  level?: number;
}

export function CommentCard({
  comment,
  onLike,
  onReply,
  onAuthorPress,
  onViewReplies,
  showReplies = false,
  replies,
  level = 0,
}: CommentCardProps) {
  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return '';
    }
  };

  const hasReplies = (comment.repliesCount || 0) > 0;
  const isNested = level > 0;

  return (
    <View className={`${isNested ? 'ml-12' : ''} border-b border-border bg-card`}>
      <View className="p-4">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onAuthorPress}
            accessibilityRole="button"
            accessibilityLabel={`View ${comment.author.name || comment.author.username}'s profile`}
            className="active:opacity-70"
          >
            <Avatar
              uri={comment.author.avatar}
              name={comment.author.name}
              username={comment.author.username}
              size="sm"
              ring
            />
          </TouchableOpacity>

          <View className="flex-1">
            <View className="flex-row flex-wrap items-center gap-x-1.5">
              <TouchableOpacity
                onPress={onAuthorPress}
                accessibilityRole="button"
                className="active:opacity-70"
              >
                <Text className="text-[14px] font-semibold text-foreground">
                  {comment.author.name || comment.author.username}
                </Text>
              </TouchableOpacity>
              <Text className="text-[12.5px] text-muted-foreground">
                @{comment.author.username}
              </Text>
              <Text className="text-[12.5px] text-muted-foreground">
                · {formatTime(comment.createdAt)}
              </Text>
            </View>

            <Text className="mt-1 text-[14.5px] leading-[21px] text-foreground">
              {comment.content}
            </Text>

            <View className="mt-2.5 flex-row items-center gap-1">
              <TouchableOpacity
                onPress={onLike}
                accessibilityRole="button"
                accessibilityLabel={comment.isLiked ? 'Unlike comment' : 'Like comment'}
                className={`flex-row items-center gap-1.5 rounded-full px-2 py-1 active:bg-secondary ${
                  comment.isLiked ? 'bg-secondary' : ''
                }`}
              >
                <Icon
                  as={Heart}
                  size={15}
                  className={comment.isLiked ? 'text-red-500' : 'text-muted-foreground'}
                  fill={comment.isLiked ? '#FF3F00' : 'none'}
                />
                <Text
                  className={`text-[12.5px] font-medium ${
                    comment.isLiked ? 'text-red-500' : 'text-muted-foreground'
                  }`}
                >
                  {comment.likesCount || 0}
                </Text>
              </TouchableOpacity>

              {onReply && (
                <TouchableOpacity
                  onPress={onReply}
                  accessibilityRole="button"
                  accessibilityLabel="Reply to comment"
                  className="flex-row items-center gap-1.5 rounded-full px-2 py-1 active:bg-secondary"
                >
                  <Icon as={MessageCircle} size={15} className="text-muted-foreground" />
                  <Text className="text-[12.5px] font-medium text-muted-foreground">Reply</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* View Replies Button */}
      {hasReplies && onViewReplies && (
        <TouchableOpacity
          onPress={onViewReplies}
          accessibilityRole="button"
          accessibilityLabel={showReplies ? 'Hide replies' : 'Show replies'}
          className="flex-row items-center gap-2 px-4 pb-3 active:opacity-70"
        >
          <View className="h-px flex-1 bg-border" />
          <View className="flex-row items-center gap-1">
            <Icon
              as={showReplies ? ChevronUp : ChevronDown}
              size={15}
              className="text-primary dark:text-brand-300"
            />
            <Text className="text-[12.5px] font-semibold text-primary dark:text-brand-300">
              {showReplies ? 'Hide' : 'View'} {comment.repliesCount}{' '}
              {comment.repliesCount === 1 ? 'reply' : 'replies'}
            </Text>
          </View>
          <View className="h-px flex-1 bg-border" />
        </TouchableOpacity>
      )}

      {/* Nested Replies */}
      {showReplies && replies}
    </View>
  );
}
