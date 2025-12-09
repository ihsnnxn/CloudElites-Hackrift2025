import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, Image, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline } from 'react-native-maps';
// Voice cue skeleton
import * as Speech from 'expo-speech';

export default function App() {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [points, setPoints] = useState(0);

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
    // Demo: fetch from backend
    try {
      let res = await fetch('http://localhost:8000/route?from_node=A&to_node=D');
      let data = await res.json();
      setRoute(data.route);
      setHazards(data.hazard_alerts);
    } catch (e) {
      // fallback demo
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
      setPoints(points + 10); // Gamification: +10 points per submission
      Speech.speak('Photo submitted. Thank you!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>AccessNowSG</Text>
      <MapView
        style={styles.map}
        initialRegion={{ latitude: 1.290270, longitude: 103.851959, latitudeDelta: 0.001, longitudeDelta: 0.001 }}
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
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Submit Photo</Text>
        </TouchableOpacity>
        <Text style={styles.points}>Points: {points}</Text>
      </View>
      <View style={styles.leaderboard}>
        <Text style={styles.leaderboardText}>Leaderboard (Demo)</Text>
        <Text style={styles.leaderboardText}>You: {points} pts</Text>
        <Text style={styles.leaderboardText}>User2: 50 pts</Text>
        <Text style={styles.leaderboardText}>User3: 30 pts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'flex-start' },
  header: { fontSize: 28, fontWeight: 'bold', marginTop: 40, marginBottom: 10 },
  map: { width: '95%', height: '45%', borderRadius: 10 },
  controls: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, marginRight: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  points: { fontSize: 18, fontWeight: 'bold' },
  leaderboard: { marginTop: 20, alignItems: 'center' },
  leaderboardText: { fontSize: 16, marginVertical: 2 }
});
