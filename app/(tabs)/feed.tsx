import { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Compass, PenLine, Search, Sparkles } from 'lucide-react-native';
import { usePosts } from '@/hooks/usePosts';
import { useWallet } from '@/hooks/useWallet';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import type { Post } from '@/types';
import * as Clipboard from 'expo-clipboard';
import { toast } from 'sonner-native';
import { uploadMultipleImages } from '@/lib/upload';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  BalanceCard,
  MiniAppsCard,
  CreatePostModal,
  TipModal,
  BuyTokenModal,
  FeedPostCard,
  CreatePostButton,
} from '@/components/feed';
import { EmptyState, LoadingSpinner } from '@/components/common';

const NAVY = '#6e54ff';
const GOLD = '#6e54ff';

export default function FeedScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    posts,
    isLoadingFeed,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetchFeed,
    createPost,
    isCreatingPost,
    likePost,
    unlikePost,
    tipPost,
    isTippingPost,
    buyToken,
    isBuyingToken,
  } = usePosts();
  const { balance, walletAddress, isLoadingBalance, refetchBalance } = useWallet();
  const { unreadCount } = useNotifications();

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showBuyTokenModal, setShowBuyTokenModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const displayName = user?.name?.trim() || user?.username || 'Pulse';
  const initial = displayName.charAt(0).toUpperCase();

  const handleCreatePost = async (data: {
    content: string;
    images: string[];
    isTokenized: boolean;
    tokenSupply?: number;
    tokenPrice?: number;
  }) => {
    let imageUrls: string[] = [];

    if (data.images.length > 0) {
      setIsUploadingImages(true);
      try {
        imageUrls = await uploadMultipleImages(data.images);
      } catch {
        toast.error(t('feed.failedToUploadImages'));
        setIsUploadingImages(false);
        return;
      }
      setIsUploadingImages(false);
    }

    createPost({
      content: data.content,
      images: imageUrls,
      isTokenized: data.isTokenized,
      tokenSupply: data.tokenSupply,
      tokenPrice: data.tokenPrice,
    });
    setShowCreatePost(false);
  };

  const handleTipPost = (post: Post) => {
    setSelectedPost(post);
    setShowTipModal(true);
  };

  const handleBuyToken = (post: Post) => {
    setSelectedPost(post);
    setShowBuyTokenModal(true);
  };

  const submitTip = (amount: number) => {
    if (!selectedPost) return;
    tipPost({ postId: selectedPost.id, amount });
    setShowTipModal(false);
    setSelectedPost(null);
  };

  const submitBuyToken = (amount: number) => {
    if (!selectedPost) return;
    buyToken({ postId: selectedPost.id, amount });
    setShowBuyTokenModal(false);
    setSelectedPost(null);
  };

  const handleLike = (postId: string, isLiked: boolean) => {
    if (isLiked) {
      unlikePost(postId);
    } else {
      likePost(postId);
    }
  };

  const copyAddress = async () => {
    if (!walletAddress) return;
    await Clipboard.setStringAsync(walletAddress);
    toast.success(t('feed.addressCopied'));
  };

  const handleRefreshBalance = async () => {
    await refetchBalance();
    toast.success(t('feed.balanceRefreshed'));
  };

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isLoadingFeed) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isLoadingFeed, fetchNextPage]);

  const listHeader = (
    <View>
      <BalanceCard
        balance={balance}
        walletAddress={walletAddress}
        isLoading={isLoadingBalance}
        showBalance={showBalance}
        unreadCount={unreadCount}
        onToggleBalance={() => setShowBalance((prev) => !prev)}
        onCopyAddress={copyAddress}
        onRefresh={handleRefreshBalance}
      />

      <MiniAppsCard />

      <View className="mt-7 flex-row items-end justify-between px-4">
        <View className="flex-1 pr-3">
          <View className="flex-row items-center gap-2">
            <View className="h-1.5 w-1.5 rounded-full bg-gold" />
            <Text className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t('common.feed')}
            </Text>
          </View>
          <Text className="mt-1 text-[22px] font-bold leading-7 text-foreground">
            {t('feed.whatsHappening')}
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/explore')}
          accessibilityRole="button"
          accessibilityLabel={t('feed.explore')}
          className="flex-row items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 active:bg-secondary"
        >
          <Icon as={Compass} size={16} className="text-foreground" />
          <Text className="text-[13px] font-semibold text-foreground">
            {t('feed.explore')}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      {/* App bar */}
      <View className="flex-row items-center justify-between px-4 pb-3 pt-2">
        <View className="flex-row items-center gap-2.5">
          <View className="h-8 w-8 items-center justify-center rounded-xl bg-[#0e100f]">
            <Icon as={PenLine} size={15} className="text-gold" strokeWidth={2.4} />
          </View>
          <View>
            <Text className="text-[11px] font-medium leading-4 text-muted-foreground">
              {greeting()}
            </Text>
            <Text numberOfLines={1} className="text-[15px] font-bold leading-5 text-foreground">
              {displayName}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => router.push('/(tabs)/search')}
            accessibilityRole="button"
            accessibilityLabel={t('common.search')}
            className="h-9 w-9 items-center justify-center rounded-full border border-border bg-card active:bg-secondary"
          >
            <Icon as={Search} size={17} className="text-foreground" />
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            accessibilityRole="button"
            accessibilityLabel="Your profile"
            className="h-9 w-9 items-center justify-center rounded-full active:opacity-70"
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} className="h-9 w-9 rounded-full bg-secondary" />
            ) : (
              <View className="h-9 w-9 items-center justify-center rounded-full bg-[#E4DFFF] dark:bg-[#1D1554]">
                <Text className="text-[13px] font-bold text-[#5A3FE0] dark:text-[#b8b4fe]">
                  {initial}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FeedPostCard
            post={item}
            onLike={handleLike}
            onTip={handleTipPost}
            onBuyToken={handleBuyToken}
            onNavigateToProfile={(username) =>
              router.push(`/(tabs)/profile?username=${username}`)
            }
          />
        )}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          isLoadingFeed ? (
            <View className="pt-16">
              <LoadingSpinner />
            </View>
          ) : (
            <EmptyState
              icon={Sparkles}
              message={t('feed.noPostsYet')}
              subtitle="Write the first post or follow creators to fill your feed."
            />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-6">
              <LoadingSpinner size="small" />
            </View>
          ) : null
        }
        contentContainerStyle={{
          paddingBottom: insets.bottom + 130,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingFeed && posts.length > 0}
            onRefresh={refetchFeed}
            tintColor={NAVY}
            colors={[NAVY]}
            progressBackgroundColor={GOLD}
          />
        }
      />

      <CreatePostButton onPress={() => setShowCreatePost(true)} />

      <CreatePostModal
        visible={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onSubmit={handleCreatePost}
        isSubmitting={isCreatingPost}
        isUploadingImages={isUploadingImages}
      />

      <TipModal
        visible={showTipModal}
        onClose={() => setShowTipModal(false)}
        onSubmit={submitTip}
        recipientUsername={selectedPost?.author.username || ''}
        isSubmitting={isTippingPost}
      />

      <BuyTokenModal
        visible={showBuyTokenModal}
        onClose={() => setShowBuyTokenModal(false)}
        onSubmit={submitBuyToken}
        tokenPrice={selectedPost?.tokenPrice || 0}
        isSubmitting={isBuyingToken}
      />
    </SafeAreaView>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
