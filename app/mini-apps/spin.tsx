import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Animated } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, Sparkles, TrendingUp } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState, useRef } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner-native';
import { api } from '@/lib/api';

const multipliers = [
  { value: 0, color: '#FF3F00', label: '0x' },
  { value: 1.5, color: '#6e54ff', label: '1.5x' },
  { value: 2, color: '#8270ff', label: '2x' },
  { value: 0.5, color: '#565666', label: '0.5x' },
  { value: 3, color: '#6e54ff', label: '3x' },
  { value: 1, color: '#b8b4fe', label: '1x' },
  { value: 5, color: '#8270FF', label: '5x' },
  { value: 0, color: '#FF3F00', label: '0x' },
];

export default function SpinScreen() {
  const { balance } = useWallet();
  const [betAmount, setBetAmount] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastMultiplier, setLastMultiplier] = useState<number | null>(null);
  const [totalWon, setTotalWon] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handleSpin = async () => {
    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error('Enter a valid bet amount');
      return;
    }

    if (parseFloat(betAmount) > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsSpinning(true);
    
    // Animate spin
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true,
    }).start();

    try {
      const response = await api.playSpin(parseFloat(betAmount));

      if (response.error) {
        toast.error(response.error);
        setIsSpinning(false);
        return;
      }

      const { multiplier, winAmount } = response.data as any;
      
      setTimeout(() => {
        setLastMultiplier(multiplier);
        setSpinCount(spinCount + 1);

        if (multiplier > 0) {
          toast.success(`${multiplier}x! You won ${winAmount.toFixed(4)} MON!`);
          setTotalWon(totalWon + winAmount);
        } else {
          toast.error('Better luck next time!');
        }

        setIsSpinning(false);
      }, 3000);
    } catch (error) {
      toast.error('Failed to spin. Please try again.');
      setIsSpinning(false);
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1800deg'],
  });

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="border-b border-border bg-card px-4 pb-5 pt-12">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-secondary active:opacity-70"
            >
              <Icon as={ArrowLeft} size={20} className="text-foreground" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold">Lucky Spin</Text>
              <Text className="mt-0.5 text-sm text-muted-foreground">
                Spin the wheel for big wins
              </Text>
            </View>
          </View>
        </View>

        {/* Hero */}
        <View className="mx-4 mt-5 items-center rounded-2xl bg-pink-600 p-6 shadow-soft">
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <View className="h-48 w-48 items-center justify-center rounded-full border-8 border-white/30 bg-white/10">
              {multipliers.map((mult, index) => {
                const angle = (360 / multipliers.length) * index;
                const radian = (angle * Math.PI) / 180;
                const radius = 60;
                const x = Math.cos(radian) * radius;
                const y = Math.sin(radian) * radius;

                return (
                  <View
                    key={index}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      marginLeft: x - 20,
                      marginTop: y - 20,
                    }}
                    className="h-10 w-10 items-center justify-center rounded-full"
                  >
                    <Text className="text-xs font-bold text-white">{mult.label}</Text>
                  </View>
                );
              })}
              <View className="absolute h-16 w-16 items-center justify-center rounded-full bg-white shadow-card">
                <Icon as={Sparkles} size={32} className="text-pink-600" />
              </View>
            </View>
          </Animated.View>
          <View className="mt-4 h-0 w-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
          <Text className="mt-2 text-center text-sm text-white/90">
            Spin to win up to 5x your bet!
          </Text>
        </View>

        {/* Stats */}
        <View className="mx-4 mt-4 flex-row gap-3">
          <View className="flex-1 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <View className="flex-row items-center gap-2">
              <Icon as={TrendingUp} size={16} className="text-pink-600 dark:text-pink-400" />
              <Text className="text-sm text-muted-foreground">Total Won</Text>
            </View>
            <Text className="mt-1.5 text-lg font-bold text-pink-600 dark:text-pink-400">
              {totalWon.toFixed(4)} MON
            </Text>
          </View>
          <View className="flex-1 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <View className="flex-row items-center gap-2">
              <Icon as={Sparkles} size={16} className="text-purple-600 dark:text-purple-300" />
              <Text className="text-sm text-muted-foreground">Spins</Text>
            </View>
            <Text className="mt-1.5 text-2xl font-bold text-purple-600 dark:text-purple-300">{spinCount}</Text>
          </View>
        </View>

        {/* Last Result */}
        {lastMultiplier !== null && (
          <View
            className={`mx-4 mt-4 rounded-2xl border p-6 ${
              lastMultiplier > 0
                ? 'border-success/20 bg-success/10'
                : 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/30'
            }`}
          >
            <Text className={`text-center text-sm ${lastMultiplier > 0 ? 'text-success' : 'text-red-600 dark:text-red-400'}`}>
              Last Spin
            </Text>
            <Text className={`text-center text-6xl font-bold ${lastMultiplier > 0 ? 'text-success' : 'text-red-600 dark:text-red-400'}`}>
              {lastMultiplier}x
            </Text>
            <Text className={`text-center text-sm ${lastMultiplier > 0 ? 'text-success' : 'text-red-600 dark:text-red-400'}`}>
              {lastMultiplier > 0 ? '🎉 Winner!' : '😢 Try Again'}
            </Text>
          </View>
        )}

        {/* Game Settings */}
        <View className="mx-4 mt-5">
          {/* Bet Amount */}
          <View className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <Text className="text-sm text-muted-foreground">Bet Amount (MON)</Text>
            <TextInput
              value={betAmount}
              onChangeText={setBetAmount}
              placeholder="0.1"
              keyboardType="decimal-pad"
              className="mt-2 text-2xl font-bold text-foreground"
              placeholderTextColor="#727285"
            />
            <Text className="mt-2 text-sm text-muted-foreground">
              Balance: {balance.toFixed(4)} MON
            </Text>
          </View>

          {/* Multipliers Info */}
          <View className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <Text className="mb-3 font-bold">Possible Multipliers</Text>
            <View className="flex-row flex-wrap gap-2">
              {[...new Set(multipliers.map(m => m.value))].sort((a, b) => b - a).map((mult) => (
                <View
                  key={mult}
                  className={`rounded-full px-3 py-1 ${
                    mult === 5 ? 'bg-pink-100 dark:bg-pink-500/15' :
                    mult === 3 ? 'bg-purple-100 dark:bg-purple-500/15' :
                    mult === 2 ? 'bg-success/10' :
                    mult === 1.5 ? 'bg-orange-100 dark:bg-orange-500/15' :
                    mult === 1 ? 'bg-blue-100 dark:bg-blue-500/15' :
                    mult === 0.5 ? 'bg-gray-100 dark:bg-gray-500/15' :
                    'bg-red-100 dark:bg-red-500/15'
                  }`}
                >
                  <Text className={`text-sm font-semibold ${
                    mult === 5 ? 'text-pink-700 dark:text-pink-300' :
                    mult === 3 ? 'text-purple-700 dark:text-purple-300' :
                    mult === 2 ? 'text-success' :
                    mult === 1.5 ? 'text-orange-700 dark:text-orange-300' :
                    mult === 1 ? 'text-blue-700 dark:text-blue-300' :
                    mult === 0.5 ? 'text-gray-700 dark:text-gray-300' :
                    'text-red-700 dark:text-red-300'
                  }`}>
                    {mult}x
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Spin Button */}
          <TouchableOpacity
            onPress={handleSpin}
            disabled={isSpinning || !betAmount}
            className={`mt-6 items-center rounded-xl py-4 ${
              !betAmount ? 'bg-muted' : 'bg-pink-600 active:bg-pink-700'
            }`}
          >
            {isSpinning ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className={`font-semibold ${!betAmount ? 'text-muted-foreground' : 'text-white'}`}>
                {betAmount ? '✨ Spin Wheel' : 'Enter Bet Amount'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* How to Play */}
        <View className="mx-4 mt-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <Text className="font-bold">How to Play</Text>
          <Text className="mt-2 text-sm leading-5 text-muted-foreground">
            1. Enter your bet amount{'\n'}
            2. Spin the wheel!{'\n'}
            3. Win based on where it lands{'\n\n'}
            Land on 5x for the biggest win! 🎰
          </Text>
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
