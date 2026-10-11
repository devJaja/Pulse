import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Appearance } from 'react-native';
import { Text } from '@/components/ui/text';
import { useThemeStore, resolveTheme } from '@/store/useThemeStore';

const GOLD = '#6e54ff';
const NAVY = '#6e54ff';
const MUTED = '#727285';

const PILL_HEIGHT = 28;
const ITEM_MIN_HEIGHT = 52;
const EDGE_PADDING = 12;

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() =>
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => subscription.remove();
  }, []);

  const isDark = resolveTheme(theme === 'system' ? systemTheme : theme) === 'dark';

  // `pay` and `notifications` are reachable from elsewhere in the app, so they are
  // hidden from the bar via `href: null` (expo-router mirrors that as
  // `tabBarItemStyle: { display: 'none' }`). Skip both ways so they never take a slot.
  const routes = useMemo(
    () =>
      state.routes.filter((route) => {
        const options = descriptors[route.key]?.options as
          | { href?: string | null }
          | undefined;
        if (options?.href === null) return false;
        return (
          StyleSheet.flatten(descriptors[route.key]?.options.tabBarItemStyle)?.display !==
          'none'
        );
      }),
    [state.routes, descriptors]
  );

  // Never let the bottom padding collapse to 0 on devices with gesture navigation or a
  // 3-button system bar, otherwise the icons and labels slide underneath the system UI.
  // Mirrors the web bar's pt-2 / pb-4 rhythm (16px minimum bottom clearance).
  const bottomInset = Math.max(insets.bottom, 16);

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.bar,
        {
          backgroundColor: isDark ? '#151518' : '#FFFFFF',
          borderTopColor: isDark ? '#26262B' : '#E6E6E6',
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
            onLongPress={() =>
              navigation.emit({ type: 'tabLongPress', target: route.key })
            }
            style={({ pressed }) => [
              styles.item,
              pressed && styles.itemPressed,
              pressed && {
                backgroundColor: isDark ? '#1E1E24' : 'rgba(0, 0, 0, 0.05)',
              },
            ]}
          >
            <View style={[styles.iconPill, isFocused && styles.iconPillActive]}>
              {options.tabBarIcon?.({
                focused: isFocused,
                color: isFocused ? NAVY : MUTED,
                size: 22,
              })}
            </View>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className={
                isFocused
                  ? isDark
                    ? 'mt-1 w-full text-center text-[11px] font-bold leading-4 text-white'
                    : 'mt-1 w-full text-center text-[11px] font-bold leading-4 text-brand-700'
                  : 'mt-1 w-full text-center text-[11px] font-medium leading-4 text-gray-500'
              }
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
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    ...Platform.select({ android: { elevation: 16 } }),
  },
  item: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    minHeight: ITEM_MIN_HEIGHT,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderRadius: 14,
  },
  itemPressed: {
    opacity: 0.6,
  },
  iconPill: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    height: PILL_HEIGHT,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconPillActive: {
    backgroundColor: GOLD,
  },
});
