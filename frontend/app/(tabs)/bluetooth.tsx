
import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import DeviceConnection from '@/components/DeviceConnection';
import LogConsole from '@/components/LogConsole';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function BluetoothScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, backgroundColor: themeColors.background }}>
      <View style={[styles.card, { backgroundColor: themeColors.cardSecondary, borderColor: themeColors.cardBorder }] }>
        <ThemedText type="subtitle">Bluetooth Device Management</ThemedText>
        <ThemedText style={{ marginTop: 6, color: themeColors.text }}>Scan, connect, and view live telemetry from your Pet Robot.</ThemedText>
      </View>

      <View style={[styles.deviceCard, { backgroundColor: themeColors.cardSecondary, borderColor: themeColors.cardBorder }] }>
        <DeviceConnection />
      </View>

      <View style={[styles.card, { backgroundColor: themeColors.cardSecondary, borderColor: themeColors.cardBorder }] }>
        <LogConsole />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 0,
  },
  deviceCard: {
    height: 340,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 0,
  },
});
