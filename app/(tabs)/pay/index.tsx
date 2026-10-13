import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowUpRight, ArrowDownLeft, QrCode, Users, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';

const quickActions = [
  {
    id: '1',
    title: 'Scan QR Code',
    description: 'Pay with camera',
    icon: QrCode,
    route: '/pay/scan',
    color: 'bg-primary/10',
  },
  {
    id: '2',
    title: 'Pay from Contacts',
    description: 'Choose from your network',
    icon: Users,
    route: '/pay/contacts',
    color: 'bg-primary/10',
  },
];

export default function PayScreen() {
  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header */}
        <View className="px-4 pt-12">
          <Text className="text-3xl font-bold tracking-tight text-foreground">Pay</Text>
        </View>

        {/* Send or Receive */}
        <View className="mt-6 px-4">
          <Text className="mb-4 text-muted-foreground">Send or receive money instantly</Text>
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => router.push('/wallet/send')}
              activeOpacity={0.85}
              className="flex-1 rounded-3xl bg-primary p-6 shadow-glow active:bg-primary/90"
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-white/15">
                <Icon as={ArrowUpRight} size={24} className="text-primary-foreground" />
              </View>
              <Text className="mt-4 text-xl font-bold text-primary-foreground">Send</Text>
              <Text className="mt-1 text-sm text-primary-foreground/70">Transfer to anyone</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/wallet/receive')}
              activeOpacity={0.85}
              className="flex-1 rounded-3xl border border-border bg-card p-6 shadow-soft active:bg-accent"
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-accent">
                <Icon as={ArrowDownLeft} size={24} className="text-primary" />
              </View>
              <Text className="mt-4 text-xl font-bold text-card-foreground">Receive</Text>
              <Text className="mt-1 text-sm text-muted-foreground">Get paid easily</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mt-8 px-4 pb-6">
          <Text className="mb-4 text-xl font-bold text-foreground">Quick Actions</Text>
          <View className="gap-3">
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.7}
                className="flex-row items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft active:bg-accent/50"
              >
                <View className={`h-11 w-11 items-center justify-center rounded-full ${action.color}`}>
                  <Icon as={action.icon} size={22} className="text-primary" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-card-foreground">{action.title}</Text>
                  <Text className="text-sm text-muted-foreground">{action.description}</Text>
                </View>
                <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
