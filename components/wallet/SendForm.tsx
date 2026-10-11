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
    <View className="gap-4">
      {/* Recipient Address */}
      <View>
        <Text className="mb-2 text-sm font-medium">Recipient Address</Text>
        <View className="flex-row gap-2">
          <TextInput
            value={toAddress}
            onChangeText={setToAddress}
            placeholder="Enter Monad address"
            placeholderTextColor="#727285"
            className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-foreground"
          />
          {onScanQR && (
            <TouchableOpacity
              onPress={onScanQR}
              className="h-12 w-12 items-center justify-center rounded-lg border border-border"
            >
              <Icon as={QrCode} size={20} className="text-foreground" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Amount */}
      <View>
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm font-medium">Amount (MON)</Text>
          <TouchableOpacity onPress={setMaxAmount}>
            <Text className="text-sm text-purple-600">Max: {balance.toFixed(4)}</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          placeholderTextColor="#727285"
          className="rounded-lg border border-border bg-background px-4 py-3 text-foreground"
        />
      </View>

      {/* Memo (Optional) */}
      <View>
        <Text className="mb-2 text-sm font-medium">Memo (Optional)</Text>
        <TextInput
          value={memo}
          onChangeText={setMemo}
          placeholder="Add a note"
          placeholderTextColor="#727285"
          className="rounded-lg border border-border bg-background px-4 py-3 text-foreground"
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isSubmitting}
        className={`rounded-xl py-4 ${isSubmitting ? 'bg-gray-400' : 'bg-primary'}`}
      >
        <Text className="text-center font-semibold text-primary-foreground">
          {isSubmitting ? 'Sending...' : 'Send MON'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
