import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

export default function TermsPrivacyScreen() {
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
          <Text className="text-2xl font-bold tracking-tight text-foreground">Terms & Privacy</Text>
        </View>

        {/* Last Updated */}
        <View className="mt-4 px-4">
          <View className="self-start rounded-full border border-border bg-secondary px-3 py-1">
            <Text className="text-2xs font-medium text-muted-foreground">
              Last updated: March 6, 2026
            </Text>
          </View>
        </View>

        {/* Terms of Service */}
        <View className="mt-6 px-4">
          <Text className="text-xl font-bold tracking-tight text-foreground">Terms of Service</Text>

          <View className="mt-4 gap-4">
            <View>
              <Text className="text-sm font-semibold text-foreground">1. Acceptance of Terms</Text>
              <Text className="mt-2 text-sm leading-5 text-muted-foreground">
                By accessing and using this Monad mobile application, you accept and agree to be bound by the terms and provision of this agreement.
              </Text>
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground">2. Use License</Text>
              <Text className="mt-2 text-sm leading-5 text-muted-foreground">
                Permission is granted to temporarily use this application for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </Text>
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground">3. Wallet Security</Text>
              <Text className="mt-2 text-sm leading-5 text-muted-foreground">
                You are responsible for maintaining the security of your wallet and recovery phrase. We cannot recover lost or stolen funds. Never share your recovery phrase with anyone.
              </Text>
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground">4. Transaction Fees</Text>
              <Text className="mt-2 text-sm leading-5 text-muted-foreground">
                All transactions on the Monad network incur network fees. These fees are paid to network validators and are not controlled by this application.
              </Text>
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground">5. Prohibited Activities</Text>
              <Text className="mt-2 text-sm leading-5 text-muted-foreground">
                You may not use this application for any illegal activities, including but not limited to money laundering, fraud, or financing illegal activities.
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy Policy */}
        <View className="mt-8 px-4">
          <Text className="text-xl font-bold tracking-tight text-foreground">Privacy Policy</Text>

          <View className="mt-4 gap-4">
            <View>
              <Text className="text-sm font-semibold text-foreground">1. Information We Collect</Text>
              <Text className="mt-2 text-sm leading-5 text-muted-foreground">
                We collect information you provide directly to us, including your name, email address, and profile information. We also collect wallet addresses and transaction data from the blockchain.
              </Text>
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground">2. How We Use Your Information</Text>
              <Text className="mt-2 text-sm leading-5 text-muted-foreground">
                We use the information we collect to provide, maintain, and improve our services, to process transactions, and to communicate with you about your account.
              </Text>
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground">3. Information Sharing</Text>
              <Text className="mt-2 text-sm leading-5 text-muted-foreground">
                We do not sell your personal information. We may share information with service providers who perform services on our behalf, or when required by law.
              </Text>
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground">4. Data Security</Text>
              <Text className="mt-2 text-sm leading-5 text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
              </Text>
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground">5. Your Rights</Text>
              <Text className="mt-2 text-sm leading-5 text-muted-foreground">
                You have the right to access, update, or delete your personal information. You can do this through your account settings or by contacting us directly.
              </Text>
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground">6. Cookies and Tracking</Text>
              <Text className="mt-2 text-sm leading-5 text-muted-foreground">
                We use cookies and similar tracking technologies to track activity on our application and hold certain information to improve user experience.
              </Text>
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground">7. Children&apos;s Privacy</Text>
              <Text className="mt-2 text-sm leading-5 text-muted-foreground">
                Our service is not intended for children under 18. We do not knowingly collect personal information from children under 18.
              </Text>
            </View>
          </View>
        </View>

        {/* Contact */}
        <View className="mt-8 px-4 pb-10">
          <View className="rounded-2xl border border-border bg-accent p-5">
            <Text className="text-sm font-semibold text-foreground">Questions or Concerns?</Text>
            <Text className="mt-2 text-sm leading-5 text-muted-foreground">
              If you have any questions about these Terms or Privacy Policy, please contact us at:
            </Text>
            <Text className="mt-2 text-sm font-semibold text-primary">legal@pulse.app</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
