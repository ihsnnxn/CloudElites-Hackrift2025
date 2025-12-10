import React, { useEffect, useState } from 'react';
import { View, Button, Text, ScrollView } from 'react-native';
import { useBLEContext } from './BLEContext';
import LoadingScreen from './LoadingScreen';
import { ThemedText } from './themed-text';

export default function DeviceConnection() {
  const { requestPermissions, scanForDevices, devices, connectToDevice, disconnectDevice, connectedDevice } = useBLEContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    const init = async () => {
      const granted = await requestPermissions();
      if (granted) {
        // permission ok
      }
    };
    init();
  }, []);

  const handleScan = () => {
    setIsScanning(true);
    scanForDevices(() => setIsScanning(false));
  };

  const handleConnect = async (device: any) => {
    setIsLoading(true);
    try {
      await connectToDevice(device);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connectedDevice) return;
    setIsDisconnecting(true);
    try {
      await disconnectDevice();
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isLoading) return <LoadingScreen message="Connecting to Device" />;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {!isScanning && (
        <View style={{ marginBottom: 20, alignItems: 'center' }}>
          <Button title="Scan for Devices" onPress={handleScan} />
        </View>
      )}

      <ThemedText style={{ marginVertical: 10 }}>{connectedDevice ? `Connected to: ${connectedDevice.name}` : 'Not connected'}</ThemedText>

      {devices.map((device: any) => (
        <View style={{ width: '100%', marginVertical: 6 }} key={device.id}>
          <Button title={`Connect to ${device.name || 'Unnamed'}`} onPress={() => handleConnect(device)} />
        </View>
      ))}

      {connectedDevice && !isDisconnecting && (
        <View style={{ margin: 20, alignItems: 'center' }}>
          <Button title="Disconnect Device" onPress={handleDisconnect} />
        </View>
      )}
    </ScrollView>
  );
}
