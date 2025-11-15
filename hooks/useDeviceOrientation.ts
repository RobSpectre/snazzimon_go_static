import { useState, useEffect, useCallback } from 'react';

interface OrientationData {
  alpha: number | null; // Z-axis rotation (compass heading): 0-360
  beta: number | null;  // X-axis rotation: -180 to 180
  gamma: number | null; // Y-axis rotation: -90 to 90
}

export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState<OrientationData>({
    alpha: null,
    beta: null,
    gamma: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isSupported, setIsSupported] = useState(true);

  const requestPermission = useCallback(async () => {
    // Check if DeviceOrientationEvent is supported
    if (!window.DeviceOrientationEvent) {
      setError('Device orientation is not supported on this device.');
      setIsSupported(false);
      setPermissionState('denied');
      return;
    }

    // iOS 13+ requires permission request
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionState('granted');
          setError(null);
        } else {
          setPermissionState('denied');
          setError('Device orientation permission denied.');
        }
      } catch (err) {
        setPermissionState('denied');
        setError('Error requesting device orientation permission.');
        console.error(err);
      }
    } else {
      // Non-iOS devices or older iOS versions don't require permission
      setPermissionState('granted');
    }
  }, []);

  useEffect(() => {
    if (permissionState !== 'granted') return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({
        alpha: event.alpha, // Compass heading (0-360)
        beta: event.beta,
        gamma: event.gamma,
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [permissionState]);

  // Get the compass heading (0-360 degrees, where 0 is North)
  const heading = orientation.alpha;

  return {
    orientation,
    heading,
    error,
    permissionState,
    isSupported,
    requestPermission,
  };
};
