import React, { useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Circle } from 'react-native-maps';

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
  currentPosition?: { latitude: number; longitude: number } | null;
}

export const NativeMap: React.FC<NativeMapProps> = ({ routeCoords, initialRegion, themeColors, hazards = [], currentPosition = null }) => {
  const mapRef = useRef<MapView>(null);
  
  const getMarkerColor = (severity: string) => {
    switch (severity) {
      case 'safe': return '#18B26B'; // Green
      case 'mild': return '#F1C40F'; // Yellow
      case 'high': return '#E74C3C'; // Red
      default: return '#007AFF';
    }
  };

  // Auto-follow current position
  useEffect(() => {
    if (currentPosition && mapRef.current) {
      mapRef.current.animateCamera({
        center: currentPosition,
        zoom: 18,
      }, { duration: 1000 });
    }
  }, [currentPosition]);

  return (
    <MapView
      ref={mapRef}
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
      {currentPosition && (
        <>
          {/* Outer circle (light blue) */}
          <Circle
            center={currentPosition}
            radius={15}
            fillColor="rgba(66, 133, 244, 0.2)"
            strokeColor="rgba(66, 133, 244, 0.5)"
            strokeWidth={1}
          />
          {/* Inner circle (solid blue dot) */}
          <Circle
            center={currentPosition}
            radius={5}
            fillColor="#4285F4"
            strokeColor="#FFFFFF"
            strokeWidth={2}
          />
        </>
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
    borderRadius: 12,
  },
});
