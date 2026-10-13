import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, Coins, ArrowDownUp, Info, ChevronDown, RefreshCw, History } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useSwapHistory } from '@/hooks/useSwapHistory';
import { useAllTokenPrices } from '@/hooks/useTokenPrice';
import { toast } from 'sonner-native';
import { api } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { TOKENS } from '@/lib/tokens';

export default function SwapScreen() {
  const { balance } = useWallet();
  const { data: swapHistoryData, refetch: refetchSwapHistory } = useSwapHistory();
  const { data: tokenPrices, isLoading: isLoadingPrices, refetch: refetchPrices } = useAllTokenPrices();
  const recentSwaps = swapHistoryData?.pages?.[0]?.swaps?.slice(0, 5) || [];
  
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[2]); // USDC
  const [fromAmount, setFromAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);
  const [toAmount, setToAmount] = useState('0');
  const [rate, setRate] = useState(0);
  const [priceImpact, setPriceImpact] = useState('0');
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    // Debounce the calculation
    const timer = setTimeout(() => {
      if (fromAmount && parseFloat(fromAmount) > 0) {
        calculateSwapQuote();
      } else {
        setToAmount('0');
        setRate(0);
        setPriceImpact('0');
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [fromAmount, fromToken, toToken, tokenPrices]);

  const calculateSwapQuote = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return;

    setIsCalculating(true);
    try {
      // Use local price calculation if we have token prices
      if (tokenPrices && tokenPrices[fromToken.symbol] && tokenPrices[toToken.symbol]) {
        const fromPrice = tokenPrices[fromToken.symbol];
        const toPrice = tokenPrices[toToken.symbol];
        const amount = parseFloat(fromAmount);
        
        // Calculate: (amount * fromPrice) / toPrice
        const calculatedToAmount = (amount * fromPrice) / toPrice;
        const calculatedRate = fromPrice / toPrice;
        
        console.log('Local swap calculation:', {
          fromToken: fromToken.symbol,
          toToken: toToken.symbol,
          fromAmount: amount,
          fromPrice,
          toPrice,
          calculatedToAmount,
          calculatedRate,
        });
        
        setToAmount(calculatedToAmount.toFixed(6));
        setRate(calculatedRate);
        setPriceImpact('0.1'); // Minimal price impact for demo
        setIsCalculating(false);
        return;
      }
      
      // Fallback to backend API if prices not available
      const response = await api.swapTokens(
        fromToken.symbol,
        toToken.symbol,
        parseFloat(fromAmount)
      );

      if (response.data) {
        const data = response.data as any;
        setToAmount(data.toAmount.toFixed(6));
        setRate(data.rate);
        setPriceImpact(data.priceImpact || '0');
      }
    } catch (error) {
      console.error('Failed to get quote:', error);
      setToAmount('0');
      setRate(0);
      setPriceImpact('0');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    if (fromToken.symbol === toToken.symbol) {
      toast.error('Cannot swap same token');
      return;
    }

    if (fromToken.symbol === 'MON' && parseFloat(fromAmount) > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsSwapping(true);
    
    try {
      // Calculate swap locally using token prices
      if (!tokenPrices || !tokenPrices[fromToken.symbol] || !tokenPrices[toToken.symbol]) {
        toast.error('Unable to fetch token prices');
        setIsSwapping(false);
        return;
      }

      const fromPrice = tokenPrices[fromToken.symbol];
      const toPrice = tokenPrices[toToken.symbol];
      const amount = parseFloat(fromAmount);
      
      const calculatedToAmount = (amount * fromPrice) / toPrice;
      const calculatedRate = fromPrice / toPrice;
      const calculatedPriceImpact = 0.1; // Minimal price impact for demo
      
      console.log('Executing swap:', {
        fromToken: fromToken.symbol,
        toToken: toToken.symbol,
        fromAmount: amount,
        toAmount: calculatedToAmount,
        rate: calculatedRate,
        priceImpact: calculatedPriceImpact,
      });

      // Send swap to backend with calculated values
      const response = await api.swapTokens(
        fromToken.symbol,
        toToken.symbol,
        amount,
        calculatedToAmount,
        calculatedRate,
        calculatedPriceImpact
      );

      if (response.error) {
        toast.error(response.error);
        setIsSwapping(false);
        return;
      }

      // Show success message
      toast.success(`Swapped ${fromAmount} ${fromToken.symbol} for ${calculatedToAmount.toFixed(6)} ${toToken.symbol}`);
      setFromAmount('');
      setIsSwapping(false);
      refetchSwapHistory(); // Refresh swap history
      
    } catch (error: any) {
      console.error('Swap error:', error);
      toast.error(error?.message || 'Swap failed. Please try again.');
      setIsSwapping(false);
    }
  };

  const switchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount('');
  };

  const selectFromToken = (token: typeof TOKENS[0]) => {
    if (token.symbol === toToken.symbol) {
      // If selecting the same as toToken, swap them
      setToToken(fromToken);
    }
    setFromToken(token);
    setShowFromModal(false);
    setFromAmount('');
  };

  const selectToToken = (token: typeof TOKENS[0]) => {
    if (token.symbol === fromToken.symbol) {
      // If selecting the same as fromToken, swap them
      setFromToken(toToken);
    }
    setToToken(token);
    setShowToModal(false);
  };

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
              <Text className="text-2xl font-bold">Token Swap</Text>
              <Text className="mt-0.5 text-sm text-muted-foreground">
                Swap tokens instantly on Monad
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/mini-apps/swap-history')}
              className="h-10 w-10 items-center justify-center rounded-full bg-secondary active:opacity-70"
            >
              <Icon as={History} size={20} className="text-foreground" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Swap Card */}
        <View className="mx-4 mt-5">
          {/* From Token */}
          <View className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted-foreground">From</Text>
              {fromToken.symbol === 'MON' && (
                <Text className="text-sm text-muted-foreground">
                  Balance: {balance.toFixed(4)} MON
                </Text>
              )}
            </View>
            <View className="mt-2 flex-row items-center justify-between">
              <TextInput
                value={fromAmount}
                onChangeText={setFromAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                className="flex-1 text-3xl font-bold text-foreground"
                placeholderTextColor="#727285"
              />
              <TouchableOpacity
                onPress={() => setShowFromModal(true)}
                className={`ml-3 flex-row items-center gap-2 rounded-xl ${fromToken.color} px-3.5 py-2`}
              >
                <Text className="text-base font-semibold text-white">{fromToken.symbol}</Text>
                <Icon as={ChevronDown} size={16} className="text-white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Switch Button */}
          <View className="my-3 items-center">
            <TouchableOpacity
              onPress={switchTokens}
              className="h-12 w-12 items-center justify-center rounded-full border-4 border-background bg-primary shadow-soft active:bg-primary/90"
            >
              <Icon as={ArrowDownUp} size={22} className="text-primary-foreground" />
            </TouchableOpacity>
          </View>

          {/* To Token */}
          <View className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <Text className="text-sm text-muted-foreground">To (estimated)</Text>
            <View className="mt-2 flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center gap-2">
                {isCalculating ? (
                  <ActivityIndicator size="small" color="#6e54ff" />
                ) : (
                  <Text className="text-3xl font-bold">{toAmount}</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setShowToModal(true)}
                className={`ml-3 flex-row items-center gap-2 rounded-xl ${toToken.color} px-3.5 py-2`}
              >
                <Text className="text-base font-semibold text-white">{toToken.symbol}</Text>
                <Icon as={ChevronDown} size={16} className="text-white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Exchange Rate */}
          <View className="mt-4 flex-row items-center justify-between rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-500/30 dark:bg-purple-500/10">
            <View className="flex-row items-center gap-2">
              <Icon as={Info} size={16} className="text-purple-600 dark:text-purple-300" />
              <Text className="text-sm text-purple-700 dark:text-purple-300">
                Rate: 1 {fromToken.symbol} ≈ {rate.toFixed(6)} {toToken.symbol}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => refetchPrices()}
              className="h-7 w-7 items-center justify-center rounded-full bg-white/60 active:opacity-70 dark:bg-white/10"
            >
              <Icon as={RefreshCw} size={14} className="text-purple-600 dark:text-purple-300" />
            </TouchableOpacity>
          </View>

          {parseFloat(priceImpact) > 0 && (
            <Text className="mt-2 text-center text-xs text-muted-foreground">
              Price Impact: {parseFloat(priceImpact).toFixed(2)}%
            </Text>
          )}

          {/* Swap Button */}
          <TouchableOpacity
            onPress={handleSwap}
            disabled={isSwapping || !fromAmount}
            className={`mt-5 items-center rounded-xl py-4 ${
              !fromAmount ? 'bg-muted' : 'bg-primary active:bg-primary/90'
            }`}
          >
            {isSwapping ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className={`font-semibold ${!fromAmount ? 'text-muted-foreground' : 'text-primary-foreground'}`}>
                {fromAmount ? 'Swap Tokens' : 'Enter Amount'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Token List */}
        <View className="mx-4 mt-6">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold">Available Tokens</Text>
            {isLoadingPrices && <ActivityIndicator size="small" color="#6e54ff" />}
          </View>
          <View className="mt-3 gap-2">
            {TOKENS.map((token) => (
              <View key={token.symbol} className="flex-row items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft">
                <View className="flex-row items-center gap-3">
                  <View className={`h-10 w-10 items-center justify-center rounded-full ${token.color}`}>
                    <Text className="text-sm font-semibold text-white">{token.icon}</Text>
                  </View>
                  <View>
                    <Text className="font-semibold">{token.symbol}</Text>
                    <Text className="text-sm text-muted-foreground">{token.name}</Text>
                  </View>
                </View>
                <View className="items-end">
                  {tokenPrices && tokenPrices[token.symbol] !== undefined ? (
                    <>
                      <Text className="font-semibold">${tokenPrices[token.symbol].toFixed(4)}</Text>
                      <Text className="text-xs text-muted-foreground">per token</Text>
                    </>
                  ) : (
                    <Text className="text-sm text-muted-foreground">
                      {isLoadingPrices ? 'Loading...' : 'N/A'}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Swaps */}
        {recentSwaps.length > 0 && (
          <View className="mx-4 mt-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold">Recent Swaps</Text>
              <TouchableOpacity onPress={() => router.push('/mini-apps/swap-history')}>
                <View className="flex-row items-center gap-1">
                  <Text className="text-sm font-semibold text-primary">View All</Text>
                  <Icon as={History} size={16} className="text-primary" />
                </View>
              </TouchableOpacity>
            </View>
            <View className="mt-3 gap-2">
              {recentSwaps.map((swap) => (
                <View key={swap.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="font-semibold">
                          {swap.fromAmount.toFixed(4)} {swap.fromToken}
                        </Text>
                        <Text className="text-muted-foreground">→</Text>
                        <Text className="font-semibold">
                          {swap.toAmount.toFixed(4)} {swap.toToken}
                        </Text>
                      </View>
                      <Text className="mt-1 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(swap.createdAt), { addSuffix: true })}
                      </Text>
                    </View>
                    <View className="rounded-full bg-success/10 px-2.5 py-1">
                      <Text className="text-xs font-medium capitalize text-success">{swap.status}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="h-6" />
      </ScrollView>

      {/* From Token Modal */}
      <Modal
        visible={showFromModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFromModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowFromModal(false)}
          className="flex-1 justify-end bg-black/60"
        >
          <View className="rounded-t-3xl border-t border-border bg-card pb-8 pt-4">
            <View className="items-center">
              <View className="h-1 w-12 rounded-full bg-border" />
            </View>
            <Text className="px-6 pt-4 text-xl font-bold">Select Token</Text>
            <View className="mt-4 gap-2 px-6">
              {TOKENS.map((token) => (
                <TouchableOpacity
                  key={token.symbol}
                  onPress={() => selectFromToken(token)}
                  className={`flex-row items-center gap-3 rounded-xl border p-4 ${
                    token.symbol === fromToken.symbol
                      ? 'border-purple-200 bg-purple-50 dark:border-purple-500/30 dark:bg-purple-500/10'
                      : 'border-border bg-background'
                  }`}
                >
                  <View className={`h-12 w-12 items-center justify-center rounded-full ${token.color}`}>
                    <Text className="text-sm font-semibold text-white">{token.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold">{token.symbol}</Text>
                    <Text className="text-sm text-muted-foreground">{token.name}</Text>
                  </View>
                  {token.symbol === fromToken.symbol && (
                    <Icon as={Coins} size={20} className="text-purple-600 dark:text-purple-300" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* To Token Modal */}
      <Modal
        visible={showToModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowToModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowToModal(false)}
          className="flex-1 justify-end bg-black/60"
        >
          <View className="rounded-t-3xl border-t border-border bg-card pb-8 pt-4">
            <View className="items-center">
              <View className="h-1 w-12 rounded-full bg-border" />
            </View>
            <Text className="px-6 pt-4 text-xl font-bold">Select Token</Text>
            <View className="mt-4 gap-2 px-6">
              {TOKENS.map((token) => (
                <TouchableOpacity
                  key={token.symbol}
                  onPress={() => selectToToken(token)}
                  className={`flex-row items-center gap-3 rounded-xl border p-4 ${
                    token.symbol === toToken.symbol
                      ? 'border-purple-200 bg-purple-50 dark:border-purple-500/30 dark:bg-purple-500/10'
                      : 'border-border bg-background'
                  }`}
                >
                  <View className={`h-12 w-12 items-center justify-center rounded-full ${token.color}`}>
                    <Text className="text-sm font-semibold text-white">{token.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold">{token.symbol}</Text>
                    <Text className="text-sm text-muted-foreground">{token.name}</Text>
                  </View>
                  {token.symbol === toToken.symbol && (
                    <Icon as={Coins} size={20} className="text-purple-600 dark:text-purple-300" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
