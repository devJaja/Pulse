import { Tabs } from 'expo-router';
import { Home, Wallet, Send, MessageCircle, User, Search, Bell } from 'lucide-react-native';
import { TabBar } from '@/components/navigation/TabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6e54ff',
        tabBarInactiveTintColor: '#727285',
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          href: '/(tabs)/wallet',
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="pay"
        options={{
          title: 'Pay',
          href: null,
          tabBarIcon: ({ color, size }) => <Send size={size} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          href: '/(tabs)/chats',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          href: '/(tabs)/profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          href: null,
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} strokeWidth={2.2} />,
        }}
      />
    </Tabs>
  );
}
