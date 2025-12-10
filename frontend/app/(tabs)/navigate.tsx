import React, { useMemo, useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import * as Speech from 'expo-speech';
import useLocation from '@/hooks/useLocation';
import useSensorData from '@/hooks/useSensorData';

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
  const theme = useColorScheme() ?? 'light';
  const themeColors = Colors[theme];
  const accent = useMemo(() => themeColors.progressFill, [themeColors]);

  const speakNext = (line: string) => {
    setSpeaking(true);
    Speech.speak(line, {
      rate: 1,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  // sensors & location
  const { location, distance, errorMsg, startTracking, isTracking } = useLocation();
  const { vibration, tilt, accelerometer, gyroscope } = useSensorData();

  // start on mount
  useEffect(() => {
    (async () => {
      const ok = await startTracking();
      // startSensors handled in hook's effect
    })();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={[styles.header, { backgroundColor: themeColors.cardSecondary, borderColor: themeColors.cardBorder }] }>
        <View style={{ flex: 1 }}>
          <ThemedText type="subtitle">Route to: Nearest MRT (wheelchair gate)</ThemedText>
          <ThemedText style={[styles.headerNote, { color: themeColors.muted }] }>
            Smartphone sensors active • IoT on standby if GPS drifts
          </ThemedText>
        </View>
        <View style={[styles.badge, { backgroundColor: themeColors.badge, borderColor: themeColors.badgeBorder }] }>
          <IconSymbol name="waveform.path" color={accent} size={18} />
          <ThemedText style={[styles.badgeText, { color: accent }]}>Live</ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={[styles.mapCard, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }] }>
        <View style={styles.mapHeader}>
          <ThemedText type="defaultSemiBold">Map + hazard overlays</ThemedText>
          <View style={styles.legendRow}>
            <Legend color={themeColors.progressFill} label="Safe" themeColors={themeColors} />
            <Legend color={themeColors.infoBorder} label="Mild" themeColors={themeColors} />
            <Legend color={themeColors.warningBorder} label="High" themeColors={themeColors} />
          </View>
        </View>
        <View style={[styles.mapFrame, { backgroundColor: themeColors.background, borderColor: themeColors.cardBorder }] }>
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
          <View style={[styles.positionDot, { backgroundColor: themeColors.card, borderColor: themeColors.progressFill }]} />
          <View style={[styles.marker, { top: '15%', backgroundColor: themeColors.warningBorder }]} />
          <View style={[styles.marker, { top: '45%', backgroundColor: themeColors.infoBorder }]} />
        </View>
        <View style={styles.segmentRow}>
          {routeSegments.map((segment) => (
            <View key={segment.id} style={[styles.segmentChip, { backgroundColor: themeColors.cardSecondary, borderColor: themeColors.cardBorder }] }>
              <View style={[styles.dot, { backgroundColor: segment.color }]} />
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">{segment.label}</ThemedText>
                <ThemedText style={[styles.muted, { color: themeColors.muted }]}>{segment.distance}</ThemedText>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.mapActions}>
          <PrimaryButton
            label="Start navigation"
            onPress={() => speakNext('Starting accessible navigation. Ramp in 50 meters.')}
            themeColors={themeColors}
          />
          <SecondaryButton
            label="Reroute on hazard"
            onPress={() => speakNext('Rerouting to avoid blocked ramp ahead.')}
            themeColors={themeColors}
          />
        </View>
      </ThemedView>

      <ThemedView style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }] }>
        <ThemedText type="subtitle">Hazard alerts</ThemedText>
        <View style={{ gap: 10 }}>
          {hazardAlerts.map((hazard) => (
            <View
              key={hazard.id}
              style={[
                styles.alert,
                hazard.severity === 'high'
                  ? { backgroundColor: themeColors.warning, borderColor: themeColors.warningBorder }
                  : { backgroundColor: themeColors.info, borderColor: themeColors.infoBorder },
              ]}>
              <IconSymbol
                name="exclamationmark.triangle.fill"
                color={hazard.severity === 'high' ? themeColors.warningText : themeColors.infoText}
                size={20}
              />
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">{hazard.title}</ThemedText>
                <ThemedText style={[styles.muted, { color: themeColors.muted }]}>{hazard.distance}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }] }>
        <ThemedText type="subtitle">Step-by-step guidance</ThemedText>
        <View style={{ gap: 8 }}>
          {directions.map((step, idx) => (
            <View key={step} style={[styles.stepRow, { borderColor: themeColors.cardBorder }] }>
              <View style={[styles.stepNumber, { backgroundColor: themeColors.progressTrack }] }>
                <ThemedText type="defaultSemiBold" style={{ color: themeColors.text }}>{idx + 1}</ThemedText>
              </View>
              <ThemedText style={{ flex: 1, color: themeColors.text }}>{step}</ThemedText>
              <Pressable onPress={() => speakNext(step)} style={[styles.speakButton, { backgroundColor: themeColors.badge, borderColor: themeColors.badgeBorder }] }>
                <IconSymbol name="paperplane.fill" color={themeColors.text} size={16} />
              </Pressable>
            </View>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }] }>
        <ThemedText type="subtitle">Sensor feedback</ThemedText>
        <View style={styles.sensorRow}>
          <SensorBar label="Tilt" value={tilt} unit="deg" color={themeColors.progressFill} themeColors={themeColors} />
          <SensorBar label="Vibration" value={vibration} unit="g" color={themeColors.infoBorder} themeColors={themeColors} />
          <SensorBar label="GPS accuracy" value={location?.accuracy ?? 0} unit="m" color={themeColors.accent} themeColors={themeColors} />
        </View>
        <ThemedText style={[styles.muted, { color: themeColors.muted }]}> 
          Smartphone is primary. IoT IMU auto-enables if drift exceeds 5m. Distance: {(distance).toFixed(1)} m
        </ThemedText>
        <ThemedText style={[styles.muted, { color: themeColors.muted, marginTop: 8 }]}>Location: {location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : (isTracking ? 'Acquiring GPS...' : 'GPS inactive')}</ThemedText>
        <ThemedText style={[styles.muted, { color: themeColors.muted }]}>Accel: x:{accelerometer.x.toFixed(2)} y:{accelerometer.y.toFixed(2)} z:{accelerometer.z.toFixed(2)}</ThemedText>
        <ThemedText style={[styles.muted, { color: themeColors.muted }]}>Gyro: x:{gyroscope.x.toFixed(2)} y:{gyroscope.y.toFixed(2)} z:{gyroscope.z.toFixed(2)}</ThemedText>
      </ThemedView>

      <ThemedView style={[styles.voiceCard, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }] }>
        <View style={{ flex: 1, gap: 6 }}>
          <ThemedText type="defaultSemiBold">Voice guidance</ThemedText>
          <ThemedText style={[styles.muted, { color: themeColors.muted }]}>
            Tap to narrate the next maneuver with high-contrast visual cues.
          </ThemedText>
        </View>
        <PrimaryButton
          compact
          label={speaking ? 'Speaking…' : 'Play'}
          onPress={() => speakNext('Steady slope ahead. Slight vibration. Continue 80 meters.')}
          themeColors={themeColors}
        />
      </ThemedView>
    </ScrollView>
  );
}

const PrimaryButton = ({ label, onPress, compact, themeColors }: { label: string; onPress: () => void; compact?: boolean; themeColors: any }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryBtn, compact && styles.compactBtn, { backgroundColor: themeColors.accent, borderColor: themeColors.accent }, pressed && styles.pressed]}>
    <ThemedText type="defaultSemiBold" style={{ color: '#0B1A12' }}>
      {label}
    </ThemedText>
  </Pressable>
);

