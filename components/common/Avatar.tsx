import { Avatar as UIAvatar } from '@/components/ui/avatar';

interface AvatarProps {
  uri?: string;
  name?: string;
  username?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  xs: 'xs',
  sm: 'sm',
  md: 'lg',
  lg: 'xl',
  xl: '2xl',
} as const;

export function Avatar({ uri, name, username, size = 'md' }: AvatarProps) {
  return <UIAvatar uri={uri} name={name} username={username} size={sizeMap[size]} />;
}
