import { Avatar } from '@/components/ui/avatar';

interface ProfileAvatarProps {
  avatar?: string;
  name?: string;
  username?: string;
  size?: 'small' | 'medium' | 'large';
}

const sizeMap = {
  small: 'sm',
  medium: 'lg',
  large: 'xl',
} as const;

const sizeClass = {
  small: 'h-10 w-10 text-sm',
  medium: 'h-16 w-16 text-xl',
  large: 'h-24 w-24 text-3xl',
} as const;

export function ProfileAvatar({ avatar, name, username, size = 'large' }: ProfileAvatarProps) {
  return (
    <Avatar
      uri={avatar}
      name={name}
      username={username}
      size={sizeMap[size]}
      className={`border border-border shadow-soft ${sizeClass[size]}`}
    />
  );
}
