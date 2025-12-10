
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ReportScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const theme = useColorScheme() ?? 'light';
  const themeColors = Colors[theme];
  const accent = useMemo(() => themeColors.accent, [themeColors]);

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
    if (!result.canceled && result.assets && result.assets.length > 0) {
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
      <ThemedView style={[styles.header, { backgroundColor: themeColors.cardSecondary, borderColor: themeColors.cardBorder }] }>
        <View style={{ flex: 1, gap: 4 }}>
          <ThemedText type="subtitle">Submit hazard</ThemedText>
          <ThemedText style={[styles.muted, { color: themeColors.muted }] }>
            One tap photo capture, optional note. Smartphone sensors verify; IoT backs up if needed.
          </ThemedText>
        </View>
        <View style={[styles.badge, { borderColor: accent, backgroundColor: themeColors.badge }] }>
          <IconSymbol name="camera.fill" color={accent} size={20} />
          <ThemedText type="defaultSemiBold" style={{ color: accent }}>
            2-tap flow
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }] }>
        <ThemedText type="defaultSemiBold">Photo</ThemedText>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.preview} contentFit="cover" />
        ) : (
          <View style={[styles.placeholder, { borderColor: themeColors.cardBorder }] }>
            <IconSymbol name="camera.fill" color={themeColors.icon} size={32} />
            <ThemedText style={[styles.muted, { color: themeColors.muted }] }>No photo yet</ThemedText>
          </View>
        )}
        <Pressable onPress={requestAndCapture} style={({ pressed }) => [styles.primaryBtn, { backgroundColor: themeColors.accent, borderColor: themeColors.accent }, pressed && styles.pressed]}>
          <ThemedText type="defaultSemiBold" style={{ color: '#0B1A12' }}>
            {photoUri ? 'Retake photo' : 'Capture hazard'}
          </ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }] }>
        <ThemedText type="defaultSemiBold">Description (optional)</ThemedText>
        <TextInput
          multiline
          placeholder="e.g. Ramp blocked by bins, use left side."
          placeholderTextColor={themeColors.mutedSecondary}
          style={[styles.textInput, { backgroundColor: themeColors.cardSecondary, borderColor: themeColors.cardBorder, color: themeColors.text }]}
          value={description}
          onChangeText={setDescription}
        />
        <ThemedView style={styles.metaRow}>
          <MetaPill label="Auto geotagged" themeColors={themeColors} />
          <MetaPill label="Tilt & vibration attached" themeColors={themeColors} />
          <MetaPill label="IoT backup ready" themeColors={themeColors} />
        </ThemedView>
      </ThemedView>

      <ThemedView style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }] }>
        <ThemedText type="subtitle">Upload</ThemedText>
        <View style={styles.uploadRow}>
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold">Verify and send</ThemedText>
            <ThemedText style={[styles.muted, { color: themeColors.muted }] }>
              AI classifies hazard; smartphone sensors confirm slope/vibration before publishing.
            </ThemedText>
          </View>
          <Pressable
            onPress={submitHazard}
            disabled={uploading}
            style={({ pressed }) => [
              styles.primaryBtn,
              styles.submitBtn,
              { backgroundColor: themeColors.accent, borderColor: themeColors.accent },
              (pressed || uploading) && styles.pressed,
            ]}>
            <ThemedText type="defaultSemiBold" style={{ color: '#0B1A12' }}>
              {uploading ? 'Uploading…' : 'Submit'}
            </ThemedText>
          </Pressable>
        </View>
        <View style={[styles.noteBox, { backgroundColor: themeColors.cardSecondary, borderColor: themeColors.cardBorder }] }>
          <ThemedText type="defaultSemiBold">Demo tip</ThemedText>
          <ThemedText style={[styles.muted, { color: themeColors.muted }] }>
            Preload one photo so judges can see instant confirmation + reroute on tap.
          </ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const MetaPill = ({ label, themeColors }: { label: string; themeColors: any }) => (
  <View style={[styles.metaPill, { backgroundColor: themeColors.progressTrack, borderColor: themeColors.cardBorder }] }>
    <ThemedText style={[styles.metaText, { color: themeColors.muted }]}>{label}</ThemedText>
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
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
  muted: {
    // color is set dynamically
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
    padding: 14,
    gap: 12,
  },
  placeholder: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  preview: {
    height: 200,
    borderRadius: 12,
  },
  primaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
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
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
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
    borderWidth: 1,
  },
  metaText: {
    // color is set dynamically
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  noteBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
});


