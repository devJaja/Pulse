import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';

interface ProfileTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ProfileTabs({ tabs, activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <View className="mt-6 bg-background">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-2">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => onTabChange(tab)}
            className={`mr-2 rounded-full px-6 py-3 ${
              activeTab === tab ? 'bg-primary' : 'bg-card'
            }`}
          >
            <Text
              className={`font-semibold ${
                activeTab === tab ? 'text-[#6e54ff]' : 'text-foreground'
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
