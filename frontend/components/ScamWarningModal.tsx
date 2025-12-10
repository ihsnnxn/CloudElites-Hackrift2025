import React from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function ScamWarningModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <ThemedView style={styles.modal}>
          <ThemedText type="title" style={styles.title}>Security Warning</ThemedText>
          <ThemedText style={styles.body}>
            Be aware of impersonation scams. Government officials will NEVER ask you to transfer money or disclose bank log-in details over a phone call.
          </ThemedText>
          <ThemedText style={styles.body}>
            If you receive such a request, do not comply and report it to the authorities. Stay vigilant against scams and malware.
          </ThemedText>
          <Pressable style={styles.button} onPress={onClose} accessibilityRole="button">
            <ThemedText type="defaultSemiBold" style={styles.buttonText}>I Understand</ThemedText>
          </Pressable>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#0FA958',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
