import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, Image, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Speech from 'expo-speech';
import SocialFeed from './SocialFeed';
import Meetups from './Meetups';
import AISuggestions from './AISuggestions';

export default function App() {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [points, setPoints] = useState(0);
  const [screen, setScreen] = useState('core');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
    fetchRoute();
  }, []);

  const fetchRoute = async () => {
    try {
      let res = await fetch('http://localhost:8000/route?from_node=A&to_node=D');
      let data = await res.json();
      setRoute(data.route);
      setHazards(data.hazard_alerts);
    } catch (e) {
      setRoute([
        { node: 'A', lat: 1.290270, lng: 103.851959 },
        { node: 'B', lat: 1.290300, lng: 103.852000 },
        { node: 'C', lat: 1.290350, lng: 103.852050 },
        { node: 'D', lat: 1.290400, lng: 103.852100 }
      ]);
      setHazards([]);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.5 });
    if (!result.cancelled) {
      setImage(result.uri);
      setPoints(points + 10);
      Speech.speak('Photo submitted. Thank you!');
    }
  };

  // Navigation between screens
  if (screen === 'social') return <SocialFeed />;
  if (screen === 'meetups') return <Meetups />;
  if (screen === 'ai') return <AISuggestions />;

  // Core screen
  return (
    <View style={styles.container}>
      <Text style={styles.header} accessibilityRole="header" accessibilityLabel="AccessNowSG wheelchair navigation app">AccessNowSG</Text>
      <MapView
        style={styles.map}
        initialRegion={{ latitude: 1.290270, longitude: 103.851959, latitudeDelta: 0.001, longitudeDelta: 0.001 }}
        accessibilityLabel="Accessible map with wheelchair-friendly routes"
      >
        {route.length > 0 && (
          <Polyline
            coordinates={route.map(p => ({ latitude: p.lat, longitude: p.lng }))}
            strokeColor="#007AFF"
            strokeWidth={4}
          />
        )}
        {hazards.map((h, i) => (
          <Marker
            key={i}
            coordinate={{ latitude: h.lat || 1.290270, longitude: h.lng || 103.851959 }}
            title={h.type}
            description={`Severity: ${h.severity}, Confidence: ${h.confidence}`}
            pinColor="red"
          />
        ))}
      </MapView>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={pickImage} accessibilityRole="button" accessibilityLabel="Submit photo of obstacle">
          <MaterialIcons name="camera-alt" size={32} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Submit Photo</Text>
        </TouchableOpacity>
        <Text style={styles.points} accessibilityLabel={`Points earned: ${points}`}>Points: {points}</Text>
      </View>
      <View style={styles.leaderboard}>
        <MaterialIcons name="emoji-events" size={32} color="#007AFF" />
        <Text style={styles.leaderboardText}>Leaderboard (Demo)</Text>
        <Text style={styles.leaderboardText}>You: {points} pts</Text>
        <Text style={styles.leaderboardText}>User2: 50 pts</Text>
        <Text style={styles.leaderboardText}>User3: 30 pts</Text>
      </View>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => setScreen('social')} accessibilityRole="button" accessibilityLabel="Go to social feed">
          <MaterialIcons name="group" size={28} color="#007AFF" />
          <Text style={styles.navBtnText}>Social</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => setScreen('meetups')} accessibilityRole="button" accessibilityLabel="Go to meetups">
          <MaterialIcons name="event" size={28} color="#007AFF" />
          <Text style={styles.navBtnText}>Meetups</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => setScreen('ai')} accessibilityRole="button" accessibilityLabel="Get AI suggestions">
          <MaterialIcons name="lightbulb" size={28} color="#007AFF" />
          <Text style={styles.navBtnText}>AI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => setScreen('core')} accessibilityRole="button" accessibilityLabel="Go to main map">
          <MaterialIcons name="home" size={28} color="#007AFF" />
          <Text style={styles.navBtnText}>Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'flex-start' },
  header: { fontSize: 34, fontWeight: 'bold', marginTop: 40, marginBottom: 16, color: '#222' },
  map: { width: '98%', height: '48%', borderRadius: 16, borderColor: '#007AFF', borderWidth: 2 },
  controls: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  button: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007AFF', padding: 18, borderRadius: 12, marginRight: 24, minWidth: 180 },
  buttonText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  points: { fontSize: 24, fontWeight: 'bold', color: '#007AFF' },
  leaderboard: { marginTop: 28, alignItems: 'center', backgroundColor: '#f8f8ff', borderRadius: 12, padding: 12, width: '90%' },
  leaderboardText: { fontSize: 20, marginVertical: 4, color: '#222' },
  navbar: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 32, width: '100%', backgroundColor: '#e6f7ff', paddingVertical: 12, borderRadius: 12 },
  navBtn: { flexDirection: 'column', alignItems: 'center', paddingHorizontal: 10 },
  navBtnText: { fontSize: 18, color: '#007AFF', fontWeight: 'bold', marginTop: 4 }
});
