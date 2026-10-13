import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { MoreVertical, Copy, UserPlus, UserMinus, MessageCircle } from 'lucide-react-native';
import { Link } from 'expo-router';
import { ProfileAvatar } from './ProfileAvatar';
import type { User } from '@/types';

interface ProfileCardProps {
  user: User;
  isOwnProfile: boolean;
  isFollowing?: boolean;
  isCreatingChat?: boolean;
  onMenuPress: () => void;
  onFollowToggle: () => void;
  onMessagePress: () => void;
  onCopyAddress: () => void;
}

export function ProfileCard({
  user,
  isOwnProfile,
  isFollowing = false,
  isCreatingChat = false,
  onMenuPress,
  onFollowToggle,
  onMessagePress,
  onCopyAddress,
}: ProfileCardProps) {
  return (
    <View className="mx-4 mt-4 rounded-2xl border border-border bg-card p-5 shadow-card">
      <View className="flex-row items-start justify-between">
        <ProfileAvatar
          avatar={user.avatar}
          name={user.name}
          username={user.username}
          size="large"
        />
        {isOwnProfile ? (
          <TouchableOpacity
            onPress={onMenuPress}
            hitSlop={12}
            className="h-9 w-9 items-center justify-center rounded-full bg-secondary active:bg-accent"
          >
            <Icon as={MoreVertical} size={20} className="text-foreground" />
          </TouchableOpacity>
        ) : (
          <View className="flex-row gap-2">
            <Button
              variant="secondary"
              size="icon"
              onPress={onMessagePress}
              disabled={isCreatingChat}
              className="rounded-full"
            >
              <Icon as={MessageCircle} size={18} className="text-foreground" />
            </Button>
            <Button
              variant={isFollowing ? 'secondary' : 'default'}
              size="sm"
              onPress={onFollowToggle}
              className="rounded-full"
            >
              <Icon
                as={isFollowing ? UserMinus : UserPlus}
                size={16}
                className={isFollowing ? 'text-foreground' : 'text-primary-foreground'}
              />
              <Text>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
            </Button>
          </View>
        )}
      </View>

      <View className="mt-4">
        <Text className="text-xl font-bold tracking-tight text-foreground">
          {user.name || user.username}
        </Text>
        <Text className="text-sm text-muted-foreground">@{user.username}</Text>
        <Text className="mt-2 text-sm leading-5 text-foreground">
          {user.bio || 'No bio yet'}
        </Text>
      </View>

      <View className="mt-5 flex-row items-center">
        <Link href={`/follows/${user.id}?tab=following`} asChild>
          <TouchableOpacity className="flex-1 items-center">
            <Text className="text-lg font-bold text-foreground">{user.followingCount || 0}</Text>
            <Text className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
              Following
            </Text>
          </TouchableOpacity>
        </Link>
        <View className="h-8 w-px bg-border" />
        <Link href={`/follows/${user.id}?tab=followers`} asChild>
          <TouchableOpacity className="flex-1 items-center">
            <Text className="text-lg font-bold text-foreground">{user.followersCount || 0}</Text>
            <Text className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
              Followers
            </Text>
          </TouchableOpacity>
        </Link>
        <View className="h-8 w-px bg-border" />
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-foreground">{user.postsCount || 0}</Text>
          <Text className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
            Posts
          </Text>
        </View>
      </View>

      <View className="mt-5 rounded-xl border border-border bg-secondary p-4">
        <Text className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
          Wallet Address
        </Text>
        <View className="mt-1.5 flex-row items-center justify-between">
          <Text className="font-mono text-base font-semibold text-foreground">
            {user.walletAddress?.slice(0, 8)}...{user.walletAddress?.slice(-4)}
          </Text>
          <TouchableOpacity
            onPress={onCopyAddress}
            hitSlop={12}
            className="h-8 w-8 items-center justify-center rounded-full bg-card active:bg-accent"
          >
            <Icon as={Copy} size={16} className="text-primary" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
