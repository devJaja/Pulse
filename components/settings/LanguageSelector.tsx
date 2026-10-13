import { View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Globe, Check, ChevronRight, X } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { toast } from 'sonner-native';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
];

export function LanguageSelector() {
  const [showModal, setShowModal] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    console.log('LanguageSelector mounted');
  }, []);

  const currentLanguage = LANGUAGES.find(lang => lang.code === currentLang) || LANGUAGES[0];

  const handlePress = () => {
    console.log('Language button pressed');
    setShowModal(true);
  };

  const handleLanguageChange = (languageCode: string) => {
    console.log('Language selected:', languageCode);
    try {
      // For now, just update local state
      // i18n integration will be added later
      setCurrentLang(languageCode);
      const language = LANGUAGES.find(lang => lang.code === languageCode);
      toast.success(`Language changed to ${language?.nativeName}`);
      setShowModal(false);
    } catch (error) {
      console.error('Language change error:', error);
      toast.error('Failed to change language');
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handlePress}
        className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
        activeOpacity={0.7}
      >
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/15">
          <Icon as={Globe} size={20} className="text-blue-600 dark:text-blue-300" />
        </View>
        <View className="flex-1">
          <Text className="font-semibold">Language</Text>
          <Text className="mt-0.5 text-sm text-muted-foreground">
            {currentLanguage.nativeName}
          </Text>
        </View>
        <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="max-h-[80%] rounded-t-3xl border-t border-border bg-card px-6 pb-8 pt-6">
            <View className="mb-2 items-center">
              <View className="h-1 w-12 rounded-full bg-border" />
            </View>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-2xl font-bold">Select Language</Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                className="h-9 w-9 items-center justify-center rounded-full bg-secondary active:opacity-70"
              >
                <Icon as={X} size={20} className="text-foreground" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {LANGUAGES.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  onPress={() => handleLanguageChange(language.code)}
                  className={`mb-2 flex-row items-center justify-between rounded-xl border p-4 ${
                    currentLang === language.code
                      ? 'border-purple-200 bg-purple-50 dark:border-purple-500/30 dark:bg-purple-500/10'
                      : 'border-border bg-background'
                  }`}
                  activeOpacity={0.7}
                >
                  <View>
                    <Text className="font-semibold">{language.nativeName}</Text>
                    <Text className="mt-0.5 text-sm text-muted-foreground">{language.name}</Text>
                  </View>
                  {currentLang === language.code && (
                    <View className="h-7 w-7 items-center justify-center rounded-full bg-purple-600">
                      <Icon as={Check} size={16} className="text-white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
