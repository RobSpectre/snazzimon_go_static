import { useState, useEffect, useCallback, useRef } from 'react';
import type { Coordinates } from '../types';

type PermissionState = 'prompt' | 'granted' | 'denied';

export const useGeolocation = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');
  const watcherId = useRef<number | null>(null);

  const requestPermission = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setPermissionState('denied');
      return;
    }

    // This call triggers the browser's permission prompt.
    // The success/error callbacks will update our state.
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPermissionState('granted');
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError("Geolocation permission denied. Please enable it in your browser or system settings to play.");
          setPermissionState('denied');
        } else {
          setError("Could not get location. Make sure your GPS is enabled and you have a clear view of the sky.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    // This effect manages the location watcher.
    // It starts watching when permission is granted and stops otherwise.
    if (permissionState === 'granted') {
      if (watcherId.current) {
        navigator.geolocation.clearWatch(watcherId.current);
      }

      watcherId.current = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setError(null);
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            setError("Location permission was revoked. The app can't continue.");
            setPermissionState('denied');
          } else {
            setError("Error watching position. GPS signal may be lost.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      // If permission is not 'granted', ensure any existing watcher is cleared.
      if (watcherId.current) {
        navigator.geolocation.clearWatch(watcherId.current);
        watcherId.current = null;
      }
      setLocation(null); // Clear location if we lose permission
    }

    // Cleanup function to clear the watcher when the component unmounts.
    return () => {
      if (watcherId.current) {
        navigator.geolocation.clearWatch(watcherId.current);
      }
    };
  }, [permissionState]);

  // One-time check on mount for pre-existing permission to improve UX
  // for returning users who have already granted permission.
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(status => {
        if (status.state === 'granted') {
          setPermissionState('granted');
        } else if (status.state === 'denied') {
          setPermissionState('denied');
          setError("Geolocation permission has been denied. Please enable it in your browser settings.");
        }
        // If 'prompt', do nothing and wait for user action.
      });
    }
  }, []);

  return { location, error, permissionState, requestPermission };
};
