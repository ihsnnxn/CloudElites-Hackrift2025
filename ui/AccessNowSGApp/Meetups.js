import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const mockMeetups = [
  {
    id: '1',
    title: 'Jurong Park Picnic',
    location: 'Jurong Accessible Park',
    time: 'Sat, 2pm',
    attendees: ['Alex', 'Jamie', 'Sam']
  },
  {
    id: '2',
    title: 'Bugis Cafe Gathering',
    location: 'Wheelchair-Friendly Cafe, Bugis',
    time: 'Sun, 11am',
    attendees: ['Jamie', 'Sam']
  }
];

export default function Meetups() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Meetups</Text>
      <FlatList
        data={mockMeetups}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.meetup}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.location}>{item.location}</Text>
            <Text style={styles.time}>{item.time}</Text>
            <Text style={styles.attendees}>Attendees: {item.attendees.join(', ')}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  meetup: { marginBottom: 18, padding: 12, backgroundColor: '#e6f7ff', borderRadius: 8 },
  title: { fontWeight: 'bold', fontSize: 16 },
  location: { fontSize: 15, marginVertical: 2 },
  time: { fontSize: 14, color: '#007AFF' },
  attendees: { fontSize: 13, color: '#555' }
});
