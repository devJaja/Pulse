import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, Gift, Clock, CheckCircle, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { toast } from 'sonner-native';
import { api } from '@/lib/api';

const AIRDROP_AMOUNT = 0.1;

export default function AirdropScreen() {
  const [isClaiming, setIsClaiming] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState('');
  const [totalClaimed, setTotalClaimed] = useState(0);
  const [nextClaimAt, setNextClaimAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAirdropStatus();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadAirdropStatus = async () => {
    try {
      const response = await api.getAirdropStatus();
      if (response.data) {
        const data = response.data as any;
        setCanClaim(data.canClaim);
        setTotalClaimed(data.totalClaimed || 0);
        setNextClaimAt(data.nextClaimAt ? new Date(data.nextClaimAt) : null);
      }
    } catch (error) {
      console.error('Failed to load airdrop status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCountdown = () => {
    if (!nextClaimAt || canClaim) {
      setTimeUntilNext('');
      return;
    }

    const now = Date.now();
    const remaining = nextClaimAt.getTime() - now;

    if (remaining <= 0) {
      setCanClaim(true);
      setTimeUntilNext('');
      return;
    }

    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
    setTimeUntilNext(`${hours}h ${minutes}m ${seconds}s`);
  };

  const handleClaim = async () => {
    if (!canClaim) {
      toast.error('You can only claim once every 24 hours');
      return;
    }

    setIsClaiming(true);

    try {
      const response = await api.claimAirdrop();
      
      if (response.error) {
        toast.error(response.error);
        setIsClaiming(false);
        return;
      }

      const { amount, nextClaimAt: newNextClaim } = response.data as any;
      
      toast.success(`Claimed ${amount} MON! 🎉`);
      setTotalClaimed(totalClaimed + amount);
      setCanClaim(false);
      setNextClaimAt(new Date(newNextClaim));
      
    } catch (error) {
      toast.error('Failed to claim airdrop');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-[#0e100f] px-4 pb-8 pt-12">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <Icon as={ArrowLeft} size={24} className="text-white" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-white">Daily Airdrop</Text>
          </View>

          <View className="mt-6 items-center">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-white/20">
              <Icon as={Gift} size={40} className="text-white" />
            </View>
            <Text className="mt-3 text-center text-sm text-white/90">
              Claim free MON every 24 hours
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="mx-4 mt-6 flex-row gap-3">
          <View className="flex-1 rounded-xl bg-purple-50 dark:bg-purple-950 p-4">
            <View className="flex-row items-center gap-2">
              <Icon as={Sparkles} size={16} className="text-purple-600" />
              <Text className="text-sm text-purple-700 dark:text-purple-300">Total Claimed</Text>
            </View>
            <Text className="mt-1 text-2xl font-bold text-purple-700 dark:text-purple-300">
              {totalClaimed.toFixed(2)} MON
            </Text>
          </View>
          <View className="flex-1 rounded-xl bg-blue-50 dark:bg-blue-950 p-4">
            <View className="flex-row items-center gap-2">
              <Icon as={CheckCircle} size={16} className="text-blue-600" />
              <Text className="text-sm text-blue-700 dark:text-blue-300">Status</Text>
            </View>
            <Text className="mt-1 text-lg font-bold text-blue-700 dark:text-blue-300">
              {canClaim ? 'Ready' : 'Claimed'}
            </Text>
          </View>
        </View>

        {/* Claim Card */}
        <View className="mx-4 mt-6">
          <View className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#6e54ff] to-[#8270ff]">
            <View className="p-6">
              <View className="items-center">
                <Text className="text-sm text-white/80">Available to Claim</Text>
                <Text className="mt-2 text-5xl font-bold text-white">
                  {canClaim ? AIRDROP_AMOUNT : '0'} MON
                </Text>
                
                {!canClaim && timeUntilNext && (
                  <View className="mt-4 flex-row items-center gap-2 rounded-full bg-white/20 px-4 py-2">
                    <Icon as={Clock} size={16} className="text-white" />
                    <Text className="text-sm text-white">Next claim in {timeUntilNext}</Text>
                  </View>
                )}

                {canClaim && (
                  <View className="mt-4 flex-row items-center gap-2 rounded-full bg-success/100 px-4 py-2">
                    <Icon as={CheckCircle} size={16} className="text-white" />
                    <Text className="text-sm font-semibold text-white">Ready to Claim!</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={handleClaim}
                disabled={!canClaim || isClaiming}
                className={`mt-6 items-center rounded-xl py-4 ${
                  !canClaim || isClaiming ? 'bg-white/20' : 'bg-white'
                }`}
              >
                {isClaiming ? (
                  <ActivityIndicator color="#6e54ff" />
                ) : (
                  <Text className={`font-semibold ${!canClaim ? 'text-white/60' : 'text-purple-600'}`}>
                    {canClaim ? '🎁 Claim Airdrop' : 'Come Back Later'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* How it Works */}
        <View className="mx-4 mt-6 rounded-xl bg-card p-4">
          <Text className="font-bold">How it Works</Text>
          <View className="mt-3 gap-3">
            <View className="flex-row gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <Text className="font-bold text-purple-600 dark:text-purple-300">1</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold">Claim Daily</Text>
                <Text className="text-sm text-muted-foreground">
                  Come back every 24 hours to claim your free MON
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <Text className="font-bold text-purple-600 dark:text-purple-300">2</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold">Instant Credit</Text>
                <Text className="text-sm text-muted-foreground">
                  MON is instantly added to your wallet
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <Text className="font-bold text-purple-600 dark:text-purple-300">3</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold">No Limits</Text>
                <Text className="text-sm text-muted-foreground">
                  Claim every day and build your balance
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Streak Bonus (Coming Soon) */}
        <View className="mx-4 mt-6 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 dark:bg-purple-950 p-4">
          <View className="flex-row items-center gap-2">
            <Icon as={Sparkles} size={20} className="text-purple-600" />
            <Text className="font-bold text-purple-700 dark:text-purple-300">Coming Soon</Text>
          </View>
          <Text className="mt-2 text-sm text-purple-600 dark:text-purple-400">
            Streak bonuses! Claim daily for 7 days straight to earn bonus rewards 🔥
          </Text>
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
