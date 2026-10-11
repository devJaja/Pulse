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

  return (
    <View className="flex-row items-center gap-2 border-t border-border bg-background p-4">
      {onTip && (
        <TouchableOpacity
          onPress={onTip}
          className="h-10 w-10 items-center justify-center rounded-full bg-success/10"
        >
          <Icon as={DollarSign} size={20} className="text-success" />
        </TouchableOpacity>
      )}

      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Type a message..."
        placeholderTextColor="#727285"
        multiline
        maxLength={500}
        className="flex-1 max-h-24 rounded-full border border-border bg-card px-4 py-2 text-foreground"
      />

      <TouchableOpacity
        onPress={handleSend}
        disabled={!message.trim() || isSending}
        className={`h-10 w-10 items-center justify-center rounded-full ${
          message.trim() && !isSending ? 'bg-primary' : 'bg-gray-300'
        }`}
      >
        <Icon as={Send} size={20} className="text-primary-foreground" />
      </TouchableOpacity>
    </View>
  );
}
