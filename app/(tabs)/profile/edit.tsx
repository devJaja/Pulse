import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
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
        <View className="flex-row items-center justify-between px-4 pt-12">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <Icon as={ArrowLeft} size={24} className="text-foreground" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold">Edit Profile</Text>
          </View>
          {hasChanges && (
            <View className="h-2 w-2 rounded-full bg-[#0e100f]" />
          )}
        </View>

        {/* Avatar */}
        <View className="mt-8 items-center">
          <View className="relative">
            {avatar ? (
              <Image 
                source={{ uri: avatar }} 
                className="h-32 w-32 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="h-32 w-32 items-center justify-center rounded-full bg-purple-200">
                <Text className="text-4xl font-bold text-purple-600">
                  {typedUser?.name?.charAt(0)?.toUpperCase() || typedUser?.username?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <TouchableOpacity 
              className="absolute bottom-0 right-0 h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg"
              onPress={() => setShowImageOptions(true)}
            >
              <Icon as={Camera} size={20} className="text-primary-foreground" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setShowImageOptions(true)}>
            <Text className="mt-3 text-sm font-medium text-purple-600">Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* User Info Card */}
        <View className="mx-4 mt-6 rounded-2xl bg-purple-50 p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-muted-foreground">Username</Text>
              <Text className="mt-1 text-lg font-bold text-purple-600">@{typedUser?.username}</Text>
            </View>
            <View className="rounded-full bg-purple-200 px-3 py-1">
              <Text className="text-xs font-medium text-purple-900">Read-only</Text>
            </View>
          </View>
          <Text className="mt-2 text-xs text-muted-foreground">
            Username cannot be changed
          </Text>
        </View>

        {/* Form */}
        <View className="mt-6 gap-4 px-4">
          {/* Name */}
          <View>
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-foreground">Display Name</Text>
              <Text className="text-xs text-muted-foreground">{name.length}/50</Text>
            </View>
            <View className={`rounded-2xl bg-card p-4 ${errors.name ? 'border-2 border-red-500' : ''}`}>
              <TextInput
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setErrors({ ...errors, name: '' });
                }}
                placeholder="Enter your display name"
                placeholderTextColor="#727285"
                className="text-base text-foreground"
                maxLength={50}
              />
            </View>
            {errors.name ? (
              <View className="mt-2 flex-row items-center gap-1">
                <Icon as={AlertCircle} size={14} className="text-red-500" />
                <Text className="text-sm text-red-500">{errors.name}</Text>
              </View>
            ) : (
              <Text className="mt-2 text-xs text-muted-foreground">
                This is how others will see your name
              </Text>
            )}
          </View>

          {/* Bio */}
          <View>
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-foreground">Bio</Text>
              <Text className="text-xs text-muted-foreground">{bio.length}/160</Text>
            </View>
            <View className={`rounded-2xl bg-card p-4 ${errors.bio ? 'border-2 border-red-500' : ''}`}>
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
                className="min-h-[100px] text-base text-foreground"
                maxLength={160}
              />
            </View>
            {errors.bio ? (
              <View className="mt-2 flex-row items-center gap-1">
                <Icon as={AlertCircle} size={14} className="text-red-500" />
                <Text className="text-sm text-red-500">{errors.bio}</Text>
              </View>
            ) : (
              <Text className="mt-2 text-xs text-muted-foreground">
                Write a short bio to tell others about yourself
              </Text>
            )}
          </View>

          {/* Email (Read-only) */}
          <View>
            <Text className="mb-2 text-sm font-semibold text-foreground">Email</Text>
            <View className="rounded-2xl bg-gray-100 p-4">
              <Text className="text-base text-muted-foreground">{typedUser?.email}</Text>
            </View>
            <View className="mt-2 flex-row items-center gap-1">
              <View className="h-1.5 w-1.5 rounded-full bg-success/100" />
              <Text className="text-xs text-muted-foreground">
                Verified • Email cannot be changed
              </Text>
            </View>
          </View>

          {/* Wallet Address (Read-only) */}
          <View>
            <Text className="mb-2 text-sm font-semibold text-foreground">Wallet Address</Text>
            <View className="rounded-2xl bg-gray-100 p-4">
              <Text className="font-mono text-sm text-muted-foreground">
                {typedUser?.walletAddress?.slice(0, 20)}...{typedUser?.walletAddress?.slice(-20)}
              </Text>
            </View>
            <Text className="mt-2 text-xs text-muted-foreground">
              Your Monad wallet address (cannot be changed)
            </Text>
          </View>
        </View>

        {/* Account Stats */}
        <View className="mx-4 mt-6 rounded-2xl border-2 border-purple-200 bg-purple-50 p-4">
          <Text className="font-semibold text-purple-900">Account Statistics</Text>
          <View className="mt-3 flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-purple-600">{typedUser?.postsCount || 0}</Text>
              <Text className="text-xs text-muted-foreground">Posts</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-purple-600">{typedUser?.followersCount || 0}</Text>
              <Text className="text-xs text-muted-foreground">Followers</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-purple-600">{typedUser?.followingCount || 0}</Text>
              <Text className="text-xs text-muted-foreground">Following</Text>
            </View>
          </View>
        </View>

        <View className="h-6" />
      </ScrollView>

      {/* Action Buttons */}
      <View className="border-t border-border bg-background p-4">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 items-center rounded-2xl border-2 border-purple-600 py-4"
          >
            <Text className="text-lg font-semibold text-purple-600">Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSave}
            disabled={isUpdating || !hasChanges || isUploadingAvatar}
            className={`flex-1 items-center rounded-2xl py-4 ${
              isUpdating || !hasChanges || isUploadingAvatar ? 'bg-gray-300' : 'bg-primary'
            }`}
          >
            {isUpdating || isUploadingAvatar ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className={`text-lg font-semibold ${
                hasChanges ? 'text-primary-foreground' : 'text-gray-500'
              }`}>
                {isUploadingAvatar ? 'Uploading...' : 'Save Changes'}
              </Text>
            )}
          </TouchableOpacity>
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
          <View className="rounded-t-3xl bg-background pb-8">
            {/* Handle */}
            <View className="items-center py-4">
              <View className="h-1 w-12 rounded-full bg-gray-300" />
            </View>

            <Text className="px-6 text-xl font-bold">Change Profile Photo</Text>

            {/* Options */}
            <View className="mt-4">
              <TouchableOpacity
                onPress={() => pickImage(true)}
                className="flex-row items-center gap-4 border-b border-border px-6 py-5"
              >
                <View className="h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <Icon as={Camera} size={24} className="text-purple-600" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold">Take Photo</Text>
                  <Text className="text-sm text-muted-foreground">Use your camera</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => pickImage(false)}
                className="flex-row items-center gap-4 border-b border-border px-6 py-5"
              >
                <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Icon as={ImageIcon} size={24} className="text-blue-600" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold">Choose from Library</Text>
                  <Text className="text-sm text-muted-foreground">Select from your photos</Text>
                </View>
              </TouchableOpacity>

              {avatar && (
                <TouchableOpacity
                  onPress={removeAvatar}
                  className="flex-row items-center gap-4 border-b border-border px-6 py-5"
                >
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <Icon as={Trash2} size={24} className="text-red-600" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-red-600">Remove Photo</Text>
                    <Text className="text-sm text-muted-foreground">Use default avatar</Text>
                  </View>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => setShowImageOptions(false)}
                className="flex-row items-center justify-center gap-2 px-6 py-5"
              >
                <Icon as={X} size={20} className="text-muted-foreground" />
                <Text className="text-lg font-semibold text-muted-foreground">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
