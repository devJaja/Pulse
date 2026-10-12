import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Search } from 'lucide-react-native';
import { router } from 'expo-router';

const contacts = [
  {
    id: '1',
    name: 'NFT Creator',
    handle: '@nftcreator',
    status: 'active',
    onApp: true,
  },
  {
    id: '2',
    name: 'NFT Creator',
    handle: '@nftcreator',
    status: 'active',
    onApp: true,
  },
  {
    id: '3',
    name: 'NFT Creator',
    handle: '@nftcreator',
    status: 'invite',
    onApp: false,
  },
  {
    id: '4',
    name: 'NFT Creator',
    handle: '@nftcreator',
    status: 'invite',
    onApp: false,
  },
];

export default function ContactsScreen() {
  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header */}
        <View className="px-4 pt-12">
          <Text className="text-3xl font-bold">Pay from Contacts</Text>
        </View>

        {/* Search */}
        <View className="mt-6 px-4">
          <View className="flex-row items-center gap-3 rounded-2xl border-2 border-border bg-background px-4 py-3">
            <Icon as={Search} size={20} className="text-muted-foreground" />
            <TextInput
              placeholder="Search contacts"
              placeholderTextColor="#727285"
              className="flex-1 text-base text-foreground"
            />
          </View>
        </View>

        {/* On the App */}
        <View className="mt-6 px-4">
          <Text className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            ON THE APP
          </Text>
          <View className="gap-3">
            {contacts
              .filter((c) => c.onApp)
              .map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  onPress={() => router.push('/wallet/send')}
                  className="flex-row items-center justify-between rounded-2xl bg-card p-4"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="h-12 w-12 rounded-full bg-purple-200" />
                    <View>
                      <Text className="font-semibold">{contact.name}</Text>
                      <Text className="text-sm text-muted-foreground">{contact.handle}</Text>
                    </View>
                  </View>
                  <View className="rounded-full bg-success/10 px-3 py-1">
                    <Text className="text-xs font-semibold text-success">Active</Text>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        </View>

        {/* Not on the App */}
        <View className="mt-6 px-4 pb-6">
          <Text className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            NOT ON THE APP
          </Text>
          <View className="gap-3">
            {contacts
              .filter((c) => !c.onApp)
              .map((contact) => (
                <View
                  key={contact.id}
                  className="flex-row items-center justify-between rounded-2xl bg-card p-4"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="h-12 w-12 rounded-full bg-gray-200" />
                    <View>
                      <Text className="font-semibold">{contact.name}</Text>
                      <Text className="text-sm text-muted-foreground">{contact.handle}</Text>
                    </View>
                  </View>
                  <TouchableOpacity className="rounded-full bg-purple-100 px-4 py-2">
                    <Text className="text-sm font-semibold text-purple-600">Invite</Text>
                  </TouchableOpacity>
                </View>
              ))}
          </View>

          {/* Note */}
          <View className="mt-6 rounded-2xl bg-purple-50 p-4">
            <View className="flex-row gap-2">
              <Text className="text-xl">⭐</Text>
              <View className="flex-1">
                <Text className="font-semibold text-purple-900">Note:</Text>
                <Text className="mt-1 text-sm text-purple-700">
                  You can send payments to anyone. They&apos;ll receive a notification to claim their
                  funds by creating an account.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
