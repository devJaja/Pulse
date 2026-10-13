import { View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Search as SearchIcon } from 'lucide-react-native';
import { useState } from 'react';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { UserSearchCard, PostSearchCard, TokenSearchCard } from '@/components/search';
import { EmptyState } from '@/components/common';

interface SearchUser {
  id: string;
  username: string;
  name: string;
  avatar?: string;
}

interface SearchPost {
  id: string;
  content: string;
  author: {
    username: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  likesCount: number;
  commentsCount: number;
}

interface SearchToken {
  id: string;
  content: string;
  author: {
    username: string;
    name: string;
    avatar?: string;
  };
  tokenPrice: number;
  tokenSupply: number;
  tokensSold: number;
  createdAt: string;
}

type TabType = 'users' | 'posts' | 'tokens';

const TABS: { key: TabType; label: string }[] = [
  { key: 'users', label: 'Users' },
  { key: 'posts', label: 'Posts' },
  { key: 'tokens', label: 'Tokens' },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [isSearching, setIsSearching] = useState(false);
  
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [tokens, setTokens] = useState<SearchToken[]>([]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setUsers([]);
      setPosts([]);
      setTokens([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Search all categories in parallel
      const [usersRes, postsRes, tokensRes] = await Promise.all([
        api.searchUsers(query),
        api.searchPosts(query),
        api.searchTokens(query),
      ]);

      console.log('Search responses:', {
        users: usersRes,
        posts: postsRes,
        tokens: tokensRes,
      });

      // Handle users response
      if (usersRes.data && Array.isArray(usersRes.data)) {
        setUsers(usersRes.data as SearchUser[]);
      } else if (Array.isArray(usersRes)) {
        setUsers(usersRes as SearchUser[]);
      } else {
        setUsers([]);
      }
      
      // Handle posts response
      if (postsRes.data && Array.isArray(postsRes.data)) {
        setPosts(postsRes.data as SearchPost[]);
      } else if (Array.isArray(postsRes)) {
        setPosts(postsRes as SearchPost[]);
      } else {
        setPosts([]);
      }
      
      // Handle tokens response
      if (tokensRes.data && Array.isArray(tokensRes.data)) {
        setTokens(tokensRes.data as SearchToken[]);
      } else if (Array.isArray(tokensRes)) {
        setTokens(tokensRes as SearchToken[]);
      } else {
        setTokens([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setUsers([]);
      setPosts([]);
      setTokens([]);
    } finally {
      setIsSearching(false);
    }
  };

  const renderUsers = () => {
    if (isSearching) {
      return (
        <View className="items-center py-20">
          <ActivityIndicator size="large" color="#6e54ff" />
        </View>
      );
    }

    if (users.length === 0 && searchQuery.length >= 2) {
      return (
        <EmptyState
          icon={SearchIcon}
          message="No users found"
          subtitle="Try searching with a different keyword"
        />
      );
    }

    return users.map((user) => (
      <UserSearchCard
        key={user.id}
        user={user}
        onPress={() => router.push(`/(tabs)/profile?username=${user.username}`)}
      />
    ));
  };

  const renderPosts = () => {
    if (isSearching) {
      return (
        <View className="items-center py-20">
          <ActivityIndicator size="large" color="#6e54ff" />
        </View>
      );
    }

    if (posts.length === 0 && searchQuery.length >= 2) {
      return (
        <EmptyState
          icon={SearchIcon}
          message="No posts found"
          subtitle="Try searching with a different keyword"
        />
      );
    }

    return posts.map((post) => (
      <PostSearchCard
        key={post.id}
        post={post}
        onPress={() => router.push(`/post/${post.id}`)}
      />
    ));
  };

  const renderTokens = () => {
    if (isSearching) {
      return (
        <View className="items-center py-20">
          <ActivityIndicator size="large" color="#6e54ff" />
        </View>
      );
    }

    if (tokens.length === 0 && searchQuery.length >= 2) {
      return (
        <EmptyState
          icon={SearchIcon}
          message="No tokens found"
          subtitle="Try searching with a different keyword"
        />
      );
    }

    return tokens.map((token) => (
      <TokenSearchCard
        key={token.id}
        token={token}
        onPress={() => router.push(`/post/${token.id}`)}
      />
    ));
  };

  const counts: Record<TabType, number> = {
    users: users.length,
    posts: posts.length,
    tokens: tokens.length,
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 pb-4 pt-12">
        <Text className="mb-4 text-3xl font-bold text-foreground">Search</Text>
        
        {/* Search Input */}
        <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
          <Icon as={SearchIcon} size={20} className="text-muted-foreground" />
          <TextInput
            placeholder="Search users, posts, or tokens..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#727285"
            className="flex-1 text-base text-foreground"
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Tabs */}
      <View className="px-4 pb-3">
        <View className="flex-row rounded-full border border-border bg-card p-1 shadow-soft">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.85}
                className={`flex-1 flex-row items-center justify-center gap-1 rounded-full py-2 ${
                  isActive ? 'bg-primary' : ''
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {tab.label}
                </Text>
                {counts[tab.key] > 0 && (
                  <Text
                    className={`text-2xs font-semibold ${
                      isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    }`}
                  >
                    {counts[tab.key]}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Results */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {searchQuery.length < 2 ? (
          <EmptyState
            icon={SearchIcon}
            message="Search for users, posts, or tokens"
            subtitle="Enter at least 2 characters to start searching"
          />
        ) : (
          <>
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'posts' && renderPosts()}
            {activeTab === 'tokens' && renderTokens()}
          </>
        )}
      </ScrollView>
    </View>
  );
}
