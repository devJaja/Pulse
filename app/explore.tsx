import { View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, TextInput, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, Search, Heart, MessageCircle, DollarSign, Coins } from 'lucide-react-native';
import { usePosts } from '@/hooks/usePosts';
import { router } from 'expo-router';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Post } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 pt-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Icon as={ArrowLeft} size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="flex-1 text-2xl font-bold">Explore</Text>
      </View>

      {/* Search Bar */}
      <View className="mx-4 mt-4 flex-row items-center gap-2 rounded-xl border-2 border-border bg-background px-4 py-3">
        <Icon as={Search} size={20} className="text-muted-foreground" />
        <TextInput
          placeholder="Search posts, users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-base text-foreground"
          placeholderTextColor="#727285"
        />
      </View>

      {/* Posts */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoadingFeed} onRefresh={refetchFeed} />
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
            <View className="items-center py-20">
              <ActivityIndicator size="large" color="#6e54ff" />
            </View>
          ) : filteredPosts.length === 0 ? (
            <View className="items-center py-20">
              <Text className="text-muted-foreground">
                {searchQuery ? 'No posts found' : 'No posts yet'}
              </Text>
            </View>
          ) : (
            filteredPosts.map((post: Post) => (
              <TouchableOpacity
                key={post.id}
                onPress={() => router.push(`/post/${post.id}`)}
                className="mb-4 border-b border-border bg-card p-4"
              >
                {/* Author Info */}
                <TouchableOpacity 
                  onPress={() => navigateToProfile(post.author.username)}
                  className="mb-3 flex-row items-center gap-3"
                >
                  {post.author.avatar ? (
                    <Image source={{ uri: post.author.avatar }} className="h-10 w-10 rounded-full" />
                  ) : (
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-200">
                      <Text className="text-lg font-bold text-purple-600">
                        {post.author.name?.charAt(0)?.toUpperCase() || post.author.username.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="font-semibold">{post.author.name || post.author.username}</Text>
                    <Text className="text-sm text-muted-foreground">@{post.author.username} · {formatTime(post.createdAt)}</Text>
                  </View>
                </TouchableOpacity>

                {/* Content */}
                <Text className="mb-3">{post.content}</Text>

                {/* Images */}
                {post.images && post.images.length > 0 && (
                  <View className={`mb-3 gap-2 ${post.images.length === 1 ? '' : 'flex-row flex-wrap'}`}>
                    {post.images.map((img, idx) => (
                      <Image
                        key={idx}
                        source={{ uri: img }}
                        className={`rounded-xl ${
                          post.images.length === 1 
                            ? 'h-80 w-full' 
                            : post.images.length === 2
                            ? 'h-48 w-[49%]'
                            : post.images.length === 3
                            ? idx === 0 ? 'h-48 w-full' : 'h-32 w-[49%]'
                            : 'h-32 w-[49%]'
                        }`}
                        resizeMode="cover"
                      />
                    ))}
                  </View>
                )}

                {/* Token Badge */}
                {post.isTokenized && (
                  <View className="mb-3 flex-row items-center gap-2 rounded-lg bg-purple-50 p-3 dark:bg-purple-950">
                    <Icon as={Coins} size={16} className="text-purple-600" />
                    <Text className="text-sm font-medium text-purple-600">
                      Tokenized Post · {post.tokenSupply} tokens @ {post.tokenPrice} MON
                    </Text>
                  </View>
                )}

                {/* Actions */}
                <View className="flex-row items-center gap-6">
                  <TouchableOpacity 
                    onPress={() => handleLike(post.id, post.isLiked)}
                    className={`flex-row items-center gap-1 rounded-full px-3 py-1.5 ${
                      post.isLiked ? 'bg-purple-50 dark:bg-purple-950' : ''
                    }`}
                  >
                    <Icon 
                      as={Heart} 
                      size={20} 
                      className={post.isLiked ? "text-purple-600" : "text-muted-foreground"}
                      fill={post.isLiked ? "#6e54ff" : "none"}
                    />
                    <Text className={`${post.isLiked ? 'text-purple-600 font-semibold' : 'text-muted-foreground'}`}>
                      {post.likesCount || 0}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => router.push(`/post/${post.id}`)}
                    className="flex-row items-center gap-1"
                  >
                    <Icon as={MessageCircle} size={20} className="text-muted-foreground" />
                    <Text className="text-muted-foreground">{post.commentsCount || 0}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity className="flex-row items-center gap-1">
                    <Icon as={DollarSign} size={20} className="text-muted-foreground" />
                    <Text className="text-muted-foreground">Tip</Text>
                  </TouchableOpacity>

                  {post.isTokenized && (
                    <TouchableOpacity className="ml-auto flex-row items-center gap-1 rounded-lg bg-primary px-3 py-1.5">
                      <Icon as={Coins} size={16} className="text-primary-foreground" />
                      <Text className="text-sm font-medium text-primary-foreground">Buy</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}

          {isFetchingNextPage && (
            <View className="py-4">
              <ActivityIndicator size="small" color="#6e54ff" />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
