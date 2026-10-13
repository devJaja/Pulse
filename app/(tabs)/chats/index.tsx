import { View, ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Search, Plus, X, MessageCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useChats } from '@/hooks/useChats';
import type { Chat } from '@/types';
import { PusherStatus } from '@/components/PusherStatus';
import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner-native';
import { ChatCard } from '@/components/chat';
import { Avatar, EmptyState, LoadingSpinner } from '@/components/common';

interface SearchUser {
  id: string;
  username: string;
  name: string;
  avatar?: string;
}

export default function ChatsScreen() {
  const { chats, isLoading, refetch, createChat, isCreatingChat } = useChats();
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debug logging
  console.log('[ChatsScreen] Chats count:', chats?.length || 0);
  console.log('[ChatsScreen] Is loading:', isLoading);
  console.log('[ChatsScreen] First chat:', chats?.[0]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.searchUsers(query);
      if (response.data && Array.isArray(response.data)) {
        setSearchResults(response.data as SearchUser[]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = async (user: SearchUser) => {
    try {
      const chat = await createChat(user.id) as any;
      setShowNewMessageModal(false);
      setSearchQuery('');
      setSearchResults([]);
      if (chat?.id) {
        router.push(`/chats/${chat.id}`);
      }
    } catch (error) {
      toast.error('Failed to create chat');
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#6e54ff" colors={['#6e54ff']} />
        }
      >
        {/* Header */}
        <View className="px-4 pt-12">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-bold text-foreground">Messages</Text>
              <Text className="mt-0.5 text-sm text-muted-foreground">
                Stay in sync with your circle
              </Text>
            </View>
            <PusherStatus compact showDetails />
          </View>
        </View>

        {/* Search */}
        <View className="mt-5 px-4">
          <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
            <Icon as={Search} size={20} className="text-muted-foreground" />
            <TextInput
              placeholder="Search messages"
              placeholderTextColor="#727285"
              className="flex-1 text-base text-foreground"
            />
          </View>
        </View>

        {/* Conversations */}
        <View className="mt-5 px-4 pb-28">
          {isLoading && chats.length === 0 ? (
            <LoadingSpinner />
          ) : chats.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              message="No conversations yet"
              subtitle="Start chatting with someone to see your messages here."
            />
          ) : (
            chats.map((chat: Chat) => (
              <ChatCard
                key={chat.id}
                id={chat.id}
                participant={{
                  avatar: chat.otherParticipant?.avatar,
                  name: chat.otherParticipant?.name,
                  username: chat.otherParticipant?.username || 'unknown',
                }}
                lastMessage={chat.lastMessage ? {
                  content: chat.lastMessage,
                  timestamp: chat.lastMessageAt || new Date().toISOString(),
                  isRead: true,
                } : undefined}
                unreadCount={0}
                onPress={() => router.push(`/chats/${chat.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating New Message Button */}
      <TouchableOpacity 
        onPress={() => setShowNewMessageModal(true)}
        activeOpacity={0.85}
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-glow"
      >
        <Icon as={Plus} size={24} className="text-primary-foreground" />
      </TouchableOpacity>

      {/* New Message Modal */}
      <Modal
        visible={showNewMessageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewMessageModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="h-[85%] rounded-t-3xl border-t border-border bg-card">
            {/* Handle */}
            <View className="items-center pt-3">
              <View className="h-1 w-10 rounded-full bg-border" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pb-4 pt-3">
              <Text className="text-lg font-bold text-foreground">New Message</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowNewMessageModal(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                activeOpacity={0.8}
                className="h-9 w-9 items-center justify-center rounded-full bg-secondary active:bg-accent"
              >
                <Icon as={X} size={18} className="text-foreground" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="px-4 pb-2">
              <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
                <Icon as={Search} size={20} className="text-muted-foreground" />
                <TextInput
                  placeholder="Search users..."
                  value={searchQuery}
                  onChangeText={handleSearch}
                  placeholderTextColor="#727285"
                  className="flex-1 text-base text-foreground"
                  autoFocus
                />
              </View>
            </View>

            {/* Search Results */}
            <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
              {isSearching ? (
                <View className="items-center py-10">
                  <ActivityIndicator size="large" color="#6e54ff" />
                </View>
              ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
                <View className="items-center py-10">
                  <Text className="text-muted-foreground">No users found</Text>
                </View>
              ) : searchQuery.length < 2 ? (
                <View className="items-center py-10">
                  <Text className="text-center text-sm text-muted-foreground">
                    Search for users to start a conversation
                  </Text>
                </View>
              ) : (
                searchResults.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    onPress={() => handleSelectUser(user)}
                    disabled={isCreatingChat}
                    activeOpacity={0.8}
                    className="mb-2 flex-row items-center gap-3 rounded-2xl border border-border bg-background p-3 active:bg-secondary"
                  >
                    <Avatar
                      uri={user.avatar}
                      name={user.name}
                      username={user.username}
                      size="md"
                    />
                    <View className="flex-1">
                      <Text className="font-semibold text-foreground">{user.name || user.username}</Text>
                      <Text className="text-sm text-muted-foreground">@{user.username}</Text>
                    </View>
                    <Icon as={Plus} size={18} className="text-primary" />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
