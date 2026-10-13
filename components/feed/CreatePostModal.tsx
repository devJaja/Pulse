import { Modal, View, TouchableOpacity, ScrollView, TextInput, Image, Switch } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { X, ImagePlus, Coins } from 'lucide-react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    content: string;
    images: string[];
    isTokenized: boolean;
    tokenSupply?: number;
    tokenPrice?: number;
  }) => void;
  isSubmitting: boolean;
  isUploadingImages: boolean;
}

export function CreatePostModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
  isUploadingImages,
}: CreatePostModalProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isTokenized, setIsTokenized] = useState(false);
  const [tokenSupply, setTokenSupply] = useState('1000');
  const [tokenPrice, setTokenPrice] = useState('0.01');

  const handleSubmit = () => {
    onSubmit({
      content,
      images,
      isTokenized,
      tokenSupply: isTokenized ? parseInt(tokenSupply) : undefined,
      tokenPrice: isTokenized ? parseFloat(tokenPrice) : undefined,
    });
    // Reset form
    setContent('');
    setImages([]);
    setIsTokenized(false);
    setTokenSupply('1000');
    setTokenPrice('0.01');
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 4,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages([...images, ...newImages].slice(0, 4));
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const canSubmit = !!content.trim() && !isSubmitting && !isUploadingImages;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50">
        <View className="mt-20 flex-1 rounded-t-2xl border-t border-border bg-background shadow-elevated">
          <View className="items-center pt-3">
            <View className="h-1.5 w-12 rounded-full bg-border" />
          </View>
          <View className="flex-row items-center justify-between border-b border-border p-4">
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.cancel')}
              className="h-9 w-9 items-center justify-center rounded-full active:bg-secondary"
            >
              <Icon as={X} size={20} className="text-foreground" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-foreground">{t('feed.createPost')}</Text>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit}
              accessibilityRole="button"
              className={`rounded-xl px-4 py-2 ${
                canSubmit ? 'bg-primary shadow-soft active:opacity-90' : 'bg-muted'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  canSubmit ? 'text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                {isUploadingImages
                  ? t('feed.uploading')
                  : isSubmitting
                    ? t('feed.posting')
                    : t('common.post')}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1 p-4"
            keyboardShouldPersistTaps="handled"
          >
            {/* Content Input */}
            <View className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder={t('feed.whatsHappening')}
                placeholderTextColor="#727285"
                multiline
                autoFocus
                className="min-h-[100px] text-[15px] leading-[22px] text-foreground"
                style={{ textAlignVertical: 'top' }}
              />
            </View>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <View className="mb-4 flex-row flex-wrap gap-2">
                {images.map((uri, index) => (
                  <View key={index} className="relative">
                    <Image source={{ uri }} className="h-24 w-24 rounded-xl bg-muted" />
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      accessibilityRole="button"
                      accessibilityLabel="Remove image"
                      className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-black/60 active:opacity-70"
                    >
                      <Icon as={X} size={14} className="text-white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Tokenization Section */}
            <View className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                  <View className="h-8 w-8 items-center justify-center rounded-lg bg-accent">
                    <Icon as={Coins} size={16} className="text-primary dark:text-brand-300" />
                  </View>
                  <Text className="font-semibold text-foreground">{t('feed.tokenizePost')}</Text>
                </View>
                <Switch
                  value={isTokenized}
                  onValueChange={setIsTokenized}
                  trackColor={{ false: 'hsl(var(--muted))', true: 'hsl(var(--primary))' }}
                  thumbColor="hsl(var(--background))"
                />
              </View>

              {isTokenized && (
                <View className="mt-4 gap-3">
                  <Input
                    label={t('feed.tokenSupply')}
                    value={tokenSupply}
                    onChangeText={setTokenSupply}
                    placeholder="1000"
                    keyboardType="numeric"
                    className="text-foreground"
                  />
                  <Input
                    label={t('feed.pricePerToken')}
                    value={tokenPrice}
                    onChangeText={setTokenPrice}
                    placeholder="0.01"
                    keyboardType="decimal-pad"
                    className="text-foreground"
                  />
                  <View className="rounded-xl border border-primary/15 bg-accent p-3">
                    <Text className="text-xs text-primary dark:text-brand-300">
                      {t('feed.tokenTip')}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Add Images Button */}
            <TouchableOpacity
              onPress={pickImages}
              disabled={images.length >= 4}
              className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card/60 py-4 active:bg-secondary dark:active:bg-secondary/80"
            >
              <Icon as={ImagePlus} size={22} className="text-muted-foreground" />
              <Text className="text-muted-foreground">
                {images.length >= 4 ? t('feed.maxImages') : t('feed.addImages')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
