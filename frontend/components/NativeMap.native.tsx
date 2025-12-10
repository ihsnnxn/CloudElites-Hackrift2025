import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

interface Hazard {
  id: string;
  title: string;
  severity: 'safe' | 'mild' | 'high';
  distance: string;
  lat: number;
  lng: number;
}

interface NativeMapProps {
  routeCoords: { latitude: number; longitude: number }[];
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  themeColors: any;
  hazards?: Hazard[];
}

export const NativeMap: React.FC<NativeMapProps> = ({ routeCoords, initialRegion, themeColors, hazards = [] }) => {
  const getMarkerColor = (severity: string) => {
    switch (severity) {
      case 'safe': return '#18B26B'; // Green
      case 'mild': return '#F1C40F'; // Yellow
      case 'high': return '#E74C3C'; // Red
      default: return '#007AFF';
    }
  };

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton
    >
      <Polyline coordinates={routeCoords} strokeColor="#007AFF" strokeWidth={4} />
      {hazards.map((hazard) => (
        <Marker
          key={hazard.id}
          coordinate={{ latitude: hazard.lat, longitude: hazard.lng }}
          pinColor={getMarkerColor(hazard.severity)}
          title={hazard.title}
          description={`Severity: ${hazard.severity}`}
        />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
    borderRadius: 12,
  },
});
