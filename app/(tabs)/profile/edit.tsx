import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ArrowLeft, Camera, AlertCircle, X, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { toast } from 'sonner-native';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import type { User } from '@/types';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '@/lib/upload';

export default function EditProfileScreen() {
  const { user, isLoadingUser } = useAuth();
  const { updateProfile, isUpdating } = useProfile();
  const typedUser = user as User | undefined;

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState({ name: '', bio: '' });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (typedUser) {
      setName(typedUser.name || '');
      setBio(typedUser.bio || '');
      setAvatar(typedUser.avatar || null);
    }
  }, [typedUser]);

  // Track changes
  useEffect(() => {
    if (typedUser) {
      const nameChanged = name !== (typedUser.name || '');
      const bioChanged = bio !== (typedUser.bio || '');
      const avatarChanged = avatar !== (typedUser.avatar || null);
      setHasChanges(nameChanged || bioChanged || avatarChanged);
    }
  }, [name, bio, avatar, typedUser]);

  const validateInputs = () => {
    const newErrors = { name: '', bio: '' };
    let isValid = true;

    // Validate name
    if (name.trim() && name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    } else if (name.length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
      isValid = false;
    }

    // Validate bio
    if (bio.length > 160) {
      newErrors.bio = 'Bio must be less than 160 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      let result;

      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          toast.error('Camera permission is required');
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          toast.error('Photo library permission is required');
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setAvatar(result.assets[0].uri);
        setShowImageOptions(false);
        toast.success('Photo selected!');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      toast.error('Failed to pick image');
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    setShowImageOptions(false);
    toast.success('Photo removed');
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      return;
    }

    if (!hasChanges) {
      toast.info('No changes to save');
      return;
    }

    const updates: { name?: string; bio?: string; avatar?: string } = {};

    if (name.trim()) {
      updates.name = name.trim();
    }

    if (bio.trim()) {
      updates.bio = bio.trim();
    }

    // Upload avatar to Cloudinary if changed and is a local URI
    if (avatar !== (typedUser?.avatar || null)) {
      if (avatar && avatar.startsWith('file://')) {
        setIsUploadingAvatar(true);
        try {
          const uploadedUrl = await uploadImage(avatar);
          updates.avatar = uploadedUrl;
          toast.success('Avatar uploaded!');
        } catch (error) {
          toast.error('Failed to upload avatar');
          setIsUploadingAvatar(false);
          return;
        }
        setIsUploadingAvatar(false);
      } else {
        updates.avatar = avatar || '';
      }
    }

    updateProfile(updates);
    router.back();
  };

  if (isLoadingUser) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#6e54ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-14 pb-2">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={12}
              className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-soft active:bg-secondary"
            >
              <Icon as={ArrowLeft} size={20} className="text-foreground" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold tracking-tight text-foreground">Edit Profile</Text>
          </View>
          {hasChanges && <View className="h-2 w-2 rounded-full bg-primary" />}
        </View>

        {/* Avatar */}
        <View className="mt-8 items-center">
          <View className="relative">
            <Avatar
              uri={avatar}
              name={typedUser?.name}
              username={typedUser?.username}
              size="2xl"
              className="border-4 border-card shadow-card"
            />
            <TouchableOpacity
              className="absolute bottom-0 right-0 h-10 w-10 items-center justify-center rounded-full border-2 border-card bg-primary shadow-soft active:bg-primary/90"
              onPress={() => setShowImageOptions(true)}
            >
              <Icon as={Camera} size={18} className="text-primary-foreground" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setShowImageOptions(true)}>
            <Text className="mt-3 text-sm font-semibold text-primary">Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* User Info Card */}
        <View className="mx-4 mt-6 rounded-2xl border border-border bg-secondary p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                Username
              </Text>
              <Text className="mt-1 text-lg font-bold text-primary">@{typedUser?.username}</Text>
            </View>
            <View className="rounded-full border border-border bg-card px-3 py-1">
              <Text className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                Read-only
              </Text>
            </View>
          </View>
          <Text className="mt-2 text-2xs text-muted-foreground">Username cannot be changed</Text>
        </View>

        {/* Form */}
        <View className="mt-6 gap-5 px-4">
          {/* Name */}
          <View>
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-foreground">Display Name</Text>
              <Text className="text-2xs text-muted-foreground">{name.length}/50</Text>
            </View>
            <View
              className={`rounded-xl border-2 bg-card px-4 ${
                errors.name ? 'border-destructive' : 'border-border'
              }`}
            >
              <TextInput
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setErrors({ ...errors, name: '' });
                }}
                placeholder="Enter your display name"
                placeholderTextColor="#727285"
                className="py-3.5 text-base text-foreground"
                maxLength={50}
              />
            </View>
            {errors.name ? (
              <View className="mt-2 flex-row items-center gap-1">
                <Icon as={AlertCircle} size={14} className="text-destructive" />
                <Text className="text-2xs text-destructive">{errors.name}</Text>
              </View>
            ) : (
              <Text className="mt-2 text-2xs text-muted-foreground">
                This is how others will see your name
              </Text>
            )}
          </View>

          {/* Bio */}
          <View>
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-foreground">Bio</Text>
              <Text className="text-2xs text-muted-foreground">{bio.length}/160</Text>
            </View>
            <View
              className={`rounded-xl border-2 bg-card px-4 ${
                errors.bio ? 'border-destructive' : 'border-border'
              }`}
            >
              <TextInput
                value={bio}
                onChangeText={(text) => {
                  setBio(text);
                  setErrors({ ...errors, bio: '' });
                }}
                placeholder="Tell us about yourself"
                placeholderTextColor="#727285"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="min-h-[100px] py-3.5 text-base text-foreground"
                maxLength={160}
              />
            </View>
            {errors.bio ? (
              <View className="mt-2 flex-row items-center gap-1">
                <Icon as={AlertCircle} size={14} className="text-destructive" />
                <Text className="text-2xs text-destructive">{errors.bio}</Text>
              </View>
            ) : (
              <Text className="mt-2 text-2xs text-muted-foreground">
                Write a short bio to tell others about yourself
              </Text>
            )}
          </View>

          {/* Email (Read-only) */}
          <View>
            <Text className="mb-2 text-sm font-semibold text-foreground">Email</Text>
            <View className="rounded-xl border border-border bg-secondary px-4 py-3.5">
              <Text className="text-base text-muted-foreground">{typedUser?.email}</Text>
            </View>
            <View className="mt-2 flex-row items-center gap-1.5">
              <View className="h-1.5 w-1.5 rounded-full bg-success" />
              <Text className="text-2xs text-muted-foreground">
                Verified • Email cannot be changed
              </Text>
            </View>
          </View>

          {/* Wallet Address (Read-only) */}
          <View>
            <Text className="mb-2 text-sm font-semibold text-foreground">Wallet Address</Text>
            <View className="rounded-xl border border-border bg-secondary px-4 py-3.5">
              <Text className="font-mono text-sm text-muted-foreground">
                {typedUser?.walletAddress?.slice(0, 20)}...{typedUser?.walletAddress?.slice(-20)}
              </Text>
            </View>
            <Text className="mt-2 text-2xs text-muted-foreground">
              Your Monad wallet address (cannot be changed)
            </Text>
          </View>
        </View>

        {/* Account Stats */}
        <View className="mx-4 mt-6 rounded-2xl border border-border bg-accent p-4">
          <Text className="text-sm font-semibold text-accent-foreground">Account Statistics</Text>
          <View className="mt-4 flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">{typedUser?.postsCount || 0}</Text>
              <Text className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">
                Posts
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">{typedUser?.followersCount || 0}</Text>
              <Text className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">
                Followers
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">{typedUser?.followingCount || 0}</Text>
              <Text className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">
                Following
              </Text>
            </View>
          </View>
        </View>

        <View className="h-6" />
      </ScrollView>

      {/* Action Buttons */}
      <View className="border-t border-border bg-background p-4">
        <View className="flex-row gap-3">
          <Button variant="outline" className="flex-1" onPress={() => router.back()}>
            <Text>Cancel</Text>
          </Button>

          <Button
            className="flex-1"
            onPress={handleSave}
            disabled={isUpdating || !hasChanges || isUploadingAvatar}
          >
            {isUpdating || isUploadingAvatar ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text>Save Changes</Text>
            )}
          </Button>
        </View>
      </View>

      {/* Image Options Modal */}
      <Modal
        visible={showImageOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowImageOptions(false)}
          className="flex-1 justify-end bg-black/50"
        >
          <View className="rounded-t-3xl border-t border-border bg-card pb-8 shadow-elevated">
            <View className="items-center py-3">
              <View className="h-1 w-12 rounded-full bg-border" />
            </View>

            <Text className="px-6 text-xl font-bold text-foreground">Change Profile Photo</Text>

            <View className="mt-4">
              <TouchableOpacity
                onPress={() => pickImage(true)}
                className="flex-row items-center gap-4 px-6 py-4 active:bg-accent"
              >
                <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  <Icon as={Camera} size={22} className="text-primary" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">Take Photo</Text>
                  <Text className="text-2xs text-muted-foreground">Use your camera</Text>
                </View>
              </TouchableOpacity>

              <View className="mx-6 h-px bg-border" />

              <TouchableOpacity
                onPress={() => pickImage(false)}
                className="flex-row items-center gap-4 px-6 py-4 active:bg-accent"
              >
                <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  <Icon as={ImageIcon} size={22} className="text-primary" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">Choose from Library</Text>
                  <Text className="text-2xs text-muted-foreground">Select from your photos</Text>
                </View>
              </TouchableOpacity>

              {avatar && (
                <>
                  <View className="mx-6 h-px bg-border" />
                  <TouchableOpacity
                    onPress={removeAvatar}
                    className="flex-row items-center gap-4 px-6 py-4 active:bg-accent"
                  >
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                      <Icon as={Trash2} size={22} className="text-destructive" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-destructive">Remove Photo</Text>
                      <Text className="text-2xs text-muted-foreground">Use default avatar</Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}

              <View className="mx-6 h-px bg-border" />

              <TouchableOpacity
                onPress={() => setShowImageOptions(false)}
                className="flex-row items-center justify-center gap-2 px-6 py-4 active:bg-accent"
              >
                <Icon as={X} size={18} className="text-muted-foreground" />
                <Text className="text-base font-semibold text-muted-foreground">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
