import { useEffect, useState } from 'react';
import { Linking as RNLinking, Platform, Pressable, Text, View } from 'react-native';

const APK_URL =
  process.env.EXPO_PUBLIC_APK_URL ||
  'https://expo.dev/artifacts/eas/0BBF4LyT28P_GDXwACOtHzN-hyeo8KPyfjIWAQniWWg.apk';
const DISMISS_KEY = 'pulse:download_banner:dismissed';

function isAndroidWeb() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  return /android/i.test(window.navigator.userAgent);
}

export default function AppDownloadBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isAndroidWeb()) return;
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(DISMISS_KEY) === '1';
    } catch {}
    if (!dismissed) setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {}
    setVisible(false);
  };

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        backgroundColor: '#6e54ff',
        borderTopWidth: 1,
        borderTopColor: 'rgba(247, 201, 72, 0.35)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 14,
        paddingHorizontal: 16,
        gap: 12,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -2 },
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: '#6E54FF',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#6e54ff', fontWeight: '800', fontSize: 20 }}>
          L
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
          Get the Pulse app
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
          Faster, offline-ready, on any Android device
        </Text>
      </View>
      <Pressable
        onPress={() => RNLinking.openURL(APK_URL)}
        style={{
          backgroundColor: '#6E54FF',
          borderRadius: 8,
          paddingHorizontal: 14,
          paddingVertical: 9,
        }}
      >
        <Text style={{ color: '#6e54ff', fontWeight: '700', fontSize: 13 }}>
          Download
        </Text>
      </Pressable>
      <Pressable onPress={dismiss} hitSlop={10} accessibilityLabel="Dismiss">
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 22, paddingHorizontal: 4 }}>
          ×
        </Text>
      </Pressable>
    </View>
  );
}