import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isOwn: boolean;
  type?: 'text' | 'tip';
  tipAmount?: number;
}

export function MessageBubble({
  content,
  timestamp,
  isOwn,
  type = 'text',
  tipAmount,
}: MessageBubbleProps) {
  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: false });
    } catch {
      return '';
    }
  };

  const isTip = type === 'tip';

  return (
    <View className={`mb-3 flex-row ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <View
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 shadow-soft ${
          isTip
            ? 'rounded-bl-md border border-success/20 bg-success/10'
            : isOwn
            ? 'rounded-br-md bg-primary'
            : 'rounded-bl-md border border-border bg-secondary'
        }`}
      >
        {isTip && tipAmount !== undefined && (
          <Text className="mb-1 text-2xs font-semibold text-success">
            💰 Tip: {tipAmount} MON
          </Text>
        )}
        <Text
          className={`text-[15px] leading-5 ${
            isOwn && !isTip ? 'text-primary-foreground' : 'text-foreground'
          }`}
        >
          {content}
        </Text>
        <Text
          className={`mt-1 text-2xs ${
            isOwn && !isTip
              ? 'text-primary-foreground/70'
              : 'text-muted-foreground'
          }`}
        >
          {formatTime(timestamp)}
        </Text>
      </View>
    </View>
  );
}
