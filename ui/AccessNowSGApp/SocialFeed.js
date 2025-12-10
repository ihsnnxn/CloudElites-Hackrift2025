import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const mockPosts = [
  {
    id: '1',
    user: 'Alex',
    content: 'Anyone want to meet up at the wheelchair-friendly cafe near Bugis tomorrow?',
    time: '2h ago'
  },
  {
    id: '2',
    user: 'Jamie',
    content: 'Just found a new accessible park in Jurong! Highly recommend for group outings.',
    time: '5h ago'
  },
  {
    id: '3',
    user: 'Sam',
    content: 'Does anyone know if the lift at City Hall MRT is working today?',
    time: '1d ago'
  }
];

export default function SocialFeed() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Social Feed</Text>
      <FlatList
        data={mockPosts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.post}>
            <Text style={styles.user}>{item.user}</Text>
            <Text style={styles.content}>{item.content}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  post: { marginBottom: 18, padding: 12, backgroundColor: '#f2f2f2', borderRadius: 8 },
  user: { fontWeight: 'bold', fontSize: 16 },
  content: { fontSize: 15, marginVertical: 4 },
  time: { fontSize: 12, color: '#888' }
});
