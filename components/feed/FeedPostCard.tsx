import { Image, Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import {
  Coins,
  Gift,
  Heart,
  MessageCircle,
  User,
  type LucideIcon,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import type { Post } from '@/types';
import { useTranslation } from 'react-i18next';

interface FeedPostCardProps {
  post: Post;
  onLike: (postId: string, isLiked: boolean) => void;
  onTip: (post: Post) => void;
  onBuyToken: (post: Post) => void;
  onNavigateToProfile: (username: string) => void;
}

interface ActionProps {
  icon: LucideIcon;
  value?: number;
  active?: boolean;
  activeClassName?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityLabel: string;
}

function PostAction({
  icon,
  value,
  active,
  activeClassName,
  onPress,
  onLongPress,
  accessibilityLabel,
}: ActionProps) {
  const tint = active ? activeClassName : 'text-muted-foreground';

  const body = (
    <View
      className={`min-h-[36px] flex-row items-center gap-1.5 rounded-full px-2.5 ${
        active ? 'bg-secondary' : ''
      }`}
    >
      <Icon as={icon} size={18} className={tint} />
      {value !== undefined && (
        <Text className={`text-[13px] font-medium ${tint}`}>{value}</Text>
      )}
    </View>
  );

  if (!onPress) {
    return <View accessibilityLabel={accessibilityLabel}>{body}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: !!active }}
      hitSlop={6}
      className="active:opacity-60"
    >
      {body}
    </Pressable>
  );
}

export function FeedPostCard({
  post,
  onLike,
  onTip,
  onBuyToken,
  onNavigateToProfile,
}: FeedPostCardProps) {
  const { t } = useTranslation();

  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: false }).replace(
        'about ',
        ''
      );
    } catch {
      return '';
    }
  };

  const goToProfile = () => onNavigateToProfile(post.author.username);
  const imageCount = post.images?.length ?? 0;

  return (
    <Pressable
      onPress={() => router.push(`/post/${post.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Post by ${post.author.name || post.author.username}`}
      className="mx-4 mb-3 overflow-hidden rounded-3xl border border-border bg-card active:bg-secondary/40"
    >
      {/* Author */}
      <View className="flex-row items-center gap-3 px-4 pt-4">
        <Pressable onPress={goToProfile} hitSlop={6} accessibilityRole="button">
          {post.author.avatar ? (
            <Image
              source={{ uri: post.author.avatar }}
              className="h-10 w-10 rounded-full bg-secondary"
            />
          ) : (
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E4DFFF] dark:bg-[#1D1554]">
              <Icon
                as={User}
                size={19}
                className="text-[#5A3FE0] dark:text-[#b8b4fe]"
              />
            </View>
          )}
        </Pressable>

        <Pressable onPress={goToProfile} className="flex-1" accessibilityRole="button">
          <Text numberOfLines={1} className="text-[14.5px] font-semibold text-foreground">
            {post.author.name || post.author.username}
          </Text>
          <Text numberOfLines={1} className="text-[12.5px] text-muted-foreground">
            @{post.author.username} · {formatTime(post.createdAt)}
          </Text>
        </Pressable>

        {post.isTokenized && (
          <View className="flex-row items-center gap-1 rounded-full bg-[#F1EEFF] px-2 py-1 dark:bg-[#1D1554]">
            <Icon as={Coins} size={11} className="text-[#6E54FF] dark:text-gold" />
            <Text className="text-[10.5px] font-semibold text-[#6E54FF] dark:text-gold">
              Token
            </Text>
          </View>
        )}
      </View>

      {/* Body */}
      {post.content ? (
        <Text className="px-4 pb-1 pt-3 text-[15px] leading-[22px] text-foreground">
          {post.content}
        </Text>
      ) : null}

      {/* Media */}
      {imageCount > 0 && (
        <View className="mt-3 flex-row flex-wrap gap-0.5 px-4">
          {post.images!.slice(0, 4).map((img, idx) => (
            <Image
              key={`${img}-${idx}`}
              source={{ uri: img }}
              resizeMode="cover"
              className={
                imageCount === 1
                  ? 'h-60 w-full rounded-2xl'
                  : 'h-[110px] flex-1 rounded-xl'
              }
            />
          ))}
        </View>
      )}

      {/* Token detail */}
      {post.isTokenized && (
        <View className="mx-4 mt-3 flex-row items-center justify-between rounded-2xl border border-border bg-secondary/50 px-3.5 py-2.5">
          <View className="flex-row items-center gap-2">
            <Icon as={Coins} size={15} className="text-foreground" />
            <Text className="text-[12.5px] font-medium text-foreground">
              {post.tokenSupply} @ {post.tokenPrice} MON
            </Text>
          </View>
          <Pressable
            onPress={() => onBuyToken(post)}
            accessibilityRole="button"
            hitSlop={6}
            className="rounded-full bg-foreground px-3 py-1.5 active:opacity-80"
          >
            <Text className="text-[12px] font-semibold text-background">
              {t('feed.buy')}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Tips earned */}
      {post.totalTipsAmount > 0 && (
        <View className="mx-4 mt-3 flex-row items-center gap-2 rounded-2xl bg-success/10 px-3.5 py-2.5">
          <Icon as={Gift} size={14} className="text-success" />
          <Text className="text-[12.5px] font-medium text-success">
            {t('feed.receivedTips', { amount: post.totalTipsAmount.toFixed(4) })}
          </Text>
        </View>
      )}

      {/* Metrics */}
      {(post.likesCount > 0 || post.commentsCount > 0 || post.tipsCount > 0) && (
        <View className="mt-3 flex-row items-center gap-3 px-4 text-[12.5px] text-muted-foreground">
          {post.likesCount > 0 && (
            <View className="flex-row items-center gap-1.5">
              <Icon as={Heart} size={12} className="text-red-500" fill="#FF3F00" />
              <Text className="text-muted-foreground">{post.likesCount}</Text>
            </View>
          )}
          {post.commentsCount > 0 && (
            <Text className="text-muted-foreground">
              {post.commentsCount} {t('feed.comments')}
            </Text>
          )}
          {post.tipsCount > 0 && (
            <Text className="text-muted-foreground">
              {post.tipsCount} {t('feed.tips')}
            </Text>
          )}
        </View>
      )}

      {/* Actions */}
      <View className="mt-2 flex-row items-center justify-between border-t border-border px-2 py-1.5">
        <View className="flex-row items-center gap-1">
          <PostAction
            icon={Heart}
            value={post.likesCount}
            active={post.isLiked}
            activeClassName="text-red-500"
            onPress={() => onLike(post.id, post.isLiked)}
            accessibilityLabel={post.isLiked ? 'Unlike post' : 'Like post'}
          />
          <PostAction
            icon={MessageCircle}
            value={post.commentsCount}
            onPress={() => router.push(`/post/${post.id}`)}
            accessibilityLabel={t('feed.viewComments')}
          />
        </View>

        <PostAction
          icon={Gift}
          value={post.tipsCount || undefined}
          active={post.tipsCount > 0}
          activeClassName="text-success"
          onPress={() => onTip(post)}
          accessibilityLabel={t('feed.tip')}
        />
      </View>
    </Pressable>
  );
}
