import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Heart, MessageCircle, Share2, DollarSign, Coins } from 'lucide-react-native';

interface PostActionsProps {
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
  isTokenized?: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare?: () => void;
  onTip?: () => void;
  onBuyToken?: () => void;
}

export function PostActions({
  isLiked,
  likesCount,
  commentsCount,
  isTokenized,
  onLike,
  onComment,
  onShare,
  onTip,
  onBuyToken,
}: PostActionsProps) {
  return (
    <View className="mx-4 mt-3 flex-row items-center justify-around rounded-2xl border border-border bg-card px-2 py-2 shadow-soft">
      <TouchableOpacity
        onPress={onLike}
        accessibilityRole="button"
        accessibilityLabel={isLiked ? 'Unlike post' : 'Like post'}
        className={`min-h-[40px] flex-row items-center gap-1.5 rounded-full px-3 active:bg-secondary ${
          isLiked ? 'bg-secondary' : ''
        }`}
      >
        <Icon
          as={Heart}
          size={22}
          className={isLiked ? 'text-red-500' : 'text-muted-foreground'}
          fill={isLiked ? '#FF3F00' : 'none'}
        />
        <Text
          className={`text-[13px] font-semibold ${
            isLiked ? 'text-red-500' : 'text-muted-foreground'
          }`}
        >
          {likesCount}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onComment}
        accessibilityRole="button"
        accessibilityLabel="View comments"
        className="min-h-[40px] flex-row items-center gap-1.5 rounded-full px-3 active:bg-secondary"
      >
        <Icon as={MessageCircle} size={22} className="text-muted-foreground" />
        <Text className="text-[13px] font-semibold text-muted-foreground">{commentsCount}</Text>
      </TouchableOpacity>

      {onShare && (
        <TouchableOpacity
          onPress={onShare}
          accessibilityRole="button"
          accessibilityLabel="Share post"
          className="min-h-[40px] w-10 items-center justify-center rounded-full active:bg-secondary"
        >
          <Icon as={Share2} size={22} className="text-muted-foreground" />
        </TouchableOpacity>
      )}

      {onTip && (
        <TouchableOpacity
          onPress={onTip}
          accessibilityRole="button"
          accessibilityLabel="Tip author"
          className="min-h-[40px] w-10 items-center justify-center rounded-full bg-success/10 active:bg-success/20"
        >
          <Icon as={DollarSign} size={20} className="text-success" />
        </TouchableOpacity>
      )}

      {isTokenized && onBuyToken && (
        <TouchableOpacity
          onPress={onBuyToken}
          accessibilityRole="button"
          accessibilityLabel="Buy tokens"
          className="min-h-[40px] w-10 items-center justify-center rounded-full bg-accent active:bg-accent/70"
        >
          <Icon as={Coins} size={20} className="text-primary dark:text-brand-300" />
        </TouchableOpacity>
      )}
    </View>
  );
}
