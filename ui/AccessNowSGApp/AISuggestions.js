import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Modal } from 'react-native';

const suggestions = [
  'Rain approaching: Here are 3 wheelchair-friendly indoor activities near you.',
  'Your friend Alex is nearby — want to meet at a café with barrier-free access?',
  'Based on your previous outings, you may like these wheelchair-friendly parks.'
];

export default function AISuggestions() {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);

  const showNext = () => setCurrent((current + 1) % suggestions.length);

  return (
    <View style={styles.container}>
      <Button title="Show AI Suggestion" onPress={() => setVisible(true)} />
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.suggestion}>{suggestions[current]}</Text>
            <Button title="Next" onPress={showNext} />
            <Button title="Close" onPress={() => setVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 16 },
  modalBg: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 12, alignItems: 'center' },
  suggestion: { fontSize: 18, marginBottom: 16, textAlign: 'center' }
});
