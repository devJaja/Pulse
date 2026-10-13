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
          <Text className="text-3xl font-bold tracking-tight text-foreground">Pay from Contacts</Text>
        </View>

        {/* Search */}
        <View className="mt-6 px-4">
          <View className="flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-soft">
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
          <Text className="mb-3 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
            ON THE APP
          </Text>
          <View className="gap-3">
            {contacts
              .filter((c) => c.onApp)
              .map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  onPress={() => router.push('/wallet/send')}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft active:bg-accent/50"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Text className="text-base font-bold text-primary">
                        {contact.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text className="font-semibold text-card-foreground">{contact.name}</Text>
                      <Text className="text-sm text-muted-foreground">{contact.handle}</Text>
                    </View>
                  </View>
                  <View className="rounded-full bg-success/15 px-3 py-1">
                    <Text className="text-2xs font-semibold uppercase tracking-wide text-success">Active</Text>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        </View>

        {/* Not on the App */}
        <View className="mt-6 px-4 pb-8">
          <Text className="mb-3 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
            NOT ON THE APP
          </Text>
          <View className="gap-3">
            {contacts
              .filter((c) => !c.onApp)
              .map((contact) => (
                <View
                  key={contact.id}
                  className="flex-row items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Text className="text-base font-bold text-muted-foreground">
                        {contact.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text className="font-semibold text-card-foreground">{contact.name}</Text>
                      <Text className="text-sm text-muted-foreground">{contact.handle}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="rounded-full border border-primary/15 bg-accent px-4 py-2 active:bg-accent/70"
                  >
                    <Text className="text-sm font-semibold text-accent-foreground">Invite</Text>
                  </TouchableOpacity>
                </View>
              ))}
          </View>

          {/* Note */}
          <View className="mt-6 rounded-2xl border border-primary/15 bg-accent p-4">
            <View className="flex-row gap-3">
              <Text className="text-xl">⭐</Text>
              <View className="flex-1">
                <Text className="font-semibold text-accent-foreground">Note:</Text>
                <Text className="mt-1 text-sm leading-5 text-accent-foreground/80">
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
