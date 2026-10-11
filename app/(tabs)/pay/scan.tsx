import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Zap, Image as ImageIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';

export default function ScanQRScreen() {
  const [isScanning, setIsScanning] = useState(false);

  const handleStartScan = () => {
    setIsScanning(true);
    // Simulate scanning
    setTimeout(() => {
      setIsScanning(false);
      router.push('/wallet/send');
    }, 2000);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 pt-12">
        <Text className="text-3xl font-bold">Scan QR Code</Text>
      </View>

      {/* Scanner Frame */}
      <View className="mt-8 flex-1 items-center justify-center px-4">
        <View className="relative h-80 w-80 items-center justify-center rounded-3xl border-4 border-purple-600">
          {/* Corner brackets */}
          <View className="absolute left-4 top-4 h-12 w-12 border-l-4 border-t-4 border-foreground" />
          <View className="absolute right-4 top-4 h-12 w-12 border-r-4 border-t-4 border-foreground" />
          <View className="absolute bottom-4 left-4 h-12 w-12 border-b-4 border-l-4 border-foreground" />
          <View className="absolute bottom-4 right-4 h-12 w-12 border-b-4 border-r-4 border-foreground" />
          
          {/* Scanning line */}
          {isScanning && (
            <View className="absolute h-1 w-full bg-[#0e100f]" />
          )}
        </View>
      </View>

      {/* Actions */}
      <View className="gap-4 p-4">
        <TouchableOpacity
          onPress={handleStartScan}
          className="flex-row items-center justify-center gap-2 rounded-2xl bg-primary py-4"
        >
          <Icon as={Zap} size={20} className="text-primary-foreground" />
          <Text className="text-lg font-semibold text-primary-foreground">
            {isScanning ? 'Scanning...' : 'Start Scan'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-center gap-2 py-4">
          <Icon as={ImageIcon} size={20} className="text-purple-600" />
          <Text className="font-semibold text-purple-600">Upload from Gallery</Text>
        </TouchableOpacity>

        {/* How to Scan */}
        <View className="rounded-2xl bg-purple-900 p-6">
          <Text className="text-lg font-semibold text-white">How to Scan</Text>
          <View className="mt-3 gap-2">
            <Text className="text-sm text-purple-200">1. Point camera at QR code</Text>
            <Text className="text-sm text-purple-200">2. Hold steady until scanned.</Text>
            <Text className="text-sm text-purple-200">3. Review details and send.</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
