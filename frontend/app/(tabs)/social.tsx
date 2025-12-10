import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';

const mockFriends = [
  { id: '1', name: 'Alex Tan', status: 'Nearby', avatar: '🧑🏻' },
  { id: '2', name: 'Sarah Lim', status: 'Online', avatar: '👩🏼' },
  { id: '3', name: 'John Lee', status: '2km away', avatar: '🧑🏽' },
];

const mockGroups = [
  { id: 'g1', name: 'Wheelchair Users SG', members: 120 },
  { id: 'g2', name: 'Accessible Cafes', members: 45 },
];

export default function SocialScreen() {
  const theme = useColorScheme() ?? 'light';
  const themeColors = Colors[theme];
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, backgroundColor: themeColors.background }}>
      <ThemedView style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }] }>
        <ThemedText type="title">Social Connectivity</ThemedText>
        <ThemedText style={{ color: themeColors.muted, marginBottom: 8 }}>
          Find nearby friends, meet new users, chat and join groups.
        </ThemedText>
        <ThemedText type="subtitle">Nearby Friends</ThemedText>
        <View style={{ gap: 10 }}>
          {mockFriends.map(friend => (
            <View key={friend.id} style={[styles.friendRow, { backgroundColor: themeColors.cardSecondary, borderColor: themeColors.cardBorder }] }>
              <ThemedText style={styles.avatar}>{friend.avatar}</ThemedText>
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">{friend.name}</ThemedText>
                <ThemedText style={{ color: themeColors.muted }}>{friend.status}</ThemedText>
              </View>
              <Pressable style={[styles.actionBtn, { backgroundColor: themeColors.accent }]} accessibilityRole="button" accessibilityLabel={`Chat with ${friend.name}`}>
                <IconSymbol name="paperplane.fill" color="#0B1A12" size={18} />
              </Pressable>
            </View>
          ))}
        </View>
      </ThemedView>
      <ThemedView style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }] }>
        <ThemedText type="subtitle">Groups</ThemedText>
        <View style={{ gap: 10 }}>
          {mockGroups.map(group => (
            <View key={group.id} style={[styles.groupRow, { backgroundColor: themeColors.cardSecondary, borderColor: themeColors.cardBorder }] }>
              <IconSymbol name="trophy.fill" color={themeColors.accent} size={20} />
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">{group.name}</ThemedText>
                <ThemedText style={{ color: themeColors.muted }}>{group.members} members</ThemedText>
              </View>
              <Pressable style={[styles.actionBtn, { backgroundColor: themeColors.accent }]} accessibilityRole="button" accessibilityLabel={`Join group ${group.name}`}>
                <IconSymbol name="chevron.right" color="#0B1A12" size={18} />
              </Pressable>
            </View>
          ))}
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  avatar: {
    fontSize: 28,
    marginRight: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