const SecondaryButton = ({ label, onPress, themeColors }: { label: string; onPress: () => void; themeColors: any }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.secondaryBtn, { backgroundColor: themeColors.cardTertiary, borderColor: themeColors.accent }, pressed && styles.pressed]}>
    <ThemedText type="defaultSemiBold" style={{ color: themeColors.accent }}>
      {label}
    </ThemedText>
  </Pressable>
);

const Legend = ({ color, label, themeColors }: { color: string; label: string; themeColors: any }) => (
  <View style={styles.legend}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <ThemedText style={[styles.muted, { color: themeColors.muted }]}>{label}</ThemedText>
  </View>
);

const SensorBar = ({ label, value, unit, color, themeColors }: { label: string; value: number; unit: string; color: string; themeColors: any }) => (
  <View style={{ flex: 1, gap: 4 }}>
    <ThemedText type="defaultSemiBold">{label}</ThemedText>
    <View style={[styles.progressTrack, { backgroundColor: themeColors.progressTrack }] }>
      <View style={[styles.progressFill, { backgroundColor: color, width: `${Math.min(100, value * 10)}%` }]} />
    </View>
    <ThemedText style={[styles.muted, { color: themeColors.muted }]}>
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
    padding: 14,
  },
  headerNote: {
    marginTop: 4,
    // color is set dynamically
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontWeight: '700',
    // color is set dynamically
  },
  mapCard: {
    borderRadius: 14,
    borderWidth: 1,
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
    borderWidth: 1,
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
    borderWidth: 2,
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
    borderWidth: 1,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
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
  muted: {
    // color is set dynamically
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakButton: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  sensorRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  progressTrack: {
    height: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 6,
  },
  voiceCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
});


