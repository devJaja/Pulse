import { View, ScrollView, TouchableOpacity, RefreshControl, TextInput, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { ArrowLeft, Search, Heart, MessageCircle, DollarSign, Coins } from 'lucide-react-native';
import { usePosts } from '@/hooks/usePosts';
import { router } from 'expo-router';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Post } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, LoadingSpinner } from '@/components/common';

export default function ExploreScreen() {
  const { posts, isLoadingFeed, fetchNextPage, hasNextPage, isFetchingNextPage, refetchFeed, likePost, unlikePost } = usePosts();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLike = (postId: string, isLiked: boolean) => {
    if (isLiked) {
      unlikePost(postId);
    } else {
      likePost(postId);
    }
  };

  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: false }).replace('about ', '');
    } catch {
      return '';
    }
  };

  const navigateToProfile = (username: string) => {
    router.push(`/(tabs)/profile?username=${username}`);
  };

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 pt-4">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-soft active:bg-secondary"
        >
          <Icon as={ArrowLeft} size={20} className="text-foreground" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-2xl font-bold tracking-tight text-foreground">Explore</Text>
          <Text className="text-[12.5px] text-muted-foreground">
            Discover posts and creators
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="mx-4 mt-4 flex-row items-center gap-2 rounded-2xl border border-border bg-card px-4 shadow-soft">
        <Icon as={Search} size={18} className="text-muted-foreground" />
        <TextInput
          placeholder="Search posts, users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="h-12 flex-1 text-[15px] text-foreground"
          placeholderTextColor="#727285"
        />
      </View>

      {/* Posts */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isLoadingFeed}
            onRefresh={refetchFeed}
            tintColor="#6e54ff"
            colors={['#6e54ff']}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          if (isCloseToBottom && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        scrollEventThrottle={400}
      >
        <View className="mt-4">
          {isLoadingFeed && posts.length === 0 ? (
            <LoadingSpinner />
          ) : filteredPosts.length === 0 ? (
            <EmptyState
              icon={Search}
              message={searchQuery ? 'No posts found' : 'No posts yet'}
              subtitle={
                searchQuery
                  ? 'Try a different search term.'
                  : 'Posts from creators you follow will show up here.'
              }
            />
          ) : (
            filteredPosts.map((post: Post) => (
              <TouchableOpacity
                key={post.id}
                onPress={() => router.push(`/post/${post.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Post by ${post.author.name || post.author.username}`}
                className="mx-4 mb-4 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-soft active:bg-secondary/40 dark:active:bg-secondary/30"
              >
                {/* Author Info */}
                <TouchableOpacity
                  onPress={() => navigateToProfile(post.author.username)}
                  accessibilityRole="button"
                  className="mb-3 flex-row items-center gap-3 active:opacity-70"
                >
                  <Avatar
                    uri={post.author.avatar}
                    name={post.author.name}
                    username={post.author.username}
                    size="sm"
                    className="h-10 w-10"
                    ring
                  />
                  <View className="flex-1">
                    <Text numberOfLines={1} className="text-[14.5px] font-semibold text-foreground">
                      {post.author.name || post.author.username}
                    </Text>
                    <Text numberOfLines={1} className="mt-0.5 text-[12.5px] text-muted-foreground">
                      @{post.author.username} · {formatTime(post.createdAt)}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Content */}
                <Text className="mb-3 text-[15px] leading-[22px] text-foreground">
                  {post.content}
                </Text>

                {/* Images */}
                {post.images && post.images.length > 0 && (
                  <View className={`mb-3 gap-1.5 ${post.images.length === 1 ? '' : 'flex-row flex-wrap'}`}>
                    {post.images.map((img, idx) => (
                      <Image
                        key={idx}
                        source={{ uri: img }}
                        className={`bg-muted ${
                          post.images.length === 1
                            ? 'h-80 w-full rounded-2xl'
                            : post.images.length === 2
                              ? 'h-48 w-[49%] rounded-xl'
                              : post.images.length === 3
                                ? idx === 0 ? 'h-48 w-full rounded-xl' : 'h-32 w-[49%] rounded-xl'
                                : 'h-32 w-[49%] rounded-xl'
                        }`}
                        resizeMode="cover"
                      />
                    ))}
                  </View>
                )}

                {/* Token Badge */}
                {post.isTokenized && (
                  <View className="mb-3 flex-row items-center gap-2 rounded-2xl border border-primary/15 bg-accent p-3">
                    <Icon as={Coins} size={16} className="text-primary dark:text-brand-300" />
                    <Text className="text-sm font-medium text-primary dark:text-brand-300">
                      Tokenized Post · {post.tokenSupply} tokens @ {post.tokenPrice} MON
                    </Text>
                  </View>
                )}

                {/* Actions */}
                <View className="flex-row items-center gap-1">
                  <TouchableOpacity
                    onPress={() => handleLike(post.id, post.isLiked)}
                    accessibilityRole="button"
                    accessibilityLabel={post.isLiked ? 'Unlike post' : 'Like post'}
                    className={`min-h-[36px] flex-row items-center gap-1.5 rounded-full px-2.5 active:bg-secondary ${
                      post.isLiked ? 'bg-secondary' : ''
                    }`}
                  >
                    <Icon
                      as={Heart}
                      size={20}
                      className={post.isLiked ? 'text-red-500' : 'text-muted-foreground'}
                      fill={post.isLiked ? '#FF3F00' : 'none'}
                    />
                    <Text
                      className={`text-[13px] font-medium ${
                        post.isLiked ? 'text-red-500' : 'text-muted-foreground'
                      }`}
                    >
                      {post.likesCount || 0}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push(`/post/${post.id}`)}
                    accessibilityRole="button"
                    accessibilityLabel="View comments"
                    className="min-h-[36px] flex-row items-center gap-1.5 rounded-full px-2.5 active:bg-secondary"
                  >
                    <Icon as={MessageCircle} size={20} className="text-muted-foreground" />
                    <Text className="text-[13px] font-medium text-muted-foreground">
                      {post.commentsCount || 0}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Tip author"
                    className="min-h-[36px] flex-row items-center gap-1.5 rounded-full px-2.5 active:bg-secondary"
                  >
                    <Icon as={DollarSign} size={20} className="text-muted-foreground" />
                    <Text className="text-[13px] font-medium text-muted-foreground">Tip</Text>
                  </TouchableOpacity>

                  {post.isTokenized && (
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel="Buy tokens"
                      className="ml-auto flex-row items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 shadow-soft active:opacity-90"
                    >
                      <Icon as={Coins} size={15} className="text-primary-foreground" />
                      <Text className="text-sm font-semibold text-primary-foreground">Buy</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}

          {isFetchingNextPage && <LoadingSpinner size="small" />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
