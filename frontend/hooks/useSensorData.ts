import { useEffect, useState } from 'react';

let SensorsModule: any = null;

export default function useSensorData() {
  const [accelerometer, setAccelerometer] = useState({ x: 0, y: 0, z: 0 });
  const [gyroscope, setGyroscope] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    let accelSub: any = null;
    let gyroSub: any = null;

    // load expo-sensors lazily to avoid crashes if native module missing
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      SensorsModule = require('expo-sensors');
    } catch (e) {
      SensorsModule = null;
    }

    if (SensorsModule) {
      try {
        const { Accelerometer, Gyroscope } = SensorsModule;
        Accelerometer.setUpdateInterval(100);
        Gyroscope.setUpdateInterval(100);
        accelSub = Accelerometer.addListener((data: any) => setAccelerometer(data));
        gyroSub = Gyroscope.addListener((data: any) => setGyroscope(data));
      } catch (e) {
        // ignore subscription errors
      }
    }

    return () => {
      if (accelSub && accelSub.remove) accelSub.remove();
      if (gyroSub && gyroSub.remove) gyroSub.remove();
    };
  }, []);

  const magnitude = Math.sqrt(accelerometer.x * accelerometer.x + accelerometer.y * accelerometer.y + accelerometer.z * accelerometer.z || 0);
  const tiltRad = Math.acos(Math.max(-1, Math.min(1, (magnitude ? accelerometer.z / magnitude : 1))));
  const tiltDeg = (tiltRad * 180) / Math.PI;

  return {
    accelerometer,
    gyroscope,
    vibration: magnitude,
    tilt: tiltDeg,
  };
}
