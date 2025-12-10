import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';

const quickStats = [
  { label: 'Live safe paths', value: '24', suffix: ' segments' },
  { label: 'Community hazards', value: '12', suffix: ' open' },
  { label: 'Your points', value: '420', suffix: ' pts' },
];

export default function HomeScreen() {
  const accent = useMemo(() => '#0FA958', []);

  const ActionButton = ({
    title,
    variant = 'primary',
    onPress,
  }: {
    title: string;
    variant?: 'primary' | 'secondary';
    onPress: () => void;
  }) => {
    const isPrimary = variant === 'primary';
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.actionButton,
          isPrimary ? styles.primaryButton : styles.secondaryButton,
          pressed && styles.buttonPressed,
        ]}>
        <IconSymbol
          name={isPrimary ? 'paperplane.fill' : 'camera.fill'}
          size={22}
          color={isPrimary ? '#0B1A12' : '#0FA958'}
          style={{ marginRight: 8 }}
        />
        <ThemedText type="defaultSemiBold" style={{ color: isPrimary ? '#0B1A12' : '#0FA958' }}>
          {title}
        </ThemedText>
      </Pressable>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={styles.hero}>
        <View style={styles.heroHeader}>
          <ThemedText type="title">AccessNowSG</ThemedText>
          <View style={styles.pillRow}>
            <View style={[styles.pill, { backgroundColor: '#102A1C' }]}>
              <ThemedText style={styles.pillText}>Smartphone primary</ThemedText>
            </View>
            <View style={[styles.pill, { backgroundColor: '#1F3B2A' }]}>
              <ThemedText style={styles.pillText}>IoT backup ready</ThemedText>
            </View>
          </View>
        </View>
        <ThemedText style={styles.subtitle}>
          Wheelchair-user–verified routes with hazard-aware guidance.
        </ThemedText>
        <View style={styles.actionsRow}>
          <ActionButton
            title="Start navigation"
            variant="primary"
            onPress={() => router.push('/navigate')}
          />
          <ActionButton
            title="Submit hazard"
            variant="secondary"
            onPress={() => router.push('/report')}
          />
        </View>
        <ThemedView style={[styles.banner, { borderColor: accent }]}>
          <IconSymbol name="exclamationmark.triangle.fill" color={accent} size={22} />
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold">Demo-ready reroute</ThemedText>
            <ThemedText style={styles.bannerText}>
              Preload a photo or sensor event to trigger a live reroute mid-demo.
            </ThemedText>
          </View>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Live status</ThemedText>
        <View style={styles.statsRow}>
          {quickStats.map((item) => (
            <View key={item.label} style={styles.stat}>
              <ThemedText type="title" style={{ color: accent }}>
                {item.value}
              </ThemedText>
              <ThemedText style={styles.statLabel}>{item.suffix}</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.statFooter}>
                {item.label}
              </ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Quick actions</ThemedText>
        <View style={styles.quickList}>
          <ListItem
            title="View map & alerts"
            detail="See safe paths, hazards, and sensor-based reroutes."
            onPress={() => router.push('/navigate')}
          />
          <ListItem
            title="Report hazard in 2 taps"
            detail="Snap a photo, add a short note, and upload."
            onPress={() => router.push('/report')}
          />
          <ListItem
            title="Check your points"
            detail="Passive movement + submissions update live."
            onPress={() => router.push('/rewards')}
          />
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const ListItem = ({
  title,
  detail,
  onPress,
}: {
  title: string;
  detail: string;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.listItem, pressed && styles.listItemPressed]}>
    <View style={{ flex: 1 }}>
      <ThemedText type="defaultSemiBold">{title}</ThemedText>
      <ThemedText style={styles.listDetail}>{detail}</ThemedText>
    </View>
    <IconSymbol name="chevron.right" color="#8E9BA0" size={22} />
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14,
  },
  hero: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#0B1A12',
    borderWidth: 1,
    borderColor: '#123824',
    gap: 12,
  },
  heroHeader: {
    gap: 8,
  },
  subtitle: {
    color: '#C8E6D2',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: '#6CF2AA',
    borderColor: '#6CF2AA',
  },
  secondaryButton: {
    backgroundColor: '#0F2418',
    borderColor: '#1B4730',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillText: {
    color: '#C8E6D2',
    fontSize: 12,
  },
  banner: {
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#0F2418',
    alignItems: 'center',
  },
  bannerText: {
    color: '#E3F8EB',
  },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6ECF1',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  stat: {
    minWidth: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6ECF1',
    padding: 12,
    backgroundColor: '#F8FBF9',
    gap: 2,
  },
  statLabel: {
    color: '#4D6555',
  },
  statFooter: {
    color: '#1F3628',
    marginTop: 2,
  },
  quickList: {
    gap: 8,
  },
  listItem: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6ECF1',
    backgroundColor: '#F7FBFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listItemPressed: {
    backgroundColor: '#ECF4FF',
  },
  listDetail: {
    color: '#51606C',
    marginTop: 2,
  },
});
