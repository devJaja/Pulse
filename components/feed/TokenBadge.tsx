import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Coins } from 'lucide-react-native';

interface TokenBadgeProps {
  isTokenized?: boolean;
}

export function TokenBadge({ isTokenized }: TokenBadgeProps) {
  if (!isTokenized) return null;

  return (
    <Badge
      variant="secondary"
      className="gap-1.5 self-start border-primary/15 bg-accent dark:border-primary/20 dark:bg-accent"
    >
      <Icon as={Coins} size={12} className="text-primary dark:text-brand-300" />
      <Text className="text-2xs font-semibold uppercase tracking-wide text-primary dark:text-brand-300">
        Tokenized
      </Text>
    </Badge>
  );
}
