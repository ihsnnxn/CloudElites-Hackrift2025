import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Speech from 'expo-speech';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const routeSegments = [
  { id: 'seg-1', label: 'Ramp access', color: '#18B26B', distance: '120m' },
  { id: 'seg-2', label: 'Mild slope', color: '#F1C40F', distance: '80m' },
  { id: 'seg-3', label: 'Rough paving', color: '#E74C3C', distance: '40m' },
];

const hazardAlerts = [
  { id: 'haz-1', title: 'Temporary bin blocking ramp', severity: 'high', distance: '60m ahead' },
  { id: 'haz-2', title: 'Slight vibration on tiles', severity: 'medium', distance: '120m ahead' },
];

const directions = [
  'Head north 50m to the green ramp.',
  'Stay left; slight slope for 80m.',
  'Rough tiles ahead — slowing recommended.',
  'Turn right at sheltered walkway.',
];

export default function NavigateScreen() {
  const [speaking, setSpeaking] = useState(false);
  const accent = useMemo(() => '#18B26B', []);

  const speakNext = (line: string) => {
    setSpeaking(true);
    Speech.speak(line, {
      rate: 1,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={styles.header}>
        <View style={{ flex: 1 }}>
          <ThemedText type="subtitle">Route to: Nearest MRT (wheelchair gate)</ThemedText>
          <ThemedText style={styles.headerNote}>
            Smartphone sensors active • IoT on standby if GPS drifts
          </ThemedText>
        </View>
        <View style={styles.badge}>
          <IconSymbol name="waveform.path" color={accent} size={18} />
          <ThemedText style={styles.badgeText}>Live</ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.mapCard}>
        <View style={styles.mapHeader}>
          <ThemedText type="defaultSemiBold">Map + hazard overlays</ThemedText>
          <View style={styles.legendRow}>
            <Legend color="#18B26B" label="Safe" />
            <Legend color="#F1C40F" label="Mild" />
            <Legend color="#E74C3C" label="High" />
          </View>
        </View>
        <View style={styles.mapFrame}>
          {routeSegments.map((segment, idx) => (
            <View
              key={segment.id}
              style={[
                styles.routeLine,
                {
                  backgroundColor: segment.color,
                  width: `${70 - idx * 10}%`,
                  left: `${8 + idx * 6}%`,
                },
              ]}
            />
          ))}
          <View style={styles.positionDot} />
          <View style={[styles.marker, { top: '15%', backgroundColor: '#E74C3C' }]} />
          <View style={[styles.marker, { top: '45%', backgroundColor: '#F1C40F' }]} />
        </View>
        <View style={styles.segmentRow}>
          {routeSegments.map((segment) => (
            <View key={segment.id} style={styles.segmentChip}>
              <View style={[styles.dot, { backgroundColor: segment.color }]} />
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">{segment.label}</ThemedText>
                <ThemedText style={styles.muted}>{segment.distance}</ThemedText>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.mapActions}>
          <PrimaryButton
            label="Start navigation"
            onPress={() => speakNext('Starting accessible navigation. Ramp in 50 meters.')}
          />
          <SecondaryButton
            label="Reroute on hazard"
            onPress={() => speakNext('Rerouting to avoid blocked ramp ahead.')}
          />
        </View>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Hazard alerts</ThemedText>
        <View style={{ gap: 10 }}>
          {hazardAlerts.map((hazard) => (
            <View
              key={hazard.id}
              style={[
                styles.alert,
                hazard.severity === 'high' ? styles.alertHigh : styles.alertMedium,
              ]}>
              <IconSymbol
                name="exclamationmark.triangle.fill"
                color={hazard.severity === 'high' ? '#B02A2A' : '#B8860B'}
                size={20}
              />
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">{hazard.title}</ThemedText>
                <ThemedText style={styles.muted}>{hazard.distance}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Step-by-step guidance</ThemedText>
        <View style={{ gap: 8 }}>
          {directions.map((step, idx) => (
            <View key={step} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <ThemedText type="defaultSemiBold">{idx + 1}</ThemedText>
              </View>
              <ThemedText style={{ flex: 1 }}>{step}</ThemedText>
              <Pressable onPress={() => speakNext(step)} style={styles.speakButton}>
                <IconSymbol name="paperplane.fill" color="#0B1A12" size={16} />
              </Pressable>
            </View>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Sensor feedback</ThemedText>
        <View style={styles.sensorRow}>
          <SensorBar label="Tilt" value={12} unit="deg" color="#18B26B" />
          <SensorBar label="Vibration" value={0.32} unit="g" color="#F39C12" />
          <SensorBar label="GPS drift" value={2.5} unit="m" color="#3498DB" />
        </View>
        <ThemedText style={styles.muted}>
          Smartphone is primary. IoT IMU auto-enables if drift exceeds 5m.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.voiceCard}>
        <View style={{ flex: 1, gap: 6 }}>
          <ThemedText type="defaultSemiBold">Voice guidance</ThemedText>
          <ThemedText style={styles.muted}>
            Tap to narrate the next maneuver with high-contrast visual cues.
          </ThemedText>
        </View>
        <PrimaryButton
          compact
          label={speaking ? 'Speaking…' : 'Play'}
          onPress={() => speakNext('Steady slope ahead. Slight vibration. Continue 80 meters.')}
        />
      </ThemedView>
    </ScrollView>
  );
}

const PrimaryButton = ({ label, onPress, compact }: { label: string; onPress: () => void; compact?: boolean }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryBtn, compact && styles.compactBtn, pressed && styles.pressed]}>
    <ThemedText type="defaultSemiBold" style={{ color: '#0B1A12' }}>
      {label}
    </ThemedText>
  </Pressable>
);

const SecondaryButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}>
    <ThemedText type="defaultSemiBold" style={{ color: '#0FA958' }}>
      {label}
    </ThemedText>
  </Pressable>
);

const Legend = ({ color, label }: { color: string; label: string }) => (
  <View style={styles.legend}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <ThemedText style={styles.muted}>{label}</ThemedText>
  </View>
);

const SensorBar = ({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) => (
  <View style={{ flex: 1, gap: 4 }}>
    <ThemedText type="defaultSemiBold">{label}</ThemedText>
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { backgroundColor: color, width: `${Math.min(100, value * 10)}%` }]} />
    </View>
    <ThemedText style={styles.muted}>
      {value} {unit}
    </ThemedText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6ECF1',
    padding: 14,
    backgroundColor: '#F7FBFF',
  },
  headerNote: {
    color: '#4D5B66',
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E6FFF2',
    borderWidth: 1,
    borderColor: '#B8F2CF',
  },
  badgeText: {
    color: '#0FA958',
    fontWeight: '700',
  },
  mapCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6ECF1',
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 12,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 10,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapFrame: {
    height: 200,
    borderRadius: 12,
    backgroundColor: '#0C1D13',
    borderWidth: 1,
    borderColor: '#183624',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  routeLine: {
    position: 'absolute',
    height: 8,
    borderRadius: 999,
    alignSelf: 'center',
  },
  positionDot: {
    width: 14,
    height: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#18B26B',
    alignSelf: 'center',
  },
  marker: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 999,
    right: '20%',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  segmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F7FBFF',
    borderWidth: 1,
    borderColor: '#E6ECF1',
    flex: 1,
    minWidth: 140,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  mapActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  primaryBtn: {
    backgroundColor: '#6CF2AA',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6CF2AA',
  },
  secondaryBtn: {
    backgroundColor: '#0F2418',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1B4730',
  },
  pressed: {
    opacity: 0.8,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6ECF1',
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 12,
  },
  alert: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  alertHigh: {
    backgroundColor: '#FFEDEC',
    borderColor: '#F5C2BF',
  },
  alertMedium: {
    backgroundColor: '#FFF8E6',
    borderColor: '#F6DC9F',
  },
  muted: {
    color: '#55636E',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E6ECF1',
    borderRadius: 10,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#ECF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakButton: {
    backgroundColor: '#E6FFF2',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B8F2CF',
  },
  sensorRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  progressTrack: {
    height: 8,
    borderRadius: 6,
    backgroundColor: '#ECF4FF',
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 6,
  },
  voiceCard: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#0B1A12',
    borderWidth: 1,
    borderColor: '#123824',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
});


