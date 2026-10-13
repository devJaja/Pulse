import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal, FlatList } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, Send, X, AlertCircle, QrCode, Users, Search } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useProfile } from '@/hooks/useProfile';
import type { User } from '@/types';

export default function SendMoneyScreen() {
  const { balance, sendMon, isSending } = useWallet();
  const { searchUsers } = useProfile();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [memo, setMemo] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errors, setErrors] = useState({ amount: '', recipient: '' });
  const [permission, requestPermission] = useCameraPermissions();

  const quickAmounts = ['0.1', '0.5', '1', '2'];

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectContact = (user: User) => {
    setRecipient(user.walletAddress);
    setMemo(`Payment to @${user.username}`);
    setShowContactsModal(false);
    toast.success(`Selected ${user.name || user.username}`);
  };

  const handleQRScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        toast.error('Camera permission is required to scan QR codes');
        return;
      }
    }
    setShowScanModal(true);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setRecipient(data);
    setShowScanModal(false);
    toast.success('Address scanned!');
  };

  const validateInputs = () => {
    const newErrors = { amount: '', recipient: '' };
    let isValid = true;

    // Validate amount
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum)) {
      newErrors.amount = 'Please enter a valid amount';
      isValid = false;
    } else if (amountNum <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
      isValid = false;
    } else if (amountNum > balance) {
      newErrors.amount = `Insufficient balance. You have ${balance.toFixed(4)} MON`;
      isValid = false;
    }

    // Validate recipient
    if (!recipient.trim()) {
      newErrors.recipient = 'Please enter a recipient address';
      isValid = false;
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(recipient.trim())) {
      newErrors.recipient = 'Invalid Monad address';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSend = () => {
    if (validateInputs()) {
      setShowConfirmModal(true);
    }
  };

  const confirmSend = () => {
    const amountNum = parseFloat(amount);
    sendMon({ 
      toAddress: recipient, 
      amount: amountNum, 
      memo: memo || undefined 
    });
    setShowConfirmModal(false);
    // Reset form
    setAmount('');
    setRecipient('');
    setMemo('');
    setErrors({ amount: '', recipient: '' });
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center gap-3 px-4 pt-12">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-soft active:bg-accent"
          >
            <Icon as={ArrowLeft} size={20} className="text-foreground" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">Send MON</Text>
        </View>

        {/* Balance Display */}
        <View className="mx-4 mt-6 rounded-2xl border border-primary/15 bg-accent p-4">
          <Text className="text-xs font-semibold uppercase tracking-wide text-accent-foreground/70">
            Available Balance
          </Text>
          <Text className="mt-1 text-2xl font-bold tabular-nums text-accent-foreground">
            {balance.toFixed(4)} MON
          </Text>
        </View>

        {/* Recipient Address */}
        <View className="mt-6 px-4">
          <Text className="mb-2 text-sm font-medium text-foreground">Recipient Address</Text>
          <View
            className={`rounded-xl border bg-card px-4 py-1 ${
              errors.recipient ? 'border-2 border-destructive' : 'border-border'
            }`}
          >
            <TextInput
              value={recipient}
              onChangeText={(text) => {
                setRecipient(text);
                setErrors({ ...errors, recipient: '' });
              }}
              placeholder="Enter Monad wallet address"
              placeholderTextColor="#727285"
              className="py-3.5 font-mono text-sm text-foreground"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {errors.recipient ? (
            <View className="mt-2 flex-row items-center gap-1">
              <Icon as={AlertCircle} size={14} className="text-destructive" />
              <Text className="text-sm text-destructive">{errors.recipient}</Text>
            </View>
          ) : null}
          
          {/* Quick Actions */}
          <View className="mt-3 flex-row gap-3">
            <TouchableOpacity
              onPress={handleQRScan}
              activeOpacity={0.7}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-primary/15 bg-accent py-3 active:bg-accent/70"
            >
              <Icon as={QrCode} size={18} className="text-accent-foreground" />
              <Text className="font-semibold text-accent-foreground">Scan QR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setShowContactsModal(true)}
              activeOpacity={0.7}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-primary/15 bg-accent py-3 active:bg-accent/70"
            >
              <Icon as={Users} size={18} className="text-accent-foreground" />
              <Text className="font-semibold text-accent-foreground">Contacts</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount */}
        <View className="mt-6 px-4">
          <Text className="mb-2 text-sm font-medium text-foreground">Amount (MON)</Text>
          <View
            className={`rounded-xl border bg-card px-4 py-1 ${
              errors.amount ? 'border-2 border-destructive' : 'border-border'
            }`}
          >
            <TextInput
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                setErrors({ ...errors, amount: '' });
              }}
              keyboardType="decimal-pad"
              className="py-2.5 text-2xl font-semibold tabular-nums text-foreground"
              placeholder="0.00"
              placeholderTextColor="#727285"
            />
          </View>
          {errors.amount ? (
            <View className="mt-2 flex-row items-center gap-1">
              <Icon as={AlertCircle} size={14} className="text-destructive" />
              <Text className="text-sm text-destructive">{errors.amount}</Text>
            </View>
          ) : null}

          {/* Quick Amount Buttons */}
          <View className="mt-4 flex-row gap-3">
            {quickAmounts.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                onPress={() => setAmount(quickAmount)}
                activeOpacity={0.7}
                className="flex-1 items-center rounded-xl border border-border bg-card py-3 shadow-soft active:bg-accent"
              >
                <Text className="font-semibold tabular-nums text-card-foreground">{quickAmount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Memo (Optional) */}
        <View className="mt-6 px-4">
          <Text className="mb-2 text-sm font-medium text-foreground">Memo (Optional)</Text>
          <View className="rounded-xl border border-border bg-card px-4 py-1">
            <TextInput
              value={memo}
              onChangeText={setMemo}
              placeholder="Add a note..."
              placeholderTextColor="#727285"
              className="py-3.5 text-foreground"
              maxLength={100}
            />
          </View>
        </View>

        {/* Transaction Info */}
        <View className="mx-4 mt-6 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Transaction Details
          </Text>
          <View className="mt-3 gap-2.5">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted-foreground">Network</Text>
              <Text className="text-sm font-medium text-card-foreground">Monad Testnet</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted-foreground">Network Fee</Text>
              <Text className="text-sm font-medium tabular-nums text-card-foreground">~0.00001 MON</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Send Button */}
      <View className="border-t border-border bg-background p-4">
        <TouchableOpacity 
          onPress={handleSend}
          disabled={isSending || !amount || !recipient}
          activeOpacity={0.85}
          className={`flex-row items-center justify-center gap-2 rounded-xl py-4 shadow-soft ${
            isSending || !amount || !recipient ? 'bg-muted' : 'bg-primary active:bg-primary/90'
          }`}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Icon
                as={Send}
                size={20}
                className={isSending || !amount || !recipient ? 'text-muted-foreground' : 'text-primary-foreground'}
              />
              <Text
                className={`text-base font-semibold ${
                  isSending || !amount || !recipient ? 'text-muted-foreground' : 'text-primary-foreground'
                }`}
              >
                Send {amount || '0'} MON
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/60 px-4">
          <View className="w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-elevated">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-foreground">Confirm Transaction</Text>
              <TouchableOpacity
                onPress={() => setShowConfirmModal(false)}
                activeOpacity={0.7}
                className="h-8 w-8 items-center justify-center rounded-full bg-muted active:bg-accent"
              >
                <Icon as={X} size={18} className="text-foreground" />
              </TouchableOpacity>
            </View>

            <View className="mt-6 gap-3">
              <View className="rounded-xl border border-border bg-card p-4">
                <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Amount
                </Text>
                <Text className="mt-1 text-2xl font-bold tabular-nums text-primary">{amount} MON</Text>
              </View>

              <View className="rounded-xl border border-border bg-card p-4">
                <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  To
                </Text>
                <Text className="mt-1 font-mono text-sm text-card-foreground">
                  {recipient.slice(0, 20)}...
                </Text>
              </View>

              {memo && (
                <View className="rounded-xl border border-border bg-card p-4">
                  <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Memo
                  </Text>
                  <Text className="mt-1 text-card-foreground">{memo}</Text>
                </View>
              )}

              <View className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                <View className="flex-row items-start gap-2">
                  <Icon as={AlertCircle} size={20} className="text-yellow-600 dark:text-yellow-400" />
                  <Text className="flex-1 text-sm text-yellow-800 dark:text-yellow-200">
                    Please verify the recipient address. Transactions cannot be reversed.
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-6 flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowConfirmModal(false)}
                activeOpacity={0.7}
                className="flex-1 items-center rounded-xl border border-border bg-card py-3.5 active:bg-accent"
              >
                <Text className="text-base font-semibold text-foreground">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmSend}
                disabled={isSending}
                activeOpacity={0.85}
                className="flex-1 items-center justify-center rounded-xl bg-primary py-3.5 active:bg-primary/90"
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-base font-semibold text-primary-foreground">Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* QR Scanner Modal */}
      <Modal
        visible={showScanModal}
        animationType="slide"
        onRequestClose={() => setShowScanModal(false)}
      >
        <View className="flex-1 bg-black">
          {/* Header */}
          <View className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between bg-black/60 px-4 pt-12 pb-4">
            <Text className="text-xl font-bold text-white">Scan QR Code</Text>
            <TouchableOpacity
              onPress={() => setShowScanModal(false)}
              activeOpacity={0.7}
              className="h-9 w-9 items-center justify-center rounded-full bg-white/10"
            >
              <Icon as={X} size={22} className="text-white" />
            </TouchableOpacity>
          </View>

          {/* Camera */}
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          >
            {/* Scanning Frame */}
            <View className="flex-1 items-center justify-center">
              <View className="h-64 w-64 rounded-3xl border-2 border-white/70" />
              <Text className="mt-6 text-center text-white/90">
                Position the QR code within the frame
              </Text>
            </View>
          </CameraView>
        </View>
      </Modal>

      {/* Contacts Modal */}
      <Modal
        visible={showContactsModal}
        animationType="slide"
        onRequestClose={() => setShowContactsModal(false)}
      >
        <View className="flex-1 bg-background">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-border px-4 pt-12 pb-4">
            <Text className="text-2xl font-bold text-foreground">Select Contact</Text>
            <TouchableOpacity
              onPress={() => setShowContactsModal(false)}
              activeOpacity={0.7}
              className="h-9 w-9 items-center justify-center rounded-full border border-border bg-card active:bg-accent"
            >
              <Icon as={X} size={20} className="text-foreground" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View className="px-4 pt-4">
            <View className="flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-soft">
              <Icon as={Search} size={20} className="text-muted-foreground" />
              <TextInput
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="Search by username or name..."
                placeholderTextColor="#727285"
                className="flex-1 text-base text-foreground"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Results */}
          <View className="flex-1 px-4 pt-4">
            {isSearching ? (
              <View className="items-center py-20">
                <ActivityIndicator size="large" color="#6e54ff" />
              </View>
            ) : searchResults.length === 0 ? (
              <View className="items-center py-20">
                <View className="h-20 w-20 items-center justify-center rounded-full bg-accent">
                  <Icon as={Users} size={34} className="text-primary" strokeWidth={1.8} />
                </View>
                <Text className="mt-4 text-muted-foreground">
                  {searchQuery ? 'No users found' : 'Search for users to send MON'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => selectContact(item)}
                    activeOpacity={0.7}
                    className="mb-3 flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft active:bg-accent/50"
                  >
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Text className="text-base font-bold text-primary">
                        {(item.name || item.username).charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-card-foreground">{item.name || item.username}</Text>
                      <Text className="text-sm text-muted-foreground">@{item.username}</Text>
                    </View>
                    <Icon as={Send} size={20} className="text-primary" />
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
