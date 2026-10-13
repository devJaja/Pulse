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
      <ScrollView className="flex-1 px-6 pt-16" showsVerticalScrollIndicator={false}>
        <Text className="mb-2 text-3xl font-bold tracking-tight text-foreground">Create an Account</Text>
        <Text className="mb-8 text-base leading-6 text-muted-foreground">Fill in the details below to get started.</Text>

        <View className="gap-6">
          <Input label="Full Name (Optional)" placeholder="e.g John Doe" value={fullName} onChangeText={setFullName} />

          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Bio (Optional)</Text>
            <TextInput
              placeholder="Tell us about yourself..."
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="h-28 rounded-xl border-2 border-border bg-background px-4 py-3 text-base text-foreground"
              placeholderTextColor="#727285"
            />
          </View>

          <View className="gap-3">
            <Text className="text-sm font-medium text-foreground">Profile Picture (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
              <Pressable
                onPress={() => setSelectedAvatar(null)}
                className={`mr-3 h-16 w-16 items-center justify-center rounded-2xl border-2 ${
                  selectedAvatar === null ? 'border-primary bg-accent' : 'border-border bg-muted'
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
                  className={`mr-3 h-16 w-16 overflow-hidden rounded-2xl border-2 ${
                    selectedAvatar === index ? 'border-primary' : 'border-border'
                  }`}
                >
                  <Image source={avatar} className="h-full w-full" />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      <View className="px-6 pb-12">
        <Button
          onPress={handleSetup}
          className="mb-3 h-14 rounded-2xl bg-primary shadow-soft active:bg-primary/90"
        >
          <Text className="text-base font-medium text-primary-foreground">Setup and Continue</Text>
        </Button>

        <Pressable onPress={handleBack} className="h-12 items-center justify-center">
          <Text className="text-center text-base font-medium text-primary">Back</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
