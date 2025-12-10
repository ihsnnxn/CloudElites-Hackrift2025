import { useEffect, useRef, useState } from 'react';
// Delay requiring expo-location until startTracking to avoid native-module crashes
let LocationModule: any = null;

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
}

function haversineMeters(a: UserLocation, b: UserLocation) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const aa = sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
}

export default function useLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const lastRef = useRef<UserLocation | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const startTracking = async () => {
    // try to load expo-location dynamically
    if (!LocationModule) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        LocationModule = require('expo-location');
      } catch (e: any) {
        setErrorMsg('Native location module not available. Rebuild the app with expo-location.');
        return false;
      }
    }
    try {
      const { status } = await LocationModule.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission denied');
        return false;
      }

      // start watching position
      subscriptionRef.current = await LocationModule.watchPositionAsync(
        { accuracy: LocationModule.Accuracy.Balanced, timeInterval: 1000, distanceInterval: 1 },
        (loc: any) => {
          if (!loc) return;
          const u: UserLocation = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy,
            altitude: loc.coords.altitude,
            heading: loc.coords.heading,
            speed: loc.coords.speed,
          };
          setLocation(u);
          if (lastRef.current) {
            const d = haversineMeters(lastRef.current, u);
            if (d > 0.001) setDistance((prev) => prev + d);
          }
          lastRef.current = u;
        }
      );
      setIsTracking(true);
      return true;
    } catch (e: any) {
      setErrorMsg(e?.message ?? String(e));
      return false;
    }
  };

  const stopTracking = async () => {
    try {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    } finally {
      setIsTracking(false);
    }
  };

  useEffect(() => {
    return () => {
      if (subscriptionRef.current) subscriptionRef.current.remove();
    };
  }, []);

  return {
    location,
    distance,
    errorMsg,
    isTracking,
    startTracking,
    stopTracking,
  };
}
