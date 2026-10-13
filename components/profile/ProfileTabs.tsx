import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';

interface ProfileTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ProfileTabs({ tabs, activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <View className="mt-4 bg-background">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
        <View className="flex-row gap-2 py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => onTabChange(tab)}
                className={`rounded-full border px-5 py-2.5 ${
                  isActive ? 'border-primary bg-primary shadow-soft' : 'border-border bg-card'
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
