import { View, ScrollView, RefreshControl } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { toast } from 'sonner-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useUserPosts, useUserComments, useUserLikes } from '@/hooks/usePosts';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useUserProfile } from '@/hooks/useProfile';
import { useFollows, useCheckFollowing } from '@/hooks/useFollows';
import { useChats } from '@/hooks/useChats';
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@/types';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { PostsTab } from '@/components/profile/PostsTab';
import { PortfolioTab } from '@/components/profile/PortfolioTab';
import { RepliesTab } from '@/components/profile/RepliesTab';
import { LikesTab } from '@/components/profile/LikesTab';
import { ProfileMenu } from '@/components/profile/ProfileMenu';
import { LoadingSpinner } from '@/components/common';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const tabs = [t('profile.posts'), t('profile.portfolio'), t('profile.replies'), t('profile.likes')];
  
  const { username: queryUsername } = useLocalSearchParams<{ username?: string }>();
  const { user: currentUser, isLoadingUser } = useAuth();
  const typedCurrentUser = currentUser as User | undefined;
  
  const isOwnProfile = !queryUsername || queryUsername === typedCurrentUser?.username;
  const targetUsername = isOwnProfile ? (typedCurrentUser?.username || '') : (queryUsername || '');
  
  const { data: profileUser, isLoading: isLoadingProfile } = useUserProfile(
    targetUsername,
    !isOwnProfile && !!targetUsername
  );
  
  const { posts, isLoading: isLoadingPosts } = useUserPosts(targetUsername, !!targetUsername);
  const { comments, isLoading: isLoadingComments } = useUserComments(targetUsername, !!targetUsername);
  const { posts: likedPosts, isLoading: isLoadingLikes } = useUserLikes(targetUsername, !!targetUsername);
  
  console.log('[ProfileScreen] targetUsername:', targetUsername);
  console.log('[ProfileScreen] posts:', posts);
  console.log('[ProfileScreen] isLoadingPosts:', isLoadingPosts);
  
  const displayUser = (isOwnProfile ? typedCurrentUser : profileUser) as User | undefined;
  const displayUserId = displayUser?.id || '';
  
  const { data: portfolio, isLoading: isLoadingPortfolio } = usePortfolio(displayUserId);
  const { followUser, unfollowUser } = useFollows();
  const { data: followingData } = useCheckFollowing(isOwnProfile ? '' : displayUserId);
  const { createChat, isCreatingChat } = useChats();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState(t('profile.posts'));
  const [showMenu, setShowMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isFollowingUser = (followingData as { isFollowing?: boolean })?.isFollowing || false;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['posts', 'user', targetUsername] }),
        queryClient.invalidateQueries({ queryKey: ['user-comments', targetUsername] }),
        queryClient.invalidateQueries({ queryKey: ['user-likes', targetUsername] }),
        queryClient.invalidateQueries({ queryKey: ['portfolio', displayUserId] }),
        queryClient.invalidateQueries({ queryKey: ['user-profile', targetUsername] }),
        queryClient.invalidateQueries({ queryKey: ['check-following', displayUserId] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const navigateToProfile = (username: string) => {
    if (username === typedCurrentUser?.username) {
      router.push('/(tabs)/profile');
    } else {
      router.push(`/(tabs)/profile?username=${username}`);
    }
  };

  const handleFollowToggle = () => {
    if (!displayUserId) return;
    if (isFollowingUser) {
      unfollowUser(displayUserId);
    } else {
      followUser(displayUserId);
    }
  };

  const handleMessageUser = async () => {
    if (!displayUserId) return;
    try {
      const chat = await createChat(displayUserId) as any;
      if (chat?.id) {
        router.push(`/(tabs)/chats/${chat.id}`);
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const copyAddress = async () => {
    if (displayUser?.walletAddress) {
      await Clipboard.setStringAsync(displayUser.walletAddress);
      toast.success(t('wallet.addressCopied'));
    }
  };

  if (isLoadingUser || isLoadingProfile) {
    return <LoadingSpinner fullScreen />;
  }

  if (!displayUser) {
    return null;
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#6e54ff"
            colors={['#6e54ff']}
          />
        }
      >
        <ProfileHeader 
          isOwnProfile={isOwnProfile}
          onSettingsPress={() => router.push('/profile/settings')}
        />

        <ProfileCard
          user={displayUser}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowingUser}
          isCreatingChat={isCreatingChat}
          onMenuPress={() => setShowMenu(true)}
          onFollowToggle={handleFollowToggle}
          onMessagePress={handleMessageUser}
          onCopyAddress={copyAddress}
        />

        <ProfileTabs 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === t('profile.posts') && (
          <PostsTab posts={posts} isLoading={isLoadingPosts} />
        )}

        {activeTab === t('profile.portfolio') && (
          <PortfolioTab 
            portfolio={portfolio}
            isLoading={isLoadingPortfolio}
            isOwnProfile={isOwnProfile}
            onNavigateToProfile={navigateToProfile}
          />
        )}

        {activeTab === t('profile.replies') && (
          <RepliesTab comments={comments} isLoading={isLoadingComments} />
        )}

        {activeTab === t('profile.likes') && (
          <LikesTab posts={likedPosts} isLoading={isLoadingLikes} />
        )}
      </ScrollView>

      <ProfileMenu visible={showMenu} onClose={() => setShowMenu(false)} />
    </View>
  );
}

