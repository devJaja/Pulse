import { View, TextInput, TouchableOpacity } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Send, DollarSign } from 'lucide-react-native';
import { useState } from 'react';

interface MessageInputProps {
  onSend: (message: string) => void;
  onTip?: () => void;
  isSending: boolean;
}

export function MessageInput({ onSend, onTip, isSending }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim() || isSending) return;
    onSend(message.trim());
    setMessage('');
  };

  const canSend = message.trim().length > 0 && !isSending;

  return (
    <View className="flex-row items-end gap-2 border-t border-border bg-background px-4 py-3">
      {onTip && (
        <TouchableOpacity
          onPress={onTip}
          activeOpacity={0.8}
          className="h-11 w-11 items-center justify-center rounded-full border border-border bg-card active:bg-secondary"
        >
          <Icon as={DollarSign} size={20} className="text-success" />
        </TouchableOpacity>
      )}

      <View className="flex-1 flex-row items-end rounded-3xl border border-border bg-card px-4 py-2">
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#727285"
          multiline
          maxLength={500}
          className="max-h-24 flex-1 text-[15px] text-foreground"
        />
      </View>

      <TouchableOpacity
        onPress={handleSend}
        disabled={!canSend}
        activeOpacity={0.85}
        className={`h-11 w-11 items-center justify-center rounded-full ${
          canSend ? 'bg-primary shadow-glow' : 'bg-secondary'
        }`}
      >
        <Icon
          as={Send}
          size={20}
          className={canSend ? 'text-primary-foreground' : 'text-muted-foreground'}
        />
      </TouchableOpacity>
    </View>
  );
}
