import { View, ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Search, Plus, X, User } from 'lucide-react-native';
import { router } from 'expo-router';
import { useChats } from '@/hooks/useChats';
import type { Chat } from '@/types';
import { PusherStatus } from '@/components/PusherStatus';
import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner-native';
import { ChatCard } from '@/components/chat';
import { Avatar } from '@/components/common';

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
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {/* Header */}
        <View className="px-4 pt-12">
          <View className="flex-row items-center justify-between">
            <Text className="text-3xl font-bold">Messages</Text>
            <PusherStatus compact showDetails />
          </View>
        </View>

        {/* Search */}
        <View className="mt-6 px-4">
          <View className="flex-row items-center gap-3 rounded-2xl border-2 border-border bg-background px-4 py-3">
            <Icon as={Search} size={20} className="text-muted-foreground" />
            <TextInput
              placeholder="Search messages"
              placeholderTextColor="#727285"
              className="flex-1 text-base text-foreground"
            />
          </View>
        </View>

        {/* Conversations */}
        <View className="mt-6 px-4 pb-6">
          {isLoading && chats.length === 0 ? (
            <View className="items-center py-20">
              <ActivityIndicator size="large" color="#6e54ff" />
            </View>
          ) : chats.length === 0 ? (
            <View className="items-center py-20">
              <Text className="text-muted-foreground">No conversations yet</Text>
              <Text className="mt-2 text-sm text-muted-foreground">Start chatting with someone!</Text>
            </View>
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
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
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
        <View className="flex-1 bg-black/50">
          <View className="mt-20 flex-1 rounded-t-3xl bg-background">
            {/* Header */}
            <View className="flex-row items-center justify-between border-b border-border p-4">
              <Text className="text-lg font-bold">New Message</Text>
              <TouchableOpacity onPress={() => {
                setShowNewMessageModal(false);
                setSearchQuery('');
                setSearchResults([]);
              }}>
                <Icon as={X} size={24} className="text-foreground" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="p-4">
              <View className="flex-row items-center gap-3 rounded-2xl border-2 border-border bg-background px-4 py-3">
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
            <ScrollView className="flex-1 px-4">
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
                  <Text className="text-muted-foreground">Search for users to start a conversation</Text>
                </View>
              ) : (
                searchResults.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    onPress={() => handleSelectUser(user)}
                    disabled={isCreatingChat}
                    className="flex-row items-center gap-3 border-b border-border py-4"
                  >
                    <Avatar
                      uri={user.avatar}
                      name={user.name}
                      username={user.username}
                      size="md"
                    />
                    <View className="flex-1">
                      <Text className="font-semibold">{user.name || user.username}</Text>
                      <Text className="text-sm text-muted-foreground">@{user.username}</Text>
                    </View>
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
