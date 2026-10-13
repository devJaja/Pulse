import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Animated } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, Gamepad2, Dices, TrendingUp, TrendingDown } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState, useRef } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner-native';
import { api } from '@/lib/api';

export default function DiceGameScreen() {
  const { balance } = useWallet();
  const [betAmount, setBetAmount] = useState('');
  const [prediction, setPrediction] = useState<'over' | 'under'>('over');
  const [targetNumber, setTargetNumber] = useState('50');
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<'win' | 'lose' | null>(null);
  const [totalWins, setTotalWins] = useState(0);
  const [totalLosses, setTotalLosses] = useState(0);
  
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const calculateMultiplier = () => {
    const target = parseInt(targetNumber);
    if (prediction === 'over') {
      return (100 / (100 - target)).toFixed(2);
    } else {
      return (100 / target).toFixed(2);
    }
  };

  const handleRoll = async () => {
    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error('Enter a valid bet amount');
      return;
    }

    if (parseFloat(betAmount) > balance) {
      toast.error('Insufficient balance');
      return;
    }

    const target = parseInt(targetNumber);
    if (target < 1 || target > 99) {
      toast.error('Target must be between 1 and 99');
      return;
    }

    setIsRolling(true);
    
    // Animate dice roll
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0);
    });

    try {
      const response = await api.playDice(
        parseFloat(betAmount),
        prediction,
        target
      );

      if (response.error) {
        toast.error(response.error);
        setIsRolling(false);
        return;
      }

      const { roll, won, winAmount } = response.data as any;
      
      setTimeout(() => {
        setLastRoll(roll);
        setLastResult(won ? 'win' : 'lose');

        if (won) {
          toast.success(`You won ${winAmount.toFixed(4)} MON!`);
          setTotalWins(totalWins + 1);
        } else {
          toast.error(`You lost ${betAmount} MON`);
          setTotalLosses(totalLosses + 1);
        }

        setIsRolling(false);
      }, 1000);
    } catch (error) {
      toast.error('Failed to play. Please try again.');
      setIsRolling(false);
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
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
              <Text className="text-2xl font-bold">Dice Game</Text>
              <Text className="mt-0.5 text-sm text-muted-foreground">
                Roll the dice and win MON
              </Text>
            </View>
          </View>
        </View>

        {/* Hero */}
        <View className="mx-4 mt-5 items-center rounded-2xl bg-success p-6 shadow-soft">
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <View className="h-20 w-20 items-center justify-center rounded-2xl bg-white/20">
              <Icon as={Dices} size={40} className="text-white" />
            </View>
          </Animated.View>
          <Text className="mt-3 text-center text-sm text-white/80">
            Roll the dice and win MON!
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

        {/* Last Roll Result */}
        {lastRoll !== null && (
          <View
            className={`mx-4 mt-4 rounded-2xl border p-5 ${
              lastResult === 'win'
                ? 'border-success/20 bg-success/10'
                : 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/30'
            }`}
          >
            <Text className={`text-center text-sm ${lastResult === 'win' ? 'text-success' : 'text-red-600 dark:text-red-400'}`}>
              Last Roll
            </Text>
            <Text className={`text-center text-4xl font-bold ${lastResult === 'win' ? 'text-success' : 'text-red-600 dark:text-red-400'}`}>
              {lastRoll}
            </Text>
            <Text className={`text-center text-sm ${lastResult === 'win' ? 'text-success' : 'text-red-600 dark:text-red-400'}`}>
              {lastResult === 'win' ? '🎉 You Won!' : '😢 You Lost'}
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

          {/* Prediction */}
          <View className="mt-4">
            <Text className="mb-2 text-sm font-medium">Prediction</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setPrediction('over')}
                className={`flex-1 items-center rounded-xl border py-3 ${
                  prediction === 'over' ? 'border-success bg-success' : 'border-border bg-card'
                }`}
              >
                <Text className={`font-semibold ${prediction === 'over' ? 'text-white' : 'text-foreground'}`}>
                  Over
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPrediction('under')}
                className={`flex-1 items-center rounded-xl border py-3 ${
                  prediction === 'under' ? 'border-red-600 bg-red-600' : 'border-border bg-card'
                }`}
              >
                <Text className={`font-semibold ${prediction === 'under' ? 'text-white' : 'text-foreground'}`}>
                  Under
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Target Number */}
          <View className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <Text className="text-sm text-muted-foreground">Target Number (1-99)</Text>
            <TextInput
              value={targetNumber}
              onChangeText={setTargetNumber}
              placeholder="50"
              keyboardType="numeric"
              className="mt-2 text-2xl font-bold text-foreground"
              placeholderTextColor="#727285"
            />
          </View>

          {/* Multiplier */}
          <View className="mt-4 rounded-2xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-500/30 dark:bg-purple-500/10">
            <Text className="text-center text-sm text-purple-700 dark:text-purple-300">
              Win Multiplier
            </Text>
            <Text className="text-center text-3xl font-bold text-purple-700 dark:text-purple-300">
              {calculateMultiplier()}x
            </Text>
            <Text className="text-center text-xs text-purple-600 dark:text-purple-300/80">
              Potential win: {betAmount ? (parseFloat(betAmount) * parseFloat(calculateMultiplier())).toFixed(4) : '0'} MON
            </Text>
          </View>

          {/* Roll Button */}
          <TouchableOpacity
            onPress={handleRoll}
            disabled={isRolling || !betAmount}
            className={`mt-6 items-center rounded-xl py-4 ${
              !betAmount ? 'bg-muted' : 'bg-success active:bg-success/90'
            }`}
          >
            {isRolling ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className={`font-semibold ${!betAmount ? 'text-muted-foreground' : 'text-white'}`}>
                {betAmount ? '🎲 Roll Dice' : 'Enter Bet Amount'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* How to Play */}
        <View className="mx-4 mt-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <Text className="font-bold">How to Play</Text>
          <Text className="mt-2 text-sm leading-5 text-muted-foreground">
            1. Enter your bet amount{'\n'}
            2. Choose Over or Under{'\n'}
            3. Set your target number{'\n'}
            4. Roll the dice!{'\n\n'}
            If you predict correctly, you win based on the multiplier!
          </Text>
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
