import { View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, RefreshControl, Modal, Image, Switch } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, Send, DollarSign, X, Lock } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { useMessages, useChat } from '@/hooks/useChats';
import type { Message } from '@/types';
import { PusherStatus } from '@/components/PusherStatus';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: chat, isLoading: isLoadingChat } = useChat(id);
  const { messages, isLoading, refetch, sendMessage, isSendingMessage, sendTip, isSendingTip, sendPrivateTip, isSendingPrivateTip } = useMessages(id);
  const [message, setMessage] = useState('');
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState('');
  const [isPrivateTip, setIsPrivateTip] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || isSendingMessage) return;
    sendMessage({ content: message });
    setMessage('');
  };

  const handleSendTip = () => {
    const amount = parseFloat(tipAmount);
    if (!amount || amount <= 0 || isSendingTip || isSendingPrivateTip) return;
    if (isPrivateTip) {
      sendPrivateTip(amount);
    } else {
      sendTip(amount);
    }
    setTipAmount('');
    setShowTipModal(false);
  };

  const formatTime = (date: string) => {
    try {
      const msgDate = new Date(date);
      const hours = msgDate.getHours().toString().padStart(2, '0');
      const minutes = msgDate.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  const otherParticipant = chat?.otherParticipant;

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View className="flex-row items-center gap-3 border-b border-border px-4 pb-4 pt-12">
        <TouchableOpacity onPress={() => router.back()}>
          <Icon as={ArrowLeft} size={24} className="text-foreground" />
        </TouchableOpacity>
        {otherParticipant?.avatar ? (
          <Image 
            source={{ uri: otherParticipant.avatar }} 
            className="h-10 w-10 rounded-full"
          />
        ) : (
          <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-200 dark:bg-purple-900">
            <Text className="font-bold text-purple-600 dark:text-purple-300">
              {otherParticipant?.name?.charAt(0)?.toUpperCase() || otherParticipant?.username?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <View className="flex-1">
          <Text className="font-semibold">
            {otherParticipant?.name || otherParticipant?.username || 'Chat'}
          </Text>
          <Text className="text-sm text-muted-foreground">
            @{otherParticipant?.username || 'user'}
          </Text>
        </View>
        <PusherStatus compact />
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {isLoading && messages.length === 0 ? (
          <View className="items-center py-20">
            <ActivityIndicator size="large" color="#6e54ff" />
          </View>
        ) : messages.length === 0 ? (
          <View className="items-center py-20">
            <Text className="text-muted-foreground">No messages yet</Text>
            <Text className="mt-2 text-sm text-muted-foreground">Start the conversation!</Text>
          </View>
        ) : (
          messages.map((msg: Message) => (
            <View
              key={msg.id}
              className={`mb-4 ${msg.isMine ? 'items-end' : 'items-start'}`}
            >
              {msg.type === 'payment' ? (
                <View className="flex-row items-center gap-2">
                  {!msg.isMine && (
                    otherParticipant?.avatar ? (
                      <Image 
                        source={{ uri: otherParticipant.avatar }} 
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-200 dark:bg-purple-900">
                        <Text className="text-sm font-bold text-purple-600 dark:text-purple-300">
                          {otherParticipant?.name?.charAt(0)?.toUpperCase() || otherParticipant?.username?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                      </View>
                    )
                  )}
                  {msg.isPrivateTip ? (
                    <View className="rounded-2xl bg-purple-100 p-4 dark:bg-purple-900/30">
                      <View className="flex-row items-center gap-2">
                        <Icon as={Lock} size={16} className="text-purple-600" />
                        <Text className="font-semibold text-purple-600">
                          {msg.isMine ? 'Sent' : 'Received'} a private tip
                        </Text>
                      </View>
                      <Text className="mt-1 text-xs text-muted-foreground">
                        Amount encrypted via FHE · {formatTime(msg.createdAt)}
                      </Text>
                    </View>
                  ) : (
                    <View className="rounded-2xl bg-success/10 p-4">
                      <View className="flex-row items-center gap-2">
                        <Icon as={DollarSign} size={16} className="text-success" />
                        <Text className="font-semibold text-success">
                          {msg.isMine ? 'Sent' : 'Received'} {msg.paymentAmount} MON
                        </Text>
                      </View>
                      <Text className="mt-1 text-xs text-muted-foreground">{formatTime(msg.createdAt)}</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View className="flex-row items-end gap-2">
                  {!msg.isMine && (
                    otherParticipant?.avatar ? (
                      <Image 
                        source={{ uri: otherParticipant.avatar }} 
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-200 dark:bg-purple-900">
                        <Text className="text-sm font-bold text-purple-600 dark:text-purple-300">
                          {otherParticipant?.name?.charAt(0)?.toUpperCase() || otherParticipant?.username?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                      </View>
                    )
                  )}
                  <View
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      msg.isMine ? 'bg-primary' : 'bg-card'
                    }`}
                  >
                    <Text className={msg.isMine ? 'text-primary-foreground' : 'text-foreground'}>
                      {msg.content}
                    </Text>
                    <Text
                      className={`mt-1 text-xs ${
                        msg.isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Input */}
      <View className="flex-row items-center gap-3 border-t border-border p-4">
        <View className="flex-1 flex-row items-center gap-3 rounded-2xl bg-card px-4 py-3">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor="#727285"
            className="flex-1 text-base text-foreground"
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity onPress={() => setShowTipModal(true)}>
            <Icon as={DollarSign} size={20} className="text-purple-600" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          onPress={handleSendMessage}
          disabled={isSendingMessage || !message.trim()}
          className="h-14 w-14 items-center justify-center rounded-2xl bg-primary"
        >
          {isSendingMessage ? (
            <ActivityIndicator size="small" color="#6e54ff" />
          ) : (
            <Icon as={Send} size={20} className="text-primary-foreground" />
          )}
        </TouchableOpacity>
      </View>

      {/* Send Tip Modal */}
      <Modal
        visible={showTipModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTipModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="mx-4 w-full max-w-md rounded-3xl bg-background p-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-bold">Send Tip</Text>
              <TouchableOpacity onPress={() => setShowTipModal(false)}>
                <Icon as={X} size={24} className="text-foreground" />
              </TouchableOpacity>
            </View>

            {/* Amount */}
            <View className="mt-6">
              <Text className="mb-2 text-sm text-muted-foreground">Amount (MON)</Text>
              <View className="rounded-2xl bg-card p-4">
                <TextInput
                  value={tipAmount}
                  onChangeText={setTipAmount}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  className="text-2xl font-semibold text-foreground"
                />
              </View>
            </View>

            {/* Private tip toggle */}
            <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-card p-4">
              <View className="flex-1 pr-4">
                <View className="flex-row items-center gap-2">
                  <Icon as={Lock} size={16} className="text-purple-600" />
                  <Text className="font-semibold">Private Tip</Text>
                </View>
                <Text className="mt-0.5 text-xs text-muted-foreground">
                  Amount hidden on-chain via Encrypt FHE
                </Text>
              </View>
              <Switch
                value={isPrivateTip}
                onValueChange={setIsPrivateTip}
                trackColor={{ true: '#6e54ff' }}
              />
            </View>

            {/* Sending to */}
            <View className="mt-4 rounded-2xl bg-card p-4">
              <Text className="text-sm text-muted-foreground">Sending to</Text>
              <Text className="mt-1 text-xl font-bold">
                {otherParticipant?.name || otherParticipant?.username || 'User'}
              </Text>
              <Text className="text-sm text-muted-foreground">
                @{otherParticipant?.username || 'user'}
              </Text>
            </View>

            {/* Buttons */}
            <View className="mt-6 flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowTipModal(false)}
                className="flex-1 items-center rounded-2xl border-2 border-purple-600 py-4"
              >
                <Text className="text-lg font-semibold text-purple-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSendTip}
                disabled={!tipAmount || parseFloat(tipAmount) <= 0 || isSendingTip || isSendingPrivateTip}
                className={`flex-1 items-center rounded-2xl py-4 ${
                  tipAmount && parseFloat(tipAmount) > 0 ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                {(isSendingTip || isSendingPrivateTip) ? (
                  <ActivityIndicator size="small" color="#6e54ff" />
                ) : (
                  <Text className={`text-lg font-semibold ${tipAmount && parseFloat(tipAmount) > 0 ? 'text-primary-foreground' : 'text-gray-500'}`}>
                    {isPrivateTip ? 'Send Privately' : 'Send'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
