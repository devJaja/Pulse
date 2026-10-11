import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import * as React from 'react';
import { View, KeyboardAvoidingView, Platform, Pressable, ScrollView, Image, TextInput } from 'react-native';
import { toast } from 'sonner-native';

const AVATAR_OPTIONS = [
  require('@/assets/images/icon.png'),
  require('@/assets/images/icon.png'),
  require('@/assets/images/icon.png'),
  require('@/assets/images/icon.png'),
  require('@/assets/images/icon.png'),
];

export default function SignUpScreen() {
  const [fullName, setFullName] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [selectedAvatar, setSelectedAvatar] = React.useState<number | null>(null);

  const handleSetup = async () => {
    // Profile setup is optional, just navigate to feed
    toast.success('Welcome to Pulse!');
    router.replace('/(tabs)/feed');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView className="flex-1 px-5 pt-16" showsVerticalScrollIndicator={false}>
        <Text className="mb-2 text-3xl font-bold text-foreground">Create an Account</Text>
        <Text className="mb-8 text-base text-muted-foreground">Fill in the details below to get started.</Text>

        <View className="gap-6">
          <Input label="Full Name (Optional)" placeholder="e.g John Doe" value={fullName} onChangeText={setFullName} />

          <View>
            <Text className="mb-2 text-sm font-medium text-foreground">Bio (Optional)</Text>
            <TextInput
              placeholder="Tell us about yourself..."
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="h-24 rounded-xl bg-card px-4 py-3 text-base text-foreground"
              placeholderTextColor="#727285"
            />
          </View>

          <View>
            <Text className="mb-3 text-sm font-medium text-foreground">Profile Picture (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
              <Pressable
                onPress={() => setSelectedAvatar(null)}
                className={`mr-3 h-16 w-16 items-center justify-center rounded-2xl ${
                  selectedAvatar === null ? 'bg-purple-100 dark:bg-purple-900' : 'bg-muted'
                }`}
              >
                <Image
                  source={require('@/assets/images/icon.png')}
                  className="h-8 w-8"
                  style={{ tintColor: selectedAvatar === null ? '#6e54ff' : '#727285' }}
                />
              </Pressable>
              {AVATAR_OPTIONS.map((avatar, index) => (
                <Pressable
                  key={index}
                  onPress={() => setSelectedAvatar(index)}
                  className={`mr-3 h-16 w-16 overflow-hidden rounded-2xl ${
                    selectedAvatar === index ? 'border-2 border-purple-600' : ''
                  }`}
                >
                  <Image source={avatar} className="h-full w-full" />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      <View className="px-5 pb-12">
        <Button
          onPress={handleSetup}
          className="mb-4 h-14 rounded-2xl bg-primary active:bg-primary/90"
        >
          <Text className="text-base font-medium text-primary-foreground">Setup and Continue</Text>
        </Button>

        <Pressable onPress={handleBack}>
          <Text className="text-center text-base font-medium text-purple-600">Back</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
