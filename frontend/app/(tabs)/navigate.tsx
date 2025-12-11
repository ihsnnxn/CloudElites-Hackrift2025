import React, { useMemo, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pressable, ScrollView, StyleSheet, View, Text, ActivityIndicator, Platform, Animated } from 'react-native';
import { NativeMap } from '@/components/NativeMap.native';
import { WebView } from 'react-native-webview';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import * as Speech from 'expo-speech';
import useLocation from '@/hooks/useLocation';
import useSensorData from '@/hooks/useSensorData';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type SegmentColorKey = 'progressFill' | 'infoBorder' | 'warningBorder';
const routeSegments: { id: string; label: string; colorKey: SegmentColorKey; distance: string }[] = [
  { id: 'seg-1', label: 'Ramp access', colorKey: 'progressFill', distance: '120m' },
  { id: 'seg-2', label: 'Mild slope', colorKey: 'infoBorder', distance: '80m' },
  { id: 'seg-3', label: 'Rough paving', colorKey: 'warningBorder', distance: '40m' },
];


const directions = [
  'Head north 50m to the green ramp.',
  'Stay left; slight slope for 80m.',
  'Rough tiles ahead — slowing recommended.',
  'Turn right at sheltered walkway.',
];

// Backend API URL - Use 10.0.2.2 for Android emulator, localhost for iOS/web
const BACKEND_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8000' 
  : 'http://localhost:8000';

// Decode polyline from OneMap response
function decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
  const coords: { latitude: number; longitude: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    coords.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return coords;
}

// Fetch route from backend proxy
async function fetchRoute(startLat: number, startLng: number, endLat: number, endLng: number): Promise<{ latitude: number; longitude: number }[]> {
  try {
    const start = `${startLat},${startLng}`;
    const end = `${endLat},${endLng}`;
    const url = `${BACKEND_URL}/route/onemap?start=${start}&end=${end}&routeType=walk`;
    
    console.log('Fetching route from backend:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Route data received:', data);
    
    if (data.route_geometry) {
      const decoded = decodePolyline(data.route_geometry);
      console.log(`Decoded ${decoded.length} coordinates from polyline`);
      return decoded;
    } else {
      throw new Error('No route_geometry in response');
    }
  } catch (error) {
    console.error('Route fetch error:', error);
    throw error;
  }
}

// Predefined actual Singapore routes with realistic paths following actual roads
const ROUTE_PRESETS = {
  nationalGallery: {
    name: 'National Gallery Singapore',
    from: { lat: 1.2988, lng: 103.8456 }, // Dhoby Ghaut MRT
    to: { lat: 1.2906, lng: 103.8523 }, // National Gallery
    route: [
      { latitude: 1.2988, longitude: 103.8456 },   // Dhoby Ghaut MRT
      { latitude: 1.2986, longitude: 103.8462 },   // Along Orchard Rd
      { latitude: 1.2980, longitude: 103.8475 },   // Bras Basah Rd
      { latitude: 1.2972, longitude: 103.8488 },   // Continue Bras Basah
      { latitude: 1.2965, longitude: 103.8495 },   // Approach Victoria St
      { latitude: 1.2955, longitude: 103.8505 },   // Victoria St
      { latitude: 1.2945, longitude: 103.8510 },   // St Andrew's Rd
      { latitude: 1.2935, longitude: 103.8515 },   // Continue
      { latitude: 1.2920, longitude: 103.8520 },   // Approach gallery
      { latitude: 1.2906, longitude: 103.8523 },   // National Gallery
    ],
  },
  esplanade: {
    name: 'Esplanade MRT',
    from: { lat: 1.2988, lng: 103.8456 },
    to: { lat: 1.2935, lng: 103.8555 },
    route: [
      { latitude: 1.2988, longitude: 103.8456 },   // Dhoby Ghaut MRT
      { latitude: 1.2986, longitude: 103.8465 },   // Bencoolen St
      { latitude: 1.2978, longitude: 103.8480 },   // Bras Basah Rd
      { latitude: 1.2970, longitude: 103.8495 },   // Beach Rd
      { latitude: 1.2962, longitude: 103.8510 },   // Continue Beach Rd
      { latitude: 1.2955, longitude: 103.8520 },   // Nicoll Highway
      { latitude: 1.2948, longitude: 103.8530 },   // Continue
      { latitude: 1.2942, longitude: 103.8540 },   // Esplanade Dr
      { latitude: 1.2938, longitude: 103.8548 },   // Approach MRT
      { latitude: 1.2935, longitude: 103.8555 },   // Esplanade MRT
    ],
  },
  marinaBay: {
    name: 'Marina Bay Sands',
    from: { lat: 1.2988, lng: 103.8456 },
    to: { lat: 1.2836, lng: 103.8607 },
    route: [
      { latitude: 1.2988, longitude: 103.8456 },   // Dhoby Ghaut MRT
      { latitude: 1.2982, longitude: 103.8468 },   // Bencoolen St
      { latitude: 1.2975, longitude: 103.8482 },   // Bras Basah Rd
      { latitude: 1.2965, longitude: 103.8498 },   // Victoria St
      { latitude: 1.2955, longitude: 103.8512 },   // Beach Rd
      { latitude: 1.2945, longitude: 103.8525 },   // Continue
      { latitude: 1.2930, longitude: 103.8540 },   // Raffles Ave
      { latitude: 1.2915, longitude: 103.8555 },   // Continue Raffles
      { latitude: 1.2895, longitude: 103.8570 },   // Bayfront Ave
      { latitude: 1.2875, longitude: 103.8585 },   // Marina Bay Link
      { latitude: 1.2855, longitude: 103.8598 },   // Bayfront Bridge
      { latitude: 1.2836, longitude: 103.8607 },   // Marina Bay Sands
    ],
  },
};

