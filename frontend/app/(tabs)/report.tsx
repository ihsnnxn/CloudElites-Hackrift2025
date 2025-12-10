import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ReportScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const accent = useMemo(() => '#0FA958', []);

  const requestAndCapture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access to submit a hazard.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.6,
      allowsEditing: true,
      base64: false,
    });

    if (!result.canceled && result.assets?.length) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const submitHazard = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      Alert.alert('Uploaded', 'Hazard submitted. AI + sensors will verify.');
      setDescription('');
      setPhotoUri(null);
    }, 600);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={styles.header}>
        <View style={{ flex: 1, gap: 4 }}>
          <ThemedText type="subtitle">Submit hazard</ThemedText>
          <ThemedText style={styles.muted}>
            One tap photo capture, optional note. Smartphone sensors verify; IoT backs up if needed.
          </ThemedText>
        </View>
        <View style={[styles.badge, { borderColor: accent, backgroundColor: '#E6FFF2' }]}>
          <IconSymbol name="camera.fill" color={accent} size={20} />
          <ThemedText type="defaultSemiBold" style={{ color: accent }}>
            2-tap flow
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">Photo</ThemedText>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.preview} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <IconSymbol name="camera.fill" color="#6B7680" size={32} />
            <ThemedText style={styles.muted}>No photo yet</ThemedText>
          </View>
        )}
        <Pressable onPress={requestAndCapture} style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
          <ThemedText type="defaultSemiBold" style={{ color: '#0B1A12' }}>
            {photoUri ? 'Retake photo' : 'Capture hazard'}
          </ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">Description (optional)</ThemedText>
        <TextInput
          multiline
          placeholder="e.g. Ramp blocked by bins, use left side."
          placeholderTextColor="#8A9AA6"
          style={styles.textInput}
          value={description}
          onChangeText={setDescription}
        />
        <ThemedView style={styles.metaRow}>
          <MetaPill label="Auto geotagged" />
          <MetaPill label="Tilt & vibration attached" />
          <MetaPill label="IoT backup ready" />
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Upload</ThemedText>
        <View style={styles.uploadRow}>
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold">Verify and send</ThemedText>
            <ThemedText style={styles.muted}>
              AI classifies hazard; smartphone sensors confirm slope/vibration before publishing.
            </ThemedText>
          </View>
          <Pressable
            onPress={submitHazard}
            disabled={uploading}
            style={({ pressed }) => [
              styles.primaryBtn,
              styles.submitBtn,
              (pressed || uploading) && styles.pressed,
            ]}>
            <ThemedText type="defaultSemiBold" style={{ color: '#0B1A12' }}>
              {uploading ? 'Uploading…' : 'Submit'}
            </ThemedText>
          </Pressable>
        </View>
        <View style={styles.noteBox}>
          <ThemedText type="defaultSemiBold">Demo tip</ThemedText>
          <ThemedText style={styles.muted}>
            Preload one photo so judges can see instant confirmation + reroute on tap.
          </ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const MetaPill = ({ label }: { label: string }) => (
  <View style={styles.metaPill}>
    <ThemedText style={styles.metaText}>{label}</ThemedText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14,
  },
  header: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6ECF1',
    padding: 14,
    backgroundColor: '#F7FBFF',
    flexDirection: 'row',
    gap: 12,
  },
  muted: {
    color: '#566470',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6ECF1',
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 12,
  },
  placeholder: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#C7D3DC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  preview: {
    height: 200,
    borderRadius: 12,
  },
  primaryBtn: {
    backgroundColor: '#6CF2AA',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6CF2AA',
    alignItems: 'center',
  },
  submitBtn: {
    minWidth: 120,
  },
  pressed: {
    opacity: 0.85,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E6ECF1',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F7FBFF',
    minHeight: 100,
    textAlignVertical: 'top',
    color: '#0B1A12',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#ECF4FF',
    borderWidth: 1,
    borderColor: '#D4E2F0',
  },
  metaText: {
    color: '#3D5060',
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  noteBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F7FBFF',
    borderWidth: 1,
    borderColor: '#E6ECF1',
    gap: 6,
  },
});


