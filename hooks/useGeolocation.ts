
import { useState, useEffect, useCallback } from 'react';
import type { Coordinates } from '../types';

type PermissionState = 'prompt' | 'granted' | 'denied';

export const useGeolocation = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');

  const requestPermission = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setPermissionState('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        // We don't need the position here, just the permission grant
        // The watchPosition will handle updates
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError("Geolocation permission denied.");
          setPermissionState('denied');
        } else {
          setError("Error getting location.");
        }
      }
    );
  }, []);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "permissions" in navigator) {
        navigator.permissions.query({ name: 'geolocation' }).then(status => {
            setPermissionState(status.state);
            status.onchange = () => {
                setPermissionState(status.state);
            };
        });
    }

    let watcher: number | null = null;
    if (permissionState === 'granted') {
      watcher = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setError(null);
        },
        (err) => {
          setError("Error watching position.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
        setLocation(null);
    }

    return () => {
      if (watcher) {
        navigator.geolocation.clearWatch(watcher);
      }
    };
  }, [permissionState]);

  return { location, error, permissionState, requestPermission };
};
