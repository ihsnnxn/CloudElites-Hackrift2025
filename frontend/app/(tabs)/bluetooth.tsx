import React from 'react';
import { ScrollView, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import DeviceConnection from '@/components/DeviceConnection';
import LogConsole from '@/components/LogConsole';

export default function BluetoothScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={{ borderRadius: 12, padding: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6ECF1' }}>
        <ThemedText type="subtitle">Bluetooth Device Management</ThemedText>
        <ThemedText style={{ marginTop: 6 }}>Scan, connect, and view live telemetry from your Pet Robot.</ThemedText>
      </View>

      <View style={{ height: 340, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E6ECF1', backgroundColor: '#fff' }}>
        <DeviceConnection />
      </View>

      <View style={{ borderRadius: 12, padding: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6ECF1' }}>
        <LogConsole />
      </View>
    </ScrollView>
  );
}
