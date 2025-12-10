import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

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
  const theme = useColorScheme() ?? 'light';
  const themeColors = Colors[theme];
  const accent = useMemo(() => themeColors.accent, [themeColors]);

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
          {
            backgroundColor: isPrimary ? themeColors.accent : themeColors.cardTertiary,
            borderColor: isPrimary ? themeColors.accent : themeColors.cardBorder,
          },
          pressed && styles.buttonPressed,
        ]}>
        <IconSymbol
          name={isPrimary ? 'paperplane.fill' : 'camera.fill'}
          size={22}
          color={isPrimary ? themeColors.text : themeColors.accent}
          style={{ marginRight: 8 }}
        />
        <ThemedText type="defaultSemiBold" style={{ color: isPrimary ? themeColors.text : themeColors.accent }}>
          {title}
        </ThemedText>
      </Pressable>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={[styles.hero, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }] }>
        <View style={styles.heroHeader}>
          <ThemedText type="title">AccessNowSG</ThemedText>
          <View style={styles.pillRow}>
            <View style={[styles.pill, { backgroundColor: themeColors.cardSecondary }]}> 
              <ThemedText style={[styles.pillText, { color: themeColors.muted }]}>Smartphone primary</ThemedText>
            </View>
            <View style={[styles.pill, { backgroundColor: themeColors.cardTertiary }]}> 
              <ThemedText style={[styles.pillText, { color: themeColors.muted }]}>IoT backup ready</ThemedText>
            </View>
          </View>
        </View>
        <ThemedText style={[styles.subtitle, { color: themeColors.muted }] }>
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
        <ThemedView style={[styles.banner, { borderColor: accent, backgroundColor: themeColors.cardTertiary }]}> 
          <IconSymbol name="exclamationmark.triangle.fill" color={accent} size={22} />
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold">Demo-ready reroute</ThemedText>
            <ThemedText style={[styles.bannerText, { color: themeColors.muted }] }>
              Preload a photo or sensor event to trigger a live reroute mid-demo.
            </ThemedText>
          </View>
        </ThemedView>
      </ThemedView>

      <ThemedView style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }] }>
        <ThemedText type="subtitle">Live status</ThemedText>
        <View style={styles.statsRow}>
          {quickStats.map((item) => (
            <View key={item.label} style={[styles.stat, { backgroundColor: themeColors.cardTertiary, borderColor: themeColors.cardBorder }] }>
              <ThemedText type="title" style={{ color: accent }}>
                {item.value}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: themeColors.muted }] }>{item.suffix}</ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.statFooter, { color: themeColors.text }] }>
                {item.label}
              </ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }] }>
        <ThemedText type="subtitle">Quick actions</ThemedText>
        <View style={styles.quickList}>
          <ListItem
            title="View map & alerts"
            detail="See safe paths, hazards, and sensor-based reroutes."
            onPress={() => router.push('/navigate')}
            themeColors={themeColors}
          />
          <ListItem
            title="Report hazard in 2 taps"
            detail="Snap a photo, add a short note, and upload."
            onPress={() => router.push('/report')}
            themeColors={themeColors}
          />
          <ListItem
            title="Check your points"
            detail="Passive movement + submissions update live."
            onPress={() => router.push('/rewards')}
            themeColors={themeColors}
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
  themeColors,
}: {
  title: string;
  detail: string;
  onPress: () => void;
  themeColors: any;
}) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.listItem, { backgroundColor: themeColors.cardSecondary, borderColor: themeColors.cardBorder }, pressed && styles.listItemPressed] }>
    <View style={{ flex: 1 }}>
      <ThemedText type="defaultSemiBold" style={{ color: themeColors.text }}>{title}</ThemedText>
      <ThemedText style={[styles.listDetail, { color: themeColors.muted }]}>{detail}</ThemedText>
    </View>
    <IconSymbol name="chevron.right" color={themeColors.icon} size={22} />
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
    borderWidth: 1,
    gap: 12,
  },
  heroHeader: {
    gap: 8,
  },
  subtitle: {
    // color is set dynamically
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
  // Removed primaryButton and secondaryButton, now handled inline with themeColors
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
    fontSize: 12,
    // color is set dynamically
  },
  banner: {
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  bannerText: {
    // color is set dynamically
  },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
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
    padding: 12,
    gap: 2,
  },
  statLabel: {
    // color is set dynamically
  },
  statFooter: {
    marginTop: 2,
    // color is set dynamically
  },
  quickList: {
    gap: 8,
  },
  listItem: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listItemPressed: {
    opacity: 0.9,
  },
  listDetail: {
    marginTop: 2,
    // color is set dynamically
  },
});
