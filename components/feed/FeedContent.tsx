import { Text } from '@/components/ui/text';

interface FeedContentProps {
  content: string;
  numberOfLines?: number;
}

export function FeedContent({ content, numberOfLines }: FeedContentProps) {
  return (
    <Text
      className="mb-3 text-[15px] leading-[22px] text-foreground"
      numberOfLines={numberOfLines}
    >
      {content}
    </Text>
  );
}
