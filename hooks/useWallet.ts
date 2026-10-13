import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { parseEther, toHex } from 'viem';
import type { Hex } from 'viem';
import { getPublicClient, getWalletClient } from '@/lib/wallet/chain';
import { isValidAddress } from '@/lib/wallet/account';
import { useWalletStore } from '@/store/useWalletStore';
import { toast } from 'sonner-native';
import type { WalletBalance, Transaction } from '@/types';

export function useWallet() {
  const queryClient = useQueryClient();
  const deviceAddress = useWalletStore((state) => state.address);

  // Get balance
  const { data: balance, isLoading: isLoadingBalance, refetch: refetchBalance } = useQuery<WalletBalance>({
    queryKey: ['wallet', 'balance'],
    queryFn: async () => {
      const response = await api.getBalance();
      if (response.error) throw new Error(response.error);
      return response.data as WalletBalance;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get transactions
  const {
    data: transactionsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions,
  } = useInfiniteQuery<Transaction[]>({
    queryKey: ['wallet', 'transactions'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.getTransactions(pageParam as number, 20);
      if (response.error) throw new Error(response.error);
      return response.data as Transaction[];
    },
    getNextPageParam: (lastPage, pages) => {
      return Array.isArray(lastPage) && lastPage.length === 20 ? pages.length + 1 : undefined;
    },
    initialPageParam: 1 as number,
  });

  // Send MON — signed locally with the self-custody key on this device.
  const sendMonMutation = useMutation({
    mutationFn: async ({ toAddress, amount, memo }: { toAddress: string; amount: number; memo?: string }) => {
      if (!isValidAddress(toAddress)) {
        throw new Error('Invalid recipient address');
      }

      const account = await useWalletStore.getState().getSigner();

      const publicClient = getPublicClient();
      const balance = await publicClient.getBalance({ address: account.address });
      const value = parseEther(String(amount));
      if (balance < value) {
        throw new Error('Insufficient balance');
      }

      const walletClient = getWalletClient(account);
      const hash = await walletClient.sendTransaction({
        account,
        to: toAddress as Hex,
        value,
        data: memo ? toHex(memo) : undefined,
      });

      return { signature: hash, walletAddress: account.address };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success('Transaction sent!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const transactions = transactionsData?.pages.flat() || [];

  return {
    balance: balance?.balance ?? 0,
    walletAddress: deviceAddress || balance?.walletAddress || '',
    isLoadingBalance,
    refetchBalance,
    transactions,
    isLoadingTransactions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetchTransactions,
    sendMon: sendMonMutation.mutate,
    isSending: sendMonMutation.isPending,
  };
}

export function useTransactionDetails(signature: string) {
  return useQuery({
    queryKey: ['wallet', 'transaction', signature],
    queryFn: async () => {
      const response = await api.getTransactionDetails(signature);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    enabled: !!signature,
  });
}
