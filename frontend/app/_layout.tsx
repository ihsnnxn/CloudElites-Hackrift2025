
import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BLEProvider } from '@/components/BLEContext';
import ScamWarningModal from '@/components/ScamWarningModal';
import AsyncStorage from '@/utils/asyncStorage';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const seen = await AsyncStorage.getItem('scamWarningSeen');
        if (!seen) setShowWarning(true);
      } catch {}
    })();
  }, []);

  const handleCloseWarning = async () => {
    setShowWarning(false);
    try {
      await AsyncStorage.setItem('scamWarningSeen', '1');
    } catch {}
  };

  return (
    <BLEProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ScamWarningModal visible={showWarning} onClose={handleCloseWarning} />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </BLEProvider>
  );
}