export default function NavigateScreen() {
  const [speaking, setSpeaking] = useState(false);
  const [mapProvider, setMapProvider] = useState<'google' | 'onemap'>('google');
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<keyof typeof ROUTE_PRESETS>('nationalGallery');
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routeProgress, setRouteProgress] = useState(0);
  
  // Generate hazard alerts dynamically based on current route coordinates
  const hazardAlerts = useMemo(() => {
    if (routeCoords.length < 4) return [];
    
    // Place hazards at 1/4, 1/2, and 3/4 along the route
    const indices = [
      Math.floor(routeCoords.length * 0.25),
      Math.floor(routeCoords.length * 0.5),
      Math.floor(routeCoords.length * 0.75),
    ];
    
    return [
      { 
        id: 'haz-1', 
        title: 'Temporary bin blocking ramp', 
        severity: 'high' as const, 
        distance: '60m ahead', 
        lat: routeCoords[indices[0]].latitude, 
        lng: routeCoords[indices[0]].longitude 
      },
      { 
        id: 'haz-2', 
        title: 'Slight vibration on tiles', 
        severity: 'mild' as const, 
        distance: '120m ahead', 
        lat: routeCoords[indices[1]].latitude, 
        lng: routeCoords[indices[1]].longitude 
      },
      { 
        id: 'haz-3', 
        title: 'Safe path ahead', 
        severity: 'safe' as const, 
        distance: '180m ahead', 
        lat: routeCoords[indices[2]].latitude, 
        lng: routeCoords[indices[2]].longitude 
      },
    ];
  }, [routeCoords]);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  // Load map provider preference on mount
  useEffect(() => {
    (async () => {
      const pref = await AsyncStorage.getItem('mapProvider');
      if (pref === 'google' || pref === 'onemap') setMapProvider(pref);
    })();
  }, []);
  // Save preference when changed
  useEffect(() => {
    AsyncStorage.setItem('mapProvider', mapProvider);
  }, [mapProvider]);
  // Load selected route from API
  useEffect(() => {
    const loadRoute = async () => {
      const preset = ROUTE_PRESETS[selectedRoute];
      setLoading(true);
      setError(null);
      
      try {
        // Fetch real route from backend proxy
        const coords = await fetchRoute(preset.from.lat, preset.from.lng, preset.to.lat, preset.to.lng);
        setRouteCoords(coords);
        setCurrentPosition({ latitude: preset.from.lat, longitude: preset.from.lng });
        setRouteProgress(0);
        
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
        
        // Slide in animation
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
      } catch (err) {
        console.error('Failed to load route:', err);
        console.log('Using fallback preset route');
        // Silently fallback to preset route if API fails
        setRouteCoords(preset.route);
        setCurrentPosition({ latitude: preset.from.lat, longitude: preset.from.lng });
        setRouteProgress(0);
        
        // Don't show error to user, just use preset route
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadRoute();
  }, [selectedRoute]);
  
  // Simulated live location tracking
  useEffect(() => {
    if (!isLiveTracking || routeCoords.length === 0) return;
    
    const interval = setInterval(() => {
      setRouteProgress((prev) => {
        const next = prev + 1;
        if (next >= routeCoords.length) {
          setIsLiveTracking(false);
          speakNext('You have arrived at your destination.');
          return prev;
        }
        setCurrentPosition(routeCoords[next]);
        
        // Progress announcements
        if (next === Math.floor(routeCoords.length / 2)) {
          speakNext('Halfway to your destination.');
        }
        
        return next;
      });
    }, 2000); // Move every 2 seconds
    
    return () => clearInterval(interval);
  }, [isLiveTracking, routeCoords]);
  
  // Pulse animation for live tracking
  useEffect(() => {
    if (isLiveTracking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isLiveTracking]);
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

  // For OneMap, convert to JS array for leaflet
  const oneMapRouteJS = routeCoords.map(c => `[${c.latitude},${c.longitude}]`).join(',');
  const initialRegion = routeCoords[0]
    ? { ...routeCoords[0], latitudeDelta: 0.001, longitudeDelta: 0.001 }
    : { latitude: 1.29027, longitude: 103.851959, latitudeDelta: 0.001, longitudeDelta: 0.001 };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ThemedView style={[styles.header, { backgroundColor: themeColors.cardSecondary, borderColor: themeColors.cardBorder }] }>
          <View style={{ flex: 1 }}>
            <ThemedText type="subtitle">Route to: {ROUTE_PRESETS[selectedRoute].name}</ThemedText>
            <ThemedText style={[styles.headerNote, { color: themeColors.muted }] }>
              {isLiveTracking ? `Progress: ${routeProgress}/${routeCoords.length} • Live tracking active` : 'Select route and start navigation'}
            </ThemedText>
          </View>
          {isLiveTracking && (
            <Animated.View style={[styles.badge, { backgroundColor: themeColors.badge, borderColor: themeColors.badgeBorder, transform: [{ scale: pulseAnim }] }] }>
              <IconSymbol name="waveform.path" color={accent} size={18} />
              <ThemedText style={[styles.badgeText, { color: accent }]}>Live</ThemedText>
            </Animated.View>
          )}
        </ThemedView>
      </Animated.View>

      {/* Route Selection */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <ThemedView style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }] }>
          <ThemedText type="defaultSemiBold">Select Destination</ThemedText>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {(Object.keys(ROUTE_PRESETS) as Array<keyof typeof ROUTE_PRESETS>).map((key) => (
              <Pressable
                key={key}
                onPress={() => {
                  setSelectedRoute(key);
                  setIsLiveTracking(false);
                  speakNext(`Route to ${ROUTE_PRESETS[key].name} selected`);
                }}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    minWidth: 100,
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: selectedRoute === key ? themeColors.accent : themeColors.cardBorder,
                    backgroundColor: selectedRoute === key ? themeColors.accent + '20' : themeColors.cardSecondary,
                    alignItems: 'center',
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <ThemedText style={{ fontWeight: selectedRoute === key ? '700' : '400', textAlign: 'center' }}>
                  {ROUTE_PRESETS[key].name}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </ThemedView>
      </Animated.View>

      <ThemedView style={[styles.mapCard, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }] }>
        <View style={styles.mapHeader}>
          <ThemedText type="defaultSemiBold">Map + hazard overlays</ThemedText>
          <View style={styles.legendRow}>
            <Legend color={themeColors.progressFill} label="Safe" themeColors={themeColors} />
            <Legend color={themeColors.infoBorder} label="Mild" themeColors={themeColors} />
            <Legend color={themeColors.warningBorder} label="High" themeColors={themeColors} />
          </View>
        </View>
        {/* Map provider toggle */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <Pressable
            onPress={() => setMapProvider('google')}
            style={({ pressed }) => [
              { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: mapProvider === 'google' ? themeColors.accent : themeColors.cardBorder, backgroundColor: mapProvider === 'google' ? themeColors.accent : themeColors.cardSecondary, alignItems: 'center' },
              pressed && { opacity: 0.8 },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: mapProvider === 'google' }}
          >
            <Text style={{ color: mapProvider === 'google' ? '#0B1A12' : themeColors.text, fontWeight: '600' }}>Google Maps</Text>
          </Pressable>
          <Pressable
            onPress={() => setMapProvider('onemap')}
            style={({ pressed }) => [
              { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: mapProvider === 'onemap' ? themeColors.accent : themeColors.cardBorder, backgroundColor: mapProvider === 'onemap' ? themeColors.accent : themeColors.cardSecondary, alignItems: 'center' },
              pressed && { opacity: 0.8 },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: mapProvider === 'onemap' }}
          >
            <Text style={{ color: mapProvider === 'onemap' ? '#0B1A12' : themeColors.text, fontWeight: '600' }}>OneMap SG</Text>
          </Pressable>
        </View>
        {/* Map area: Google or OneMap */}
        <View style={[styles.mapFrame, { backgroundColor: themeColors.background, borderColor: themeColors.cardBorder, height: 300 }] }>
          {loading ? (
            <ActivityIndicator size="large" color={themeColors.accent} style={{ flex: 1, alignSelf: 'center' }} />
          ) : error ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ThemedText type="defaultSemiBold" style={{ color: themeColors.warning }}>
                {error}
              </ThemedText>
            </View>
          ) : mapProvider === 'onemap' ? (
            (() => {
              // Prepare hazard markers with color coding
              const hazardsMarkersJS = hazardAlerts.map((hazard) => {
                const color = hazard.severity === 'safe' ? 'green' : hazard.severity === 'mild' ? 'orange' : 'red';
                const iconVar = 'icon_' + hazard.id.replace(/-/g, '_');
                const title = hazard.title.replace(/'/g, "\\'");
                const severityUpper = hazard.severity.toUpperCase();
                return `var ${iconVar} = L.divIcon({
  className: 'custom-marker',
  html: '<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
  iconSize: [20, 20]
});
L.marker([${hazard.lat}, ${hazard.lng}], {icon: ${iconVar}})
  .addTo(map)
  .bindPopup('<b>${title}</b><br>Severity: <span style="color: ${color}; font-weight: bold;">${severityUpper}</span>');`;
              }).join('\n');
              
              const centerLat = routeCoords[0]?.latitude || 1.2988;
              const centerLng = routeCoords[0]?.longitude || 103.8456;
              
              // Current position marker for OneMap
              const currentPosJS = currentPosition 
                ? `
                  // Current position indicator (blue circle)
                  var currentPosCircle = L.circle([${currentPosition.latitude}, ${currentPosition.longitude}], {
                    color: '#4285F4',
                    fillColor: '#4285F4',
                    fillOpacity: 0.3,
                    radius: 15,
                    weight: 2
                  }).addTo(map);
                  var currentPosInner = L.circle([${currentPosition.latitude}, ${currentPosition.longitude}], {
                    color: '#FFFFFF',
                    fillColor: '#4285F4',
                    fillOpacity: 1,
                    radius: 5,
                    weight: 2
                  }).addTo(map);
                `
                : '';
              
              const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body { height: 100%; margin: 0; padding: 0; }
    #map { height: 100%; width: 100%; }
    .custom-marker { background: none; border: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    window.onload = function() {
      try {
        var map = L.map('map', {
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          touchZoom: true
        }).setView([${currentPosition?.latitude || centerLat}, ${currentPosition?.longitude || centerLng}], 18);
        L.tileLayer('https://www.onemap.gov.sg/maps/tiles/Default_HD/{z}/{x}/{y}.png', {
          detectRetina: true,
          maxZoom: 19,
          minZoom: 11,
          attribution: '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/> <a href="https://www.onemap.gov.sg/" target="_blank">OneMap</a> © contributors | <a href="https://www.sla.gov.sg/" target="_blank">Singapore Land Authority</a>'
        }).addTo(map);
        
        ${routeCoords.length > 0 ? `var route = L.polyline([${oneMapRouteJS}], {color:'#007AFF',weight:4}).addTo(map);` : ''}
        ${hazardsMarkersJS}
        
        ${currentPosJS}
        
        console.log('OneMap loaded successfully');
      } catch(e) {
        console.error('Error loading map:', e);
        document.body.innerHTML = '<div style="padding:20px;color:red;">Error loading map: ' + e.message + '</div>';
      }
    };
  </script>
</body>
</html>`;
              return (
                <WebView
                  key={`${currentPosition?.latitude}-${currentPosition?.longitude}-${routeCoords.length}`}
                  style={{ flex: 1, borderRadius: 12, height: 300 }}
                  source={{ html }}
                  originWhitelist={["*"]}
                  javaScriptEnabled
                  domStorageEnabled
                  automaticallyAdjustContentInsets={false}
                  scrollEnabled={false}
                  onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView error: ', nativeEvent);
                  }}
                  onMessage={(event) => {
                    console.log('WebView message:', event.nativeEvent.data);
                  }}
                />
              );
            })()
          ) : Platform.OS === 'web' && mapProvider === 'google' ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ThemedText type="defaultSemiBold" style={{ color: themeColors.info }}>
                Google Maps is not supported on web. Please use OneMap or view on mobile.
              </ThemedText>
            </View>
          ) : (
            <NativeMap 
              routeCoords={routeCoords} 
              initialRegion={initialRegion} 
              themeColors={themeColors} 
              hazards={hazardAlerts}
              currentPosition={currentPosition}
            />
          )}
        </View>
        {/* ...existing segmentRow and mapActions... */}
        <View style={styles.segmentRow}>
          {routeSegments.map((segment) => (
            <View key={segment.id} style={[styles.segmentChip, { backgroundColor: themeColors.cardSecondary, borderColor: themeColors.cardBorder }] }>
              <View style={[styles.dot, { backgroundColor: themeColors[segment.colorKey] }]} />
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">{segment.label}</ThemedText>
                <ThemedText style={[styles.muted, { color: themeColors.muted }]}>{segment.distance}</ThemedText>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.mapActions}>
          <Animated.View style={{ flex: 1, transform: [{ scale: isLiveTracking ? pulseAnim : 1 }] }}>
            <PrimaryButton
              label={isLiveTracking ? 'Stop Navigation' : 'Start Live Navigation'}
              onPress={() => {
                if (isLiveTracking) {
                  setIsLiveTracking(false);
                  speakNext('Navigation stopped.');
                } else {
                  setIsLiveTracking(true);
                  setRouteProgress(0);
                  speakNext(`Starting navigation to ${ROUTE_PRESETS[selectedRoute].name}. Follow the blue route.`);
                }
              }}
              themeColors={themeColors}
            />
          </Animated.View>
          <SecondaryButton
            label="Reroute on hazard"
            onPress={() => {
              speakNext('Rerouting to avoid blocked ramp ahead.');
              // Reset progress to simulate rerouting
              if (isLiveTracking) {
                setRouteProgress(Math.max(0, routeProgress - 2));
              }
            }}
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
                  : hazard.severity === 'mild'
                  ? { backgroundColor: themeColors.info, borderColor: themeColors.infoBorder }
                  : { backgroundColor: themeColors.progressTrack, borderColor: themeColors.progressFill },
              ]}>
              <IconSymbol
                name="exclamationmark.triangle.fill"
                color={hazard.severity === 'high' ? themeColors.warningText : hazard.severity === 'mild' ? themeColors.infoText : themeColors.progressFill}
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
    <ThemedText type="defaultSemiBold" style={{ color: themeColors.text }}>
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


