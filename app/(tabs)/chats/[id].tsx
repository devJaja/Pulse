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
      <View className="flex-row items-center gap-3 border-b border-border bg-card px-4 pb-4 pt-12">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          className="h-9 w-9 items-center justify-center rounded-full bg-secondary active:bg-accent"
        >
          <Icon as={ArrowLeft} size={20} className="text-foreground" />
        </TouchableOpacity>
        {otherParticipant?.avatar ? (
          <Image 
            source={{ uri: otherParticipant.avatar }} 
            className="h-10 w-10 rounded-full"
          />
        ) : (
          <View className="h-10 w-10 items-center justify-center rounded-full bg-accent">
            <Text className="font-bold text-primary">
              {otherParticipant?.name?.charAt(0)?.toUpperCase() || otherParticipant?.username?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <View className="flex-1">
          <Text className="text-[15px] font-semibold text-foreground" numberOfLines={1}>
            {otherParticipant?.name || otherParticipant?.username || 'Chat'}
          </Text>
          <Text className="text-2xs text-muted-foreground" numberOfLines={1}>
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
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#6e54ff" colors={['#6e54ff']} />
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
                <View className="flex-row items-end gap-2">
                  {!msg.isMine && (
                    otherParticipant?.avatar ? (
                      <Image 
                        source={{ uri: otherParticipant.avatar }} 
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <View className="h-8 w-8 items-center justify-center rounded-full bg-accent">
                        <Text className="text-xs font-bold text-primary">
                          {otherParticipant?.name?.charAt(0)?.toUpperCase() || otherParticipant?.username?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                      </View>
                    )
                  )}
                  {msg.isPrivateTip ? (
                    <View className="rounded-2xl rounded-bl-md border border-primary/20 bg-accent p-4 shadow-soft">
                      <View className="flex-row items-center gap-2">
                        <View className="h-6 w-6 items-center justify-center rounded-full bg-primary/15">
                          <Icon as={Lock} size={14} className="text-primary" />
                        </View>
                        <Text className="font-semibold text-primary">
                          {msg.isMine ? 'Sent' : 'Received'} a private tip
                        </Text>
                      </View>
                      <Text className="mt-1.5 text-2xs text-muted-foreground">
                        Amount encrypted via FHE · {formatTime(msg.createdAt)}
                      </Text>
                    </View>
                  ) : (
                    <View className="rounded-2xl rounded-bl-md border border-success/20 bg-success/10 p-4 shadow-soft">
                      <View className="flex-row items-center gap-2">
                        <View className="h-6 w-6 items-center justify-center rounded-full bg-success/15">
                          <Icon as={DollarSign} size={14} className="text-success" />
                        </View>
                        <Text className="font-semibold text-success">
                          {msg.isMine ? 'Sent' : 'Received'} {msg.paymentAmount} MON
                        </Text>
                      </View>
                      <Text className="mt-1.5 text-2xs text-muted-foreground">{formatTime(msg.createdAt)}</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View className="flex-row items-end gap-2">
                  {!msg.isMine && (
                    otherParticipant?.avatar ? (
                      <Image 
                        source={{ uri: otherParticipant.avatar }} 
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <View className="h-8 w-8 items-center justify-center rounded-full bg-accent">
                        <Text className="text-xs font-bold text-primary">
                          {otherParticipant?.name?.charAt(0)?.toUpperCase() || otherParticipant?.username?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                      </View>
                    )
                  )}
                  <View
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 shadow-soft ${
                      msg.isMine
                        ? 'rounded-br-md bg-primary'
                        : 'rounded-bl-md border border-border bg-secondary'
                    }`}
                  >
                    <Text
                      className={`text-[15px] leading-5 ${
                        msg.isMine ? 'text-primary-foreground' : 'text-foreground'
                      }`}
                    >
                      {msg.content}
                    </Text>
                    <Text
                      className={`mt-1 text-2xs ${
                        msg.isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
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
      <View className="flex-row items-end gap-2 border-t border-border bg-background px-4 py-3">
        <View className="flex-1 flex-row items-center gap-2 rounded-3xl border border-border bg-card px-4 py-2">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor="#727285"
            className="flex-1 text-[15px] text-foreground"
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity
            onPress={() => setShowTipModal(true)}
            activeOpacity={0.8}
            className="h-7 w-7 items-center justify-center rounded-full bg-success/10"
          >
            <Icon as={DollarSign} size={16} className="text-success" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          onPress={handleSendMessage}
          disabled={isSendingMessage || !message.trim()}
          activeOpacity={0.85}
          className={`h-12 w-12 items-center justify-center rounded-full ${
            message.trim() && !isSendingMessage ? 'bg-primary shadow-glow' : 'bg-secondary'
          }`}
        >
          {isSendingMessage ? (
            <ActivityIndicator size="small" color="#6e54ff" />
          ) : (
            <Icon
              as={Send}
              size={20}
              className={message.trim() ? 'text-primary-foreground' : 'text-muted-foreground'}
            />
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
        <View className="flex-1 items-center justify-center bg-black/50 px-4">
          <View className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-elevated">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-foreground">Send Tip</Text>
              <TouchableOpacity
                onPress={() => setShowTipModal(false)}
                activeOpacity={0.8}
                className="h-9 w-9 items-center justify-center rounded-full bg-secondary active:bg-accent"
              >
                <Icon as={X} size={18} className="text-foreground" />
              </TouchableOpacity>
            </View>

            {/* Amount */}
            <View className="mt-6">
              <Text className="mb-2 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">Amount (MON)</Text>
              <View className="rounded-2xl border border-border bg-background p-4">
                <TextInput
                  value={tipAmount}
                  onChangeText={setTipAmount}
                  placeholder="0.00"
                  placeholderTextColor="#727285"
                  keyboardType="decimal-pad"
                  className="text-2xl font-semibold text-foreground"
                />
              </View>
            </View>

            {/* Private tip toggle */}
            <View className="mt-4 flex-row items-center justify-between rounded-2xl border border-border bg-background p-4">
              <View className="flex-1 pr-4">
                <View className="flex-row items-center gap-2">
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-primary/15">
                    <Icon as={Lock} size={14} className="text-primary" />
                  </View>
                  <Text className="font-semibold text-foreground">Private Tip</Text>
                </View>
                <Text className="mt-1 text-2xs text-muted-foreground">
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
            <View className="mt-4 rounded-2xl border border-border bg-background p-4">
              <Text className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">Sending to</Text>
              <Text className="mt-1 text-xl font-bold text-foreground">
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
                activeOpacity={0.85}
                className="flex-1 items-center rounded-xl border border-border bg-secondary py-3.5"
              >
                <Text className="text-lg font-semibold text-foreground">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSendTip}
                disabled={!tipAmount || parseFloat(tipAmount) <= 0 || isSendingTip || isSendingPrivateTip}
                activeOpacity={0.85}
                className={`flex-1 items-center rounded-xl py-3.5 ${
                  tipAmount && parseFloat(tipAmount) > 0 ? 'bg-primary shadow-glow' : 'bg-muted'
                }`}
              >
                {(isSendingTip || isSendingPrivateTip) ? (
                  <ActivityIndicator size="small" color="#6e54ff" />
                ) : (
                  <Text className={`text-lg font-semibold ${tipAmount && parseFloat(tipAmount) > 0 ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
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
