import { Modal, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner-native';
import { useTranslation } from 'react-i18next';
import { Coins } from 'lucide-react-native';

interface BuyTokenModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  tokenPrice: number;
  isSubmitting: boolean;
}

export function BuyTokenModal({
  visible,
  onClose,
  onSubmit,
  tokenPrice,
  isSubmitting,
}: BuyTokenModalProps) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');

  const handleSubmit = () => {
    const tokenAmount = parseInt(amount);
    if (!amount || tokenAmount <= 0) {
      toast.error(t('errors.invalidAmount'));
      return;
    }
    onSubmit(tokenAmount);
    setAmount('');
  };

  const totalCost = amount ? (parseInt(amount) * tokenPrice).toFixed(4) : '0';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 p-4">
        <View className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-elevated">
          <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-border" />
          <View className="mb-4 h-12 w-12 items-center justify-center self-center rounded-full bg-accent">
            <Icon as={Coins} size={22} className="text-primary dark:text-brand-300" />
          </View>
          <Text className="text-center text-xl font-bold text-foreground">
            {t('feed.buy')} {t('common.post')} {t('wallet.tokens')}
          </Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            {t('wallet.price')}: {tokenPrice} MON {t('wallet.perToken')}
          </Text>

          <View className="mt-5">
            <Input
              label={t('wallet.numberOfTokens')}
              value={amount}
              onChangeText={setAmount}
              placeholder="10"
              keyboardType="numeric"
              className="text-foreground"
            />
            {amount ? (
              <View className="mt-3 flex-row items-center justify-between rounded-xl bg-secondary/60 px-3.5 py-2.5">
                <Text className="text-sm text-muted-foreground">{t('wallet.total')}</Text>
                <Text className="text-sm font-semibold text-foreground">{totalCost} MON</Text>
              </View>
            ) : null}
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
              className="flex-1"
              accessibilityLabel={t('feed.buy')}
            >
              <Text className="font-semibold text-primary-foreground">
                {isSubmitting ? t('wallet.buying') : t('feed.buy')} {t('wallet.tokens')}
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
