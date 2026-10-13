import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { Compass } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 items-center justify-center bg-background px-6">
        <View className="w-full max-w-sm items-center rounded-2xl border border-border bg-card p-8 shadow-soft">
          <View className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-accent">
            <Icon as={Compass} size={30} className="text-primary" strokeWidth={1.8} />
          </View>
          <Text className="mb-2 text-2xl font-bold tracking-tight text-foreground">
            Page not found
          </Text>
          <Text className="mb-8 text-center text-sm leading-5 text-muted-foreground">
            This screen doesn&apos;t exist or may have been moved.
          </Text>
          <Link href="/" asChild>
            <Button className="h-12 w-full rounded-xl bg-primary active:bg-primary/90">
              <Text className="text-base font-medium text-primary-foreground">
                Go to home screen
              </Text>
            </Button>
          </Link>
        </View>
      </View>
    </>
  );
}
