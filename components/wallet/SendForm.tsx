import { View, TextInput, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { QrCode } from 'lucide-react-native';
import { useState } from 'react';
import { toast } from 'sonner-native';

interface SendFormProps {
  balance: number;
  onSubmit: (data: { toAddress: string; amount: number; memo?: string }) => void;
  isSubmitting: boolean;
  onScanQR?: () => void;
}

export function SendForm({ balance, onSubmit, isSubmitting, onScanQR }: SendFormProps) {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');

  const handleSubmit = () => {
    if (!toAddress.trim()) {
      toast.error('Please enter recipient address');
      return;
    }

    const sendAmount = parseFloat(amount);
    if (!amount || sendAmount <= 0) {
      toast.error('Please enter valid amount');
      return;
    }

    if (sendAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    onSubmit({
      toAddress: toAddress.trim(),
      amount: sendAmount,
      memo: memo.trim() || undefined,
    });
  };

  const setMaxAmount = () => {
    setAmount(balance.toString());
  };

  return (
    <View className="gap-5">
      {/* Recipient Address */}
      <View>
        <Text className="mb-2 text-sm font-medium text-foreground">Recipient Address</Text>
        <View className="flex-row gap-2">
          <TextInput
            value={toAddress}
            onChangeText={setToAddress}
            placeholder="Enter Monad address"
            placeholderTextColor="#727285"
            className="flex-1 rounded-xl border border-border bg-background px-4 py-3.5 font-mono text-sm text-foreground"
          />
          {onScanQR && (
            <TouchableOpacity
              onPress={onScanQR}
              activeOpacity={0.7}
              className="h-[52px] w-[52px] items-center justify-center rounded-xl border border-border bg-card shadow-soft active:bg-accent"
            >
              <Icon as={QrCode} size={20} className="text-primary" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Amount */}
      <View>
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-foreground">Amount (MON)</Text>
          <TouchableOpacity onPress={setMaxAmount} hitSlop={8}>
            <Text className="text-sm font-semibold tabular-nums text-primary">
              Max: {balance.toFixed(4)}
            </Text>
          </TouchableOpacity>
        </View>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          placeholderTextColor="#727285"
          className="rounded-xl border border-border bg-background px-4 py-3.5 text-lg font-semibold tabular-nums text-foreground"
        />
      </View>

      {/* Memo (Optional) */}
      <View>
        <Text className="mb-2 text-sm font-medium text-foreground">Memo (Optional)</Text>
        <TextInput
          value={memo}
          onChangeText={setMemo}
          placeholder="Add a note"
          placeholderTextColor="#727285"
          className="rounded-xl border border-border bg-background px-4 py-3.5 text-foreground"
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isSubmitting}
        activeOpacity={0.8}
        className={`flex-row items-center justify-center rounded-xl py-4 shadow-soft ${
          isSubmitting ? 'bg-muted' : 'bg-primary active:bg-primary/90'
        }`}
      >
        <Text
          className={`text-center text-base font-semibold ${
            isSubmitting ? 'text-muted-foreground' : 'text-primary-foreground'
          }`}
        >
          {isSubmitting ? 'Sending...' : 'Send MON'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
