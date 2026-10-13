import { View, TouchableOpacity, ActivityIndicator, TextInput, FlatList } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ArrowLeft, Search, UserPlus, UserMinus, X } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFollowers, useFollowing, useFollows } from '@/hooks/useFollows';
import type { User } from '@/types';

type TabType = 'followers' | 'following';

export default function FollowsScreen() {
  const { userId, tab: initialTab } = useLocalSearchParams<{ userId: string; tab?: string }>();
  const { user: currentUser } = useAuth();
  const typedCurrentUser = currentUser as User | undefined;

  const [activeTab, setActiveTab] = useState<TabType>((initialTab as TabType) || 'followers');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: followersData, isLoading: isLoadingFollowers } = useFollowers(userId);
  const { data: followingData, isLoading: isLoadingFollowing } = useFollowing(userId);
  const { followUser, unfollowUser, isFollowing: isFollowingLoading, isUnfollowing } = useFollows();

  const followers = (followersData as any[]) || [];
  const following = (followingData as any[]) || [];

  const activeList = activeTab === 'followers' ? followers : following;

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return activeList;

    const query = searchQuery.toLowerCase();
    return activeList.filter((user: any) =>
      user.username?.toLowerCase().includes(query) ||
      user.name?.toLowerCase().includes(query)
    );
  }, [activeList, searchQuery]);

  const handleFollowToggle = (targetUserId: string, isFollowing: boolean) => {
    if (isFollowing) {
      unfollowUser(targetUserId);
    } else {
      followUser(targetUserId);
    }
  };

  const navigateToProfile = (username: string) => {
    if (username === typedCurrentUser?.username) {
      router.push('/(tabs)/profile');
    } else {
      router.push(`/(tabs)/profile?username=${username}`);
    }
  };

  const renderUserItem = ({ item: user }: { item: any }) => {
    const isCurrentUser = user.id === typedCurrentUser?.id;
    const isFollowingUser = user.isFollowing || false;

    return (
      <TouchableOpacity
        onPress={() => navigateToProfile(user.username)}
        className="mb-3 flex-row items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft active:bg-secondary"
      >
        <View className="flex-1 flex-row items-center gap-3">
          <Avatar
            uri={user.avatar}
            name={user.name}
            username={user.username}
            size="md"
            className="border border-border"
          />

          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
              {user.name || user.username}
            </Text>
            <Text className="text-2xs text-muted-foreground" numberOfLines={1}>
              @{user.username}
            </Text>
            {user.bio && (
              <Text className="mt-1 text-2xs text-muted-foreground" numberOfLines={1}>
                {user.bio}
              </Text>
            )}
          </View>
        </View>

        {!isCurrentUser && (
          <Button
            variant={isFollowingUser ? 'secondary' : 'default'}
            size="sm"
            onPress={() => handleFollowToggle(user.id, isFollowingUser)}
            disabled={isFollowingLoading || isUnfollowing}
            className="ml-3 rounded-full"
          >
            <Icon
              as={isFollowingUser ? UserMinus : UserPlus}
              size={15}
              className={isFollowingUser ? 'text-foreground' : 'text-primary-foreground'}
            />
            <Text>{isFollowingUser ? 'Unfollow' : 'Follow'}</Text>
          </Button>
        )}
      </TouchableOpacity>
    );
  };

  const isLoading = activeTab === 'followers' ? isLoadingFollowers : isLoadingFollowing;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="border-b border-border bg-background">
        <View className="flex-row items-center gap-3 px-4 pt-14 pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={12}
            className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-soft active:bg-secondary"
          >
            <Icon as={ArrowLeft} size={20} className="text-foreground" />
          </TouchableOpacity>
          <Text className="text-xl font-bold tracking-tight text-foreground">
            {activeTab === 'followers' ? 'Followers' : 'Following'}
          </Text>
        </View>

        {/* Tabs */}
        <View className="mx-4 mb-3 flex-row rounded-xl border border-border bg-secondary p-1">
          <TouchableOpacity
            onPress={() => setActiveTab('followers')}
            className={`flex-1 items-center rounded-lg py-2.5 ${
              activeTab === 'followers' ? 'border border-border bg-card shadow-soft' : ''
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === 'followers' ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Followers ({followers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('following')}
            className={`flex-1 items-center rounded-lg py-2.5 ${
              activeTab === 'following' ? 'border border-border bg-card shadow-soft' : ''
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === 'following' ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Following ({following.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="px-4 pb-4">
          <View className="flex-row items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-1">
            <Icon as={Search} size={18} className="text-muted-foreground" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search ${activeTab}...`}
              placeholderTextColor="#727285"
              className="flex-1 py-2.5 text-sm text-foreground"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={12}>
                <Icon as={X} size={18} className="text-muted-foreground" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Users List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6e54ff" />
        </View>
      ) : filteredUsers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-accent">
            <Icon as={Search} size={28} className="text-primary" strokeWidth={1.8} />
          </View>
          <Text className="mt-4 text-center text-base font-semibold text-foreground">
            {searchQuery.trim() ? 'No results found' : `No ${activeTab} yet`}
          </Text>
          <Text className="mt-1 max-w-xs text-center text-sm leading-5 text-muted-foreground">
            {searchQuery.trim()
              ? `Nothing matched "${searchQuery}"`
              : activeTab === 'followers'
              ? 'When people follow you, they will appear here.'
              : 'When you follow people, they will appear here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
        />
      )}
    </View>
  );
}
