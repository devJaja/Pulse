import { View, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, Search, ChevronRight, MessageCircle, Mail, Book, Video } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';

const faqs = [
  {
    id: '1',
    question: 'How do I send MON to someone?',
    answer: 'Go to the Pay tab, select Send, choose a recipient, enter the amount, and confirm the transaction.',
  },
  {
    id: '2',
    question: 'How do I receive payments?',
    answer: 'Go to the Pay tab, select Receive, and share your QR code or wallet address with the sender.',
  },
  {
    id: '3',
    question: 'Is my wallet secure?',
    answer: 'Yes, your wallet uses industry-standard encryption. Enable 2FA and biometric login for extra security.',
  },
  {
    id: '4',
    question: 'How do I backup my wallet?',
    answer: 'Go to Settings > Security & Privacy > Recovery Phrase to view and backup your recovery phrase.',
  },
  {
    id: '5',
    question: 'What are transaction fees?',
    answer: 'Monad transactions have minimal fees (usually a fraction of a cent) to process transactions on the network.',
  },
];

const contactOptions = [
  {
    id: '1',
    title: 'Live Chat',
    description: 'Chat with our support team',
    icon: MessageCircle,
    action: () => {},
  },
  {
    id: '2',
    title: 'Email Support',
    description: 'support@pulse.app',
    icon: Mail,
    action: () => Linking.openURL('mailto:support@pulse.app'),
  },
  {
    id: '3',
    title: 'Documentation',
    description: 'Read our guides and tutorials',
    icon: Book,
    action: () => {},
  },
  {
    id: '4',
    title: 'Video Tutorials',
    description: 'Watch how-to videos',
    icon: Video,
    action: () => {},
  },
];

export default function HelpSupportScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center gap-3 px-4 pt-14 pb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={12}
            className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-soft active:bg-secondary"
          >
            <Icon as={ArrowLeft} size={20} className="text-foreground" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold tracking-tight text-foreground">Help & Support</Text>
        </View>

        {/* Search */}
        <View className="mt-4 px-4">
          <View className="flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-1.5 shadow-soft">
            <Icon as={Search} size={20} className="text-muted-foreground" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for help..."
              placeholderTextColor="#727285"
              className="flex-1 py-2.5 text-base text-foreground"
            />
          </View>
        </View>

        {/* Contact Options */}
        <View className="mt-6 px-4">
          <Text className="mb-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contact Us
          </Text>
          <View className="gap-3">
            {contactOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={option.action}
                className="flex-row items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft active:bg-secondary"
              >
                <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Icon as={option.icon} size={20} className="text-primary" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">{option.title}</Text>
                  <Text className="text-2xs text-muted-foreground">{option.description}</Text>
                </View>
                <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQs */}
        <View className="mt-6 px-4 pb-8">
          <Text className="mb-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
            Frequently Asked Questions
          </Text>
          <View className="gap-3">
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedFaq === faq.id;
              return (
                <TouchableOpacity
                  key={faq.id}
                  onPress={() => setExpandedFaq(isExpanded ? null : faq.id)}
                  className="rounded-2xl border border-border bg-card p-4 shadow-soft active:bg-secondary"
                >
                  <View className="flex-row items-center justify-between gap-3">
                    <Text className="flex-1 text-sm font-semibold text-foreground">
                      {faq.question}
                    </Text>
                    <Icon
                      as={ChevronRight}
                      size={18}
                      className={`text-muted-foreground ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </View>
                  {isExpanded && (
                    <Text className="mt-3 text-sm leading-5 text-muted-foreground">{faq.answer}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
