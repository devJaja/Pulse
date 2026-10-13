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

  const canSubmit = !!content.trim() && !isSubmitting;

  return (
    <View className="border-t border-border bg-background p-4">
      {/* Reply Indicator */}
      {replyingTo && (
        <View className="mb-2.5 flex-row items-center justify-between rounded-xl border border-primary/15 bg-accent px-3 py-2">
          <Text className="text-sm font-medium text-primary dark:text-brand-300">
            Replying to @{replyingTo}
          </Text>
          <TouchableOpacity
            onPress={onCancelReply}
            accessibilityRole="button"
            accessibilityLabel="Cancel reply"
            className="h-7 w-7 items-center justify-center rounded-full active:bg-primary/10"
          >
            <Icon as={X} size={16} className="text-primary dark:text-brand-300" />
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder={replyingTo ? `Reply to @${replyingTo}` : placeholder}
        placeholderTextColor="#727285"
        multiline
        className="min-h-[48px] rounded-xl border border-border bg-card px-4 py-3 text-[15px] leading-5 text-foreground"
        style={{ textAlignVertical: 'top' }}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!canSubmit}
        accessibilityRole="button"
        accessibilityLabel={replyingTo ? 'Post reply' : 'Post comment'}
        className={`mt-3 h-12 items-center justify-center rounded-xl ${
          canSubmit ? 'bg-primary shadow-soft active:opacity-90' : 'bg-muted'
        }`}
      >
        <Text
          className={`text-[15px] font-semibold ${
            canSubmit ? 'text-primary-foreground' : 'text-muted-foreground'
          }`}
        >
          {isSubmitting ? 'Posting...' : replyingTo ? 'Post Reply' : 'Post Comment'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
