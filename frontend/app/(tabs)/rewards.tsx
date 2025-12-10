import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

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
  const theme = useColorScheme() ?? 'light';
  const themeColors = Colors[theme];

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
      <ThemedView style={[styles.header, { backgroundColor: themeColors.cardSecondary, borderColor: themeColors.cardBorder }] }>
        <View style={{ flex: 1, gap: 6 }}>
          <ThemedText type="subtitle">Gamification</ThemedText>
          <ThemedText style={[styles.muted, { color: themeColors.muted }] }>
            Points from passive movement + hazard submissions update live.
          </ThemedText>
        </View>
        <View style={[styles.scoreBubble, { backgroundColor: themeColors.accent, borderColor: themeColors.accent }] }>
          <ThemedText type="title" style={{ color: theme === 'dark' ? '#0B1A12' : '#0B1A12' }}>
            {points}
          </ThemedText>
          <ThemedText style={{ color: theme === 'dark' ? '#0B1A12' : '#0B1A12' }}>pts</ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }] }>
        <ThemedText type="subtitle">Progress</ThemedText>
        <Progress label="Level progress" value={progress} themeColors={themeColors} />
        <View style={styles.row}>
          <Stat title="Movement" value={movementPoints} color={themeColors.progressFill} note="+1 every 4s in demo" themeColors={themeColors} />
          <Stat title="Hazard submissions" value={hazardPoints} color="#E67E22" note="+25 per submit" themeColors={themeColors} />
        </View>
        <Pressable onPress={incrementHazard} style={({ pressed }) => [styles.primaryBtn, { backgroundColor: themeColors.accent, borderColor: themeColors.accent }, pressed && styles.pressed]}>
          <ThemedText type="defaultSemiBold" style={{ color: '#0B1A12' }}>
            Add demo submission (+25 pts)
          </ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }] }>
        <ThemedText type="subtitle">Badges</ThemedText>
        <View style={styles.badgeGrid}>
          {badgeList.map((badge) => (
            <View key={badge.id} style={[styles.badgeItem, { backgroundColor: themeColors.cardSecondary, borderColor: themeColors.cardBorder }] }>
              <IconSymbol name="trophy.fill" color="#F1C40F" size={22} />
              <ThemedText type="defaultSemiBold">{badge.label}</ThemedText>
              <ThemedText style={[styles.muted, { color: themeColors.muted }]}>{badge.points} pts</ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const Progress = ({ label, value, themeColors }: { label: string; value: number; themeColors: any }) => (
  <View style={{ gap: 8 }}>
    <View style={styles.progressHeader}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <ThemedText style={[styles.muted, { color: themeColors.muted }]}>{value}%</ThemedText>
    </View>
    <View style={[styles.track, { backgroundColor: themeColors.progressTrack }] }>
      <View style={[styles.fill, { width: `${value}%`, backgroundColor: themeColors.progressFill }]} />
    </View>
  </View>
);

const Stat = ({ title, value, color, note, themeColors }: { title: string; value: number; color: string; note: string; themeColors: any }) => (
  <View style={[styles.stat, { borderColor: color + '40', backgroundColor: themeColors.cardTertiary }] }>
    <ThemedText type="defaultSemiBold">{title}</ThemedText>
    <ThemedText type="title" style={{ color }}>
      {value}
    </ThemedText>
    <ThemedText style={[styles.muted, { color: themeColors.muted }]}>{note}</ThemedText>
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
  scoreBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  primaryBtn: {
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
    alignItems: 'center',
    gap: 6,
  },
});


