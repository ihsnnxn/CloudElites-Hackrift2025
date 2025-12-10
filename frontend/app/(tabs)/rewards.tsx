import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const badgeList = [
  { id: 'badge-1', label: 'First hazard', points: 50 },
  { id: 'badge-2', label: '1 km day', points: 30 },
  { id: 'badge-3', label: 'Community helper', points: 100 },
];

export default function RewardsScreen() {
  const [points, setPoints] = useState(420);
  const [movementPoints, setMovementPoints] = useState(260);
  const [hazardPoints, setHazardPoints] = useState(160);

  // Small heartbeat to show “live” updates in demo.
  useEffect(() => {
    const timer = setInterval(() => {
      setMovementPoints((p) => p + 1);
      setPoints((p) => p + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const incrementHazard = () => {
    setHazardPoints((p) => p + 25);
    setPoints((p) => p + 25);
  };

  const progress = Math.min(100, Math.round((points / 600) * 100));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={styles.header}>
        <View style={{ flex: 1, gap: 6 }}>
          <ThemedText type="subtitle">Gamification</ThemedText>
          <ThemedText style={styles.muted}>
            Points from passive movement + hazard submissions update live.
          </ThemedText>
        </View>
        <View style={styles.scoreBubble}>
          <ThemedText type="title" style={{ color: '#0B1A12' }}>
            {points}
          </ThemedText>
          <ThemedText style={{ color: '#0B1A12' }}>pts</ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Progress</ThemedText>
        <Progress label="Level progress" value={progress} />
        <View style={styles.row}>
          <Stat title="Movement" value={movementPoints} color="#18B26B" note="+1 every 4s in demo" />
          <Stat title="Hazard submissions" value={hazardPoints} color="#E67E22" note="+25 per submit" />
        </View>
        <Pressable onPress={incrementHazard} style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
          <ThemedText type="defaultSemiBold" style={{ color: '#0B1A12' }}>
            Add demo submission (+25 pts)
          </ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Badges</ThemedText>
        <View style={styles.badgeGrid}>
          {badgeList.map((badge) => (
            <View key={badge.id} style={styles.badgeItem}>
              <IconSymbol name="trophy.fill" color="#F1C40F" size={22} />
              <ThemedText type="defaultSemiBold">{badge.label}</ThemedText>
              <ThemedText style={styles.muted}>{badge.points} pts</ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const Progress = ({ label, value }: { label: string; value: number }) => (
  <View style={{ gap: 8 }}>
    <View style={styles.progressHeader}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <ThemedText style={styles.muted}>{value}%</ThemedText>
    </View>
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${value}%` }]} />
    </View>
  </View>
);

const Stat = ({ title, value, color, note }: { title: string; value: number; color: string; note: string }) => (
  <View style={[styles.stat, { borderColor: color + '40' }]}>
    <ThemedText type="defaultSemiBold">{title}</ThemedText>
    <ThemedText type="title" style={{ color }}>
      {value}
    </ThemedText>
    <ThemedText style={styles.muted}>{note}</ThemedText>
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
    backgroundColor: '#F7FBFF',
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
  muted: {
    color: '#52606A',
  },
  scoreBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#6CF2AA',
    borderWidth: 1,
    borderColor: '#6CF2AA',
    alignItems: 'center',
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6ECF1',
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#6CF2AA',
    borderColor: '#6CF2AA',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  stat: {
    flex: 1,
    minWidth: 150,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#F8FBF9',
    gap: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    height: 10,
    borderRadius: 8,
    backgroundColor: '#ECF4FF',
    overflow: 'hidden',
  },
  fill: {
    height: 10,
    backgroundColor: '#18B26B',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeItem: {
    flexBasis: '30%',
    minWidth: 120,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6ECF1',
    backgroundColor: '#F7FBFF',
    alignItems: 'center',
    gap: 6,
  },
});


