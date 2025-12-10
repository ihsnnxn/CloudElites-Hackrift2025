import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { ThemedText } from './themed-text';

export default function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: 20,
      }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <ThemedText style={{ marginTop: 16, fontSize: 16, textAlign: 'center' }}>
        {message}
      </ThemedText>
    </View>
  );
}
