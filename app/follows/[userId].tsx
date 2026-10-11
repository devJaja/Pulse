import { View, ScrollView, TouchableOpacity, ActivityIndicator, Image, TextInput, FlatList } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
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
        className="flex-row items-center justify-between px-4 py-3 border-b border-border"
      >
        <View className="flex-row items-center gap-3 flex-1">
          {user.avatar ? (
            <Image 
              source={{ uri: user.avatar }} 
              className="h-12 w-12 rounded-full"
            />
          ) : (
            <View className="h-12 w-12 items-center justify-center rounded-full bg-purple-200 dark:bg-purple-900">
              <Text className="text-lg font-bold text-purple-600 dark:text-purple-300">
                {user.name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          
          <View className="flex-1">
            <Text className="font-semibold" numberOfLines={1}>
              {user.name || user.username}
            </Text>
            <Text className="text-sm text-muted-foreground" numberOfLines={1}>
              @{user.username}
            </Text>
            {user.bio && (
              <Text className="text-sm text-muted-foreground mt-1" numberOfLines={1}>
                {user.bio}
              </Text>
            )}
          </View>
        </View>
        
        {!isCurrentUser && (
          <TouchableOpacity
            onPress={() => handleFollowToggle(user.id, isFollowingUser)}
            disabled={isFollowingLoading || isUnfollowing}
            className={`flex-row items-center gap-2 rounded-full px-4 py-2 ${
              isFollowingUser ? 'bg-gray-200 dark:bg-gray-700' : 'bg-primary'
            }`}
          >
            <Icon 
              as={isFollowingUser ? UserMinus : UserPlus} 
              size={16} 
              className={isFollowingUser ? "text-foreground" : "text-primary-foreground"}
            />
            <Text className={`font-semibold text-sm ${isFollowingUser ? 'text-foreground' : 'text-primary-foreground'}`}>
              {isFollowingUser ? 'Unfollow' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };
  
  const isLoading = activeTab === 'followers' ? isLoadingFollowers : isLoadingFollowing;
  
  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="border-b border-border bg-background">
        <View className="flex-row items-center justify-between px-4 pt-12 pb-4">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <Icon as={ArrowLeft} size={24} className="text-foreground" />
            </TouchableOpacity>
            <Text className="text-xl font-bold">
              {activeTab === 'followers' ? 'Followers' : 'Following'}
            </Text>
          </View>
        </View>
        
        {/* Tabs */}
        <View className="flex-row px-4 pb-2">
          <TouchableOpacity
            onPress={() => setActiveTab('followers')}
            className={`flex-1 items-center pb-3 border-b-2 ${
              activeTab === 'followers' ? 'border-purple-600' : 'border-transparent'
            }`}
          >
            <Text className={`font-semibold ${
              activeTab === 'followers' ? 'text-purple-600' : 'text-muted-foreground'
            }`}>
              Followers ({followers.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setActiveTab('following')}
            className={`flex-1 items-center pb-3 border-b-2 ${
              activeTab === 'following' ? 'border-purple-600' : 'border-transparent'
            }`}
          >
            <Text className={`font-semibold ${
              activeTab === 'following' ? 'text-purple-600' : 'text-muted-foreground'
            }`}>
              Following ({following.length})
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View className="px-4 pb-3">
          <View className="flex-row items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-800 px-4 py-2">
            <Icon as={Search} size={20} className="text-muted-foreground" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search ${activeTab}...`}
              placeholderTextColor="#727285"
              className="flex-1 text-foreground"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon as={X} size={20} className="text-muted-foreground" />
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
          <Text className="text-center text-lg text-muted-foreground">
            {searchQuery.trim() 
              ? `No ${activeTab} found matching "${searchQuery}"`
              : `No ${activeTab} yet`
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}
