import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Animated } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, Coins, TrendingUp, TrendingDown } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState, useRef } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner-native';
import { api } from '@/lib/api';

export default function CoinFlipScreen() {
  const { balance } = useWallet();
  const [betAmount, setBetAmount] = useState('');
  const [choice, setChoice] = useState<'heads' | 'tails'>('heads');
  const [isFlipping, setIsFlipping] = useState(false);
  const [lastResult, setLastResult] = useState<'heads' | 'tails' | null>(null);
  const [lastOutcome, setLastOutcome] = useState<'win' | 'lose' | null>(null);
  const [totalWins, setTotalWins] = useState(0);
  const [totalLosses, setTotalLosses] = useState(0);
  
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;

  const handleFlip = async () => {
    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error('Enter a valid bet amount');
      return;
    }

    if (parseFloat(betAmount) > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsFlipping(true);
    
    // Animate coin flip
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      rotateAnim.setValue(0);
      flipAnim.setValue(0);
    });

    try {
      const response = await api.playCoinFlip(parseFloat(betAmount), choice);

      if (response.error) {
        toast.error(response.error);
        setIsFlipping(false);
        return;
      }

      const { result, won, winAmount } = response.data as any;
      
      setTimeout(() => {
        setLastResult(result);
        setLastOutcome(won ? 'win' : 'lose');

        if (won) {
          toast.success(`You won ${winAmount.toFixed(4)} MON!`);
          setTotalWins(totalWins + 1);
        } else {
          toast.error(`You lost ${betAmount} MON`);
          setTotalLosses(totalLosses + 1);
        }

        setIsFlipping(false);
      }, 1000);
    } catch (error) {
      toast.error('Failed to flip. Please try again.');
      setIsFlipping(false);
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1080deg'],
  });

  const flip = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 90, 0],
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
              <Text className="text-2xl font-bold">Coin Flip</Text>
              <Text className="mt-0.5 text-sm text-muted-foreground">
                Heads or Tails? Double your bet
              </Text>
            </View>
          </View>
        </View>

        {/* Hero */}
        <View className="mx-4 mt-5 items-center rounded-2xl bg-yellow-600 p-6 shadow-soft">
          <Animated.View
            style={{
              transform: [
                { rotateY: flip },
                { rotateZ: spin }
              ]
            }}
          >
            <View className="h-32 w-32 items-center justify-center rounded-full bg-white/20">
              <Text className="text-6xl">🪙</Text>
            </View>
          </Animated.View>
          <Text className="mt-3 text-center text-sm text-white/90">
            Heads or Tails? 2x multiplier!
          </Text>
        </View>

        {/* Stats */}
        <View className="mx-4 mt-4 flex-row gap-3">
          <View className="flex-1 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <View className="flex-row items-center gap-2">
              <Icon as={TrendingUp} size={16} className="text-success" />
              <Text className="text-sm text-muted-foreground">Wins</Text>
            </View>
            <Text className="mt-1.5 text-2xl font-bold text-success">{totalWins}</Text>
          </View>
          <View className="flex-1 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <View className="flex-row items-center gap-2">
              <Icon as={TrendingDown} size={16} className="text-red-600 dark:text-red-400" />
              <Text className="text-sm text-muted-foreground">Losses</Text>
            </View>
            <Text className="mt-1.5 text-2xl font-bold text-red-600 dark:text-red-400">{totalLosses}</Text>
          </View>
        </View>

        {/* Last Result */}
        {lastResult && (
          <View
            className={`mx-4 mt-4 rounded-2xl border p-6 ${
              lastOutcome === 'win'
                ? 'border-success/20 bg-success/10'
                : 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/30'
            }`}
          >
            <Text className={`text-center text-sm ${lastOutcome === 'win' ? 'text-success' : 'text-red-600 dark:text-red-400'}`}>
              Last Flip
            </Text>
            <Text className={`text-center text-5xl font-bold ${lastOutcome === 'win' ? 'text-success' : 'text-red-600 dark:text-red-400'}`}>
              {lastResult === 'heads' ? '👑' : '🦅'}
            </Text>
            <Text className={`text-center text-2xl font-bold ${lastOutcome === 'win' ? 'text-success' : 'text-red-600 dark:text-red-400'}`}>
              {lastResult.toUpperCase()}
            </Text>
            <Text className={`text-center text-sm ${lastOutcome === 'win' ? 'text-success' : 'text-red-600 dark:text-red-400'}`}>
              {lastOutcome === 'win' ? '🎉 You Won!' : '😢 You Lost'}
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

          {/* Choice */}
          <View className="mt-4">
            <Text className="mb-2 text-sm font-medium">Your Choice</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setChoice('heads')}
                className={`flex-1 items-center rounded-xl border py-6 ${
                  choice === 'heads' ? 'border-yellow-600 bg-yellow-600' : 'border-border bg-card'
                }`}
              >
                <Text className="text-4xl">👑</Text>
                <Text className={`mt-2 font-semibold ${choice === 'heads' ? 'text-white' : 'text-foreground'}`}>
                  Heads
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setChoice('tails')}
                className={`flex-1 items-center rounded-xl border py-6 ${
                  choice === 'tails' ? 'border-yellow-600 bg-yellow-600' : 'border-border bg-card'
                }`}
              >
                <Text className="text-4xl">🦅</Text>
                <Text className={`mt-2 font-semibold ${choice === 'tails' ? 'text-white' : 'text-foreground'}`}>
                  Tails
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Win Info */}
          <View className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-500/30 dark:bg-yellow-500/10">
            <Text className="text-center text-sm text-yellow-700 dark:text-yellow-300">
              Win Multiplier: 2x
            </Text>
            <Text className="text-center text-3xl font-bold text-yellow-700 dark:text-yellow-300">
              {betAmount ? (parseFloat(betAmount) * 2).toFixed(4) : '0'} MON
            </Text>
            <Text className="text-center text-xs text-yellow-600 dark:text-yellow-300/80">
              Potential win if you guess correctly
            </Text>
          </View>

          {/* Flip Button */}
          <TouchableOpacity
            onPress={handleFlip}
            disabled={isFlipping || !betAmount}
            className={`mt-6 items-center rounded-xl py-4 ${
              !betAmount ? 'bg-muted' : 'bg-yellow-600 active:bg-yellow-700'
            }`}
          >
            {isFlipping ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className={`font-semibold ${!betAmount ? 'text-muted-foreground' : 'text-white'}`}>
                {betAmount ? '🪙 Flip Coin' : 'Enter Bet Amount'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* How to Play */}
        <View className="mx-4 mt-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <Text className="font-bold">How to Play</Text>
          <Text className="mt-2 text-sm leading-5 text-muted-foreground">
            1. Enter your bet amount{'\n'}
            2. Choose Heads or Tails{'\n'}
            3. Flip the coin!{'\n\n'}
            If you guess correctly, you win 2x your bet!
          </Text>
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
