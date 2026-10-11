import { View, TextInput, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { X } from 'lucide-react-native';
import { useState } from 'react';
import { toast } from 'sonner-native';

interface CommentInputProps {
  onSubmit: (content: string) => void;
  isSubmitting: boolean;
  placeholder?: string;
  replyingTo?: string;
  onCancelReply?: () => void;
}

export function CommentInput({
  onSubmit,
  isSubmitting,
  placeholder = 'Add a comment...',
  replyingTo,
  onCancelReply,
}: CommentInputProps) {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    onSubmit(content.trim());
    setContent('');
  };

  return (
    <View className="border-t border-border bg-background p-4">
      {/* Reply Indicator */}
      {replyingTo && (
        <View className="mb-2 flex-row items-center justify-between rounded-lg bg-purple-50 px-3 py-2 dark:bg-purple-950/30">
          <Text className="text-sm text-purple-600">
            Replying to @{replyingTo}
          </Text>
          <TouchableOpacity onPress={onCancelReply}>
            <Icon as={X} size={16} className="text-purple-600" />
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder={replyingTo ? `Reply to @${replyingTo}...` : placeholder}
        placeholderTextColor="#727285"
        multiline
        maxLength={500}
        className="mb-3 min-h-[80px] rounded-lg border border-border bg-card px-4 py-3 text-foreground"
        style={{ textAlignVertical: 'top' }}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!content.trim() || isSubmitting}
        className={`rounded-xl py-3 ${
          content.trim() && !isSubmitting ? 'bg-primary' : 'bg-gray-300'
        }`}
      >
        <Text className="text-center font-semibold text-primary-foreground">
          {isSubmitting ? 'Posting...' : replyingTo ? 'Post Reply' : 'Post Comment'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
