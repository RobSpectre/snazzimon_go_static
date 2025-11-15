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

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // On success, we have permission. Update state and location.
        setPermissionState('granted');
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError("Geolocation permission denied. Please enable it in your browser or system settings.");
          setPermissionState('denied');
        } else {
          // Handle other errors like TIMEOUT or POSITION_UNAVAILABLE
          setError("Could not get location. Make sure your GPS is enabled.");
        }
      },
      options
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
           if (err.code === err.PERMISSION_DENIED) {
            setError("Location permission was revoked.");
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