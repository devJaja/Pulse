import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Heart, MessageCircle, Share2, DollarSign } from 'lucide-react-native';

interface FeedActionsProps {
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
  onLike: () => void;
  onComment: () => void;
  onShare?: () => void;
  onTip?: () => void;
  showTip?: boolean;
}

export function FeedActions({
  isLiked,
  likesCount,
  commentsCount,
  onLike,
  onComment,
  onShare,
  onTip,
  showTip = false,
}: FeedActionsProps) {
  const pill = 'min-h-[36px] flex-row items-center gap-1.5 rounded-full px-2.5 active:bg-secondary';

  return (
    <View className="flex-row items-center gap-1 border-t border-border pt-3">
      <TouchableOpacity
        onPress={onLike}
        accessibilityRole="button"
        accessibilityLabel={isLiked ? 'Unlike post' : 'Like post'}
        className={`${pill} ${isLiked ? 'bg-secondary' : ''}`}
      >
        <Icon
          as={Heart}
          size={18}
          className={isLiked ? 'text-red-500' : 'text-muted-foreground'}
          fill={isLiked ? '#FF3F00' : 'none'}
        />
        <Text
          className={`text-[13px] font-medium ${
            isLiked ? 'text-red-500' : 'text-muted-foreground'
          }`}
        >
          {likesCount || 0}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onComment}
        accessibilityRole="button"
        accessibilityLabel="View comments"
        className={pill}
      >
        <Icon as={MessageCircle} size={18} className="text-muted-foreground" />
        <Text className="text-[13px] font-medium text-muted-foreground">
          {commentsCount || 0}
        </Text>
      </TouchableOpacity>

      {onShare && (
        <TouchableOpacity
          onPress={onShare}
          accessibilityRole="button"
          accessibilityLabel="Share post"
          className={pill}
        >
          <Icon as={Share2} size={18} className="text-muted-foreground" />
        </TouchableOpacity>
      )}

      {showTip && onTip && (
        <TouchableOpacity
          onPress={onTip}
          accessibilityRole="button"
          accessibilityLabel="Tip author"
          className="ml-auto min-h-[36px] flex-row items-center gap-1.5 rounded-full bg-success/10 px-3 active:bg-success/20"
        >
          <Icon as={DollarSign} size={16} className="text-success" />
          <Text className="text-[13px] font-semibold text-success">Tip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
