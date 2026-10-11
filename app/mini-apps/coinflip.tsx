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
        <View className="bg-yellow-600 px-4 pb-8 pt-12">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <Icon as={ArrowLeft} size={24} className="text-white" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-white">Coin Flip</Text>
          </View>

          <View className="mt-6 items-center">
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
        </View>

        {/* Stats */}
        <View className="mx-4 mt-6 flex-row gap-3">
          <View className="flex-1 rounded-xl bg-success/10 p-4">
            <View className="flex-row items-center gap-2">
              <Icon as={TrendingUp} size={16} className="text-success" />
              <Text className="text-sm text-success dark:text-success">Wins</Text>
            </View>
            <Text className="mt-1 text-2xl font-bold text-success dark:text-success">{totalWins}</Text>
          </View>
          <View className="flex-1 rounded-xl bg-red-50 dark:bg-red-950 p-4">
            <View className="flex-row items-center gap-2">
              <Icon as={TrendingDown} size={16} className="text-red-600" />
              <Text className="text-sm text-red-700 dark:text-red-300">Losses</Text>
            </View>
            <Text className="mt-1 text-2xl font-bold text-red-700 dark:text-red-300">{totalLosses}</Text>
          </View>
        </View>

        {/* Last Result */}
        {lastResult && (
          <View className={`mx-4 mt-4 rounded-xl p-6 ${lastOutcome === 'win' ? 'bg-success/10' : 'bg-red-50 dark:bg-red-950'}`}>
            <Text className={`text-center text-sm ${lastOutcome === 'win' ? 'text-success dark:text-success' : 'text-red-700 dark:text-red-300'}`}>
              Last Flip
            </Text>
            <Text className={`text-center text-5xl font-bold ${lastOutcome === 'win' ? 'text-success dark:text-success' : 'text-red-700 dark:text-red-300'}`}>
              {lastResult === 'heads' ? '👑' : '🦅'}
            </Text>
            <Text className={`text-center text-2xl font-bold ${lastOutcome === 'win' ? 'text-success dark:text-success' : 'text-red-700 dark:text-red-300'}`}>
              {lastResult.toUpperCase()}
            </Text>
            <Text className={`text-center text-sm ${lastOutcome === 'win' ? 'text-success dark:text-success' : 'text-red-700 dark:text-red-300'}`}>
              {lastOutcome === 'win' ? '🎉 You Won!' : '😢 You Lost'}
            </Text>
          </View>
        )}

        {/* Game Settings */}
        <View className="mx-4 mt-6">
          {/* Bet Amount */}
          <View className="rounded-2xl bg-card p-4">
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
                className={`flex-1 items-center rounded-xl py-6 ${
                  choice === 'heads' ? 'bg-yellow-600' : 'bg-card'
                }`}
              >
                <Text className="text-4xl">👑</Text>
                <Text className={`mt-2 font-semibold ${choice === 'heads' ? 'text-white' : 'text-foreground'}`}>
                  Heads
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setChoice('tails')}
                className={`flex-1 items-center rounded-xl py-6 ${
                  choice === 'tails' ? 'bg-yellow-600' : 'bg-card'
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
          <View className="mt-4 rounded-xl bg-yellow-50 dark:bg-yellow-950 p-4">
            <Text className="text-center text-sm text-yellow-700 dark:text-yellow-300">
              Win Multiplier: 2x
            </Text>
            <Text className="text-center text-3xl font-bold text-yellow-700 dark:text-yellow-300">
              {betAmount ? (parseFloat(betAmount) * 2).toFixed(4) : '0'} MON
            </Text>
            <Text className="text-center text-xs text-yellow-600 dark:text-yellow-400">
              Potential win if you guess correctly
            </Text>
          </View>

          {/* Flip Button */}
          <TouchableOpacity
            onPress={handleFlip}
            disabled={isFlipping || !betAmount}
            className={`mt-6 items-center rounded-xl py-4 ${
              isFlipping || !betAmount ? 'bg-gray-300' : 'bg-yellow-600'
            }`}
          >
            {isFlipping ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="font-semibold text-white">
                {betAmount ? '🪙 Flip Coin' : 'Enter Bet Amount'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* How to Play */}
        <View className="mx-4 mt-6 rounded-xl bg-card p-4">
          <Text className="font-bold">How to Play</Text>
          <Text className="mt-2 text-sm text-muted-foreground">
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
