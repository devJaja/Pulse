import { cn } from '@/lib/utils';
import * as React from 'react';
import { TextInput, View, Text, Pressable } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import InputAccessoryViewButton from "./input-accessory-view-button";

interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, label, error, secureTextEntry, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
    const isPassword = secureTextEntry === true;
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
      <View className="gap-2">
        {label && <Text className="text-sm font-medium text-foreground">{label}</Text>}
        <View className="relative">
          <TextInput
            ref={ref}
            className={cn(
              'h-14 rounded-xl px-4 text-base border-2',
              'bg-background text-foreground',
              isFocused ? 'border-purple-600' : 'border-border',
              error && 'border-red-500',
              isPassword && 'pr-12',
              className
            )}
            placeholderTextColor={isDark ? '#565666' : '#727285'}
            secureTextEntry={isPassword && !isPasswordVisible}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
            inputAccessoryViewID={InputAccessoryViewButton.nativeID}
          />
          {isPassword && (
            <Pressable
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute right-4 top-0 h-14 justify-center"
            >
              {isPasswordVisible ? (
                <EyeOff size={20} color={isDark ? '#727285' : '#565666'} />
              ) : (
                <Eye size={20} color={isDark ? '#727285' : '#565666'} />
              )}
            </Pressable>
          )}
        </View>
        {error && <Text className="text-sm text-red-500">{error}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';

export { Input };
