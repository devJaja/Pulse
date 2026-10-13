import { Modal, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner-native';
import { useTranslation } from 'react-i18next';
import { Gift } from 'lucide-react-native';

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
        <View className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-elevated">
          <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-border" />
          <View className="mb-4 h-12 w-12 items-center justify-center self-center rounded-full bg-success/15">
            <Icon as={Gift} size={22} className="text-success" />
          </View>
          <Text className="text-center text-xl font-bold text-foreground">
            {t('common.tip')} {t('common.post')}
          </Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            {t('common.send')} MON {t('common.to')} @{recipientUsername}
          </Text>

          <View className="mt-5">
            <Input
              label={`${t('wallet.amount')} (MON)`}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.1"
              keyboardType="decimal-pad"
              className="text-foreground"
            />
          </View>

          <View className="mt-6 flex-row gap-3">
            <Button
              variant="outline"
              onPress={onClose}
              className="flex-1"
              accessibilityLabel={t('common.cancel')}
            >
              <Text className="font-semibold text-foreground">{t('common.cancel')}</Text>
            </Button>
            <Button
              onPress={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-success active:bg-success/90"
              accessibilityLabel={t('common.send')}
            >
              <Text className="font-semibold text-primary-foreground">
                {isSubmitting ? t('wallet.sending') : t('common.send')} {t('common.tip')}
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
