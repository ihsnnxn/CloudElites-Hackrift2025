import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useBLEContext } from './BLEContext';
import { ThemedText } from './themed-text';

export default function LogConsole() {
  const { connectedDevice, startReceiving } = useBLEContext();
  const [logMessages, setLogMessages] = useState<any[]>([]);

  useEffect(() => {
    if (connectedDevice) {
      startReceiving(connectedDevice, (newData: any) => {
        setLogMessages((prev) => {
          const updated = [...prev, newData];
          return updated;
        });
      });
    }
  }, [connectedDevice]);

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <ThemedText style={{ fontWeight: '700', marginBottom: 10 }}>BLE Log Console</ThemedText>
      <View style={{ marginTop: 10 }}>
        {logMessages.length > 0 ? (
          logMessages.map((msg, index) => (
            <ThemedText key={index} style={{ marginBottom: 5 }}>{JSON.stringify(msg)}</ThemedText>
          ))
        ) : (
          <ThemedText type="default">Waiting for data...</ThemedText>
        )}
      </View>
    </ScrollView>
  );
}
