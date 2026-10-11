import { Modal, View, TouchableOpacity, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { useState } from 'react';
import { toast } from 'sonner-native';
import { useTranslation } from 'react-i18next';

interface TipModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  recipientUsername: string;
  isSubmitting: boolean;
}

export function TipModal({
  visible,
  onClose,
  onSubmit,
  recipientUsername,
  isSubmitting,
}: TipModalProps) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');

  const handleSubmit = () => {
    const tipAmount = parseFloat(amount);
    if (!amount || tipAmount <= 0) {
      toast.error(t('errors.invalidAmount'));
      return;
    }
    onSubmit(tipAmount);
    setAmount('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 p-4">
        <View className="w-full max-w-sm rounded-3xl bg-card p-6">
          <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-border" />
          <Text className="text-xl font-bold">{t('common.tip')} {t('common.post')}</Text>
          <Text className="mt-2 text-sm text-muted-foreground">
            {t('common.send')} MON {t('common.to')} @{recipientUsername}
          </Text>

          <View className="mt-4">
            <Text className="mb-2 text-sm font-medium">{t('wallet.amount')} (MON)</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.1"
              keyboardType="decimal-pad"
              placeholderTextColor="#727285"
              className="rounded-xl border border-border bg-background px-4 py-3 text-foreground"
            />
          </View>

          <View className="mt-6 flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 rounded-xl border border-border py-3 active:opacity-70"
            >
              <Text className="text-center font-semibold">{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-success py-3 active:opacity-90"
            >
              <Text className="text-center font-semibold text-white">
                {isSubmitting ? t('wallet.sending') : t('common.send')} {t('common.tip')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
