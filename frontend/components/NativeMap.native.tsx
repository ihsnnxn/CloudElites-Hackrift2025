import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

interface NativeMapProps {
  routeCoords: { latitude: number; longitude: number }[];
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  themeColors: any;
}

export const NativeMap: React.FC<NativeMapProps> = ({ routeCoords, initialRegion, themeColors }) => (
  <MapView
    provider={PROVIDER_GOOGLE}
    style={styles.map}
    initialRegion={initialRegion}
    showsUserLocation
    showsMyLocationButton
  >
    <Polyline coordinates={routeCoords} strokeColor="#007AFF" strokeWidth={4} />
    {routeCoords.map((c, i) => (
      <Marker key={i} coordinate={c} />
    ))}
  </MapView>
);

const styles = StyleSheet.create({
  map: {
    flex: 1,
    borderRadius: 12,
  },
});
