import { Modal, View, TouchableOpacity, ScrollView, TextInput, Image, Switch } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
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

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50">
        <View className="mt-20 flex-1 rounded-t-3xl bg-background">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-border p-4">
            <TouchableOpacity onPress={onClose}>
              <Icon as={X} size={24} className="text-foreground" />
            </TouchableOpacity>
            <Text className="text-lg font-bold">{t('feed.createPost')}</Text>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!content.trim() || isSubmitting || isUploadingImages}
              className={`rounded-full px-4 py-2 ${content.trim() && !isUploadingImages ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <Text className={`font-semibold ${content.trim() && !isUploadingImages ? 'text-primary-foreground' : 'text-gray-500'}`}>
                {isUploadingImages ? t('feed.uploading') : isSubmitting ? t('feed.posting') : t('common.post')}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-4">
            {/* Content Input */}
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder={t('feed.whatsHappening')}
              placeholderTextColor="#727285"
              multiline
              autoFocus
              className="min-h-[100px] text-base text-foreground"
              style={{ textAlignVertical: 'top' }}
            />

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <View className="mt-4 flex-row flex-wrap gap-2">
                {images.map((uri, index) => (
                  <View key={index} className="relative">
                    <Image source={{ uri }} className="h-24 w-24 rounded-lg" />
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-black/60"
                    >
                      <Icon as={X} size={14} className="text-white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Tokenization Section */}
            <View className="mt-6 rounded-xl border border-border p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Icon as={Coins} size={20} className="text-purple-600" />
                  <Text className="font-semibold">{t('feed.tokenizePost')}</Text>
                </View>
                <Switch
                  value={isTokenized}
                  onValueChange={setIsTokenized}
                  trackColor={{ false: '#E4DFFF', true: '#6e54ff' }}
                  thumbColor="#ffffff"
                />
              </View>

              {isTokenized && (
                <View className="mt-4 gap-3">
                  <View>
                    <Text className="mb-1 text-sm text-muted-foreground">{t('feed.tokenSupply')}</Text>
                    <TextInput
                      value={tokenSupply}
                      onChangeText={setTokenSupply}
                      placeholder="1000"
                      keyboardType="numeric"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                    />
                  </View>
                  <View>
                    <Text className="mb-1 text-sm text-muted-foreground">{t('feed.pricePerToken')}</Text>
                    <TextInput
                      value={tokenPrice}
                      onChangeText={setTokenPrice}
                      placeholder="0.01"
                      keyboardType="decimal-pad"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                    />
                  </View>
                  <View className="rounded-lg bg-purple-50 dark:bg-purple-950 p-3">
                    <Text className="text-xs text-purple-700 dark:text-purple-300">
                      💡 {t('feed.tokenTip')}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Add Images Button */}
            <TouchableOpacity
              onPress={pickImages}
              disabled={images.length >= 4}
              className="mt-4 flex-row items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4"
            >
              <Icon as={ImagePlus} size={24} className="text-muted-foreground" />
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
