import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'nativewind';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

const ITEM_MIN_HEIGHT = 52;
const EDGE_PADDING = 12;

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const ACTIVE = isDark ? '#9a8cff' : '#6e54ff';
  const INACTIVE = isDark ? '#8a8a99' : '#727285';

  const routes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return (
      options.tabBarItemStyle &&
      StyleSheet.flatten(options.tabBarItemStyle)?.display === 'none'
        ? false
        : true
    );
  });

  const bottomInset = Math.max(insets.bottom, 14);

  return (
    <View
      accessibilityRole="tablist"
      className="w-full flex-row items-stretch border-t border-border bg-card"
      style={[
        styles.bar,
        {
          paddingBottom: bottomInset,
          paddingTop: 8,
          paddingLeft: Math.max(insets.left, EDGE_PADDING),
          paddingRight: Math.max(insets.right, EDGE_PADDING),
        },
      ]}
    >
      {routes.map((route) => {
        const { options } = descriptors[route.key];
        const isFocused = state.routes[state.index]?.key === route.key;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (isFocused || !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : options.title ?? route.name;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <View
              className={cn(
                'h-8 items-center justify-center rounded-full px-4',
                isFocused && 'bg-primary/10 dark:bg-primary/20'
              )}
            >
              {options.tabBarIcon?.({
                focused: isFocused,
                color: isFocused ? ACTIVE : INACTIVE,
                size: 22,
              })}
            </View>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className={cn(
                'mt-1 w-full text-center text-3xs leading-4',
                isFocused ? 'font-bold text-primary' : 'font-medium text-muted-foreground'
              )}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    alignSelf: 'stretch',
    justifyContent: 'space-around',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
  item: {
    flex: 1,
    alignItems: 'center',
    minHeight: ITEM_MIN_HEIGHT,
  },
  itemPressed: {
    opacity: 0.6,
  },
});
