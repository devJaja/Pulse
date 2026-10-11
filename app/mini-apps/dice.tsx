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
        <View className="bg-success px-4 pb-8 pt-12">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <Icon as={ArrowLeft} size={24} className="text-white" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-white">Dice Game</Text>
          </View>

          <View className="mt-6 items-center">
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <View className="h-20 w-20 items-center justify-center rounded-2xl bg-white/20">
                <Icon as={Dices} size={40} className="text-white" />
              </View>
            </Animated.View>
            <Text className="mt-3 text-center text-sm text-white/90">
              Roll the dice and win MON!
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

        {/* Last Roll Result */}
        {lastRoll !== null && (
          <View className={`mx-4 mt-4 rounded-xl p-4 ${lastResult === 'win' ? 'bg-success/10' : 'bg-red-50 dark:bg-red-950'}`}>
            <Text className={`text-center text-sm ${lastResult === 'win' ? 'text-success dark:text-success' : 'text-red-700 dark:text-red-300'}`}>
              Last Roll
            </Text>
            <Text className={`text-center text-4xl font-bold ${lastResult === 'win' ? 'text-success dark:text-success' : 'text-red-700 dark:text-red-300'}`}>
              {lastRoll}
            </Text>
            <Text className={`text-center text-sm ${lastResult === 'win' ? 'text-success dark:text-success' : 'text-red-700 dark:text-red-300'}`}>
              {lastResult === 'win' ? '🎉 You Won!' : '😢 You Lost'}
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

          {/* Prediction */}
          <View className="mt-4">
            <Text className="mb-2 text-sm font-medium">Prediction</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setPrediction('over')}
                className={`flex-1 items-center rounded-xl py-3 ${
                  prediction === 'over' ? 'bg-success' : 'bg-card'
                }`}
              >
                <Text className={`font-semibold ${prediction === 'over' ? 'text-white' : 'text-foreground'}`}>
                  Over
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPrediction('under')}
                className={`flex-1 items-center rounded-xl py-3 ${
                  prediction === 'under' ? 'bg-red-600' : 'bg-card'
                }`}
              >
                <Text className={`font-semibold ${prediction === 'under' ? 'text-white' : 'text-foreground'}`}>
                  Under
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Target Number */}
          <View className="mt-4 rounded-2xl bg-card p-4">
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
          <View className="mt-4 rounded-xl bg-purple-50 dark:bg-purple-950 p-4">
            <Text className="text-center text-sm text-purple-700 dark:text-purple-300">
              Win Multiplier
            </Text>
            <Text className="text-center text-3xl font-bold text-purple-700 dark:text-purple-300">
              {calculateMultiplier()}x
            </Text>
            <Text className="text-center text-xs text-purple-600 dark:text-purple-400">
              Potential win: {betAmount ? (parseFloat(betAmount) * parseFloat(calculateMultiplier())).toFixed(4) : '0'} MON
            </Text>
          </View>

          {/* Roll Button */}
          <TouchableOpacity
            onPress={handleRoll}
            disabled={isRolling || !betAmount}
            className={`mt-6 items-center rounded-xl py-4 ${
              isRolling || !betAmount ? 'bg-gray-300' : 'bg-success'
            }`}
          >
            {isRolling ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="font-semibold text-white">
                {betAmount ? '🎲 Roll Dice' : 'Enter Bet Amount'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* How to Play */}
        <View className="mx-4 mt-6 rounded-xl bg-card p-4">
          <Text className="font-bold">How to Play</Text>
          <Text className="mt-2 text-sm text-muted-foreground">
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
