import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

type BLEDevice = { id: string; name?: string };

export default function useBLE() {
  const [devices, setDevices] = useState<BLEDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BLEDevice | null>(null);
  const recvInterval = useRef<number | null>(null);

  const requestPermissions = async () => {
    // In web / Expo Go we don't have native BLE access; return true for UI flow.
    // On native, app can later replace this implementation with real react-native-ble-plx logic.
    return true;
  };

  const scanForDevices = (onDeviceFound?: () => void) => {
    // Simulate a scan and return a single mock device after 1.5s
    setDevices([]);
    setTimeout(() => {
      const mock = { id: 'MOCK:01:23:45', name: 'WheelSense IoT Module' };
      setDevices([mock]);
      if (onDeviceFound) onDeviceFound();
    }, 1500);
  };

  const connectToDevice = async (device: BLEDevice) => {
    // Simulate connection delay
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setConnectedDevice(device);
        resolve();
      }, 1000);
    });
  };

  const disconnectDevice = async () => {
    if (recvInterval.current) {
      clearInterval(recvInterval.current);
      recvInterval.current = null;
    }
    setConnectedDevice(null);
  };

  const startReceiving = async (device: BLEDevice | null, onDataReceived?: (d: any) => void) => {
    if (!device) return;
    // Simulate streaming IMU data every 600ms
    if (recvInterval.current) clearInterval(recvInterval.current);
    recvInterval.current = setInterval(() => {
      const imu = {
        seq: Math.floor(Math.random() * 65535),
        ax: parseFloat((Math.random() * 2 - 1).toFixed(3)),
        ay: parseFloat((Math.random() * 2 - 1).toFixed(3)),
        az: parseFloat((Math.random() * 2 - 1).toFixed(3)),
        accelMag: parseFloat((Math.random() * 2).toFixed(3)),
      };
      if (onDataReceived) onDataReceived(imu);
    }, 600) as unknown as number;
  };

  useEffect(() => {
    return () => {
      if (recvInterval.current) clearInterval(recvInterval.current);
    };
  }, []);

  return {
    requestPermissions,
    scanForDevices,
    connectToDevice,
    disconnectDevice,
    startReceiving,
    devices,
    connectedDevice,
  };
}
