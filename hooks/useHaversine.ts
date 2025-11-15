
import { useMemo } from 'react';
import type { Coordinates } from '../types';

const toRad = (deg: number): number => (deg * Math.PI) / 180;
const toDeg = (rad: number): number => (rad * 180) / Math.PI;

export const useHaversine = (from: Coordinates | null, to: Coordinates | null) => {
  const calculations = useMemo(() => {
    if (!from || !to) {
      return { distance: null, bearing: null };
    }

    const R = 6371e3; // meters
    const lat1 = toRad(from.latitude);
    const lat2 = toRad(to.latitude);
    const deltaLat = toRad(to.latitude - from.latitude);
    const deltaLon = toRad(to.longitude - from.longitude);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // in meters

    const y = Math.sin(deltaLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
    const bearingRad = Math.atan2(y, x);
    const bearing = (toDeg(bearingRad) + 360) % 360; // in degrees

    return { distance, bearing };
  }, [from, to]);

  return calculations;
};
