import { useState, useEffect, useCallback } from 'react';

type MotionPermissionState = 'prompt' | 'granted' | 'denied';

// Debounce helper to prevent multiple triggers for a single shake
const debounce = (func: Function, delay: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

export const useShakeDetector = (
  onShake: () => void,
  { enabled = false, threshold = 15, timeout = 500 } = {}
) => {
  const [permissionState, setPermissionState] = useState<MotionPermissionState>('prompt');

  const requestPermission = useCallback(async () => {
    // Check if the API exists and is a function (for iOS 13.3+)
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        setPermissionState(permission);
        return permission === 'granted';
      } catch (error) {
        console.error('Motion permission request failed:', error);
        setPermissionState('denied');
        return false;
      }
    } else {
      // For non-iOS browsers or older versions
      setPermissionState('granted');
      return true;
    }
  }, []);
  
  const debouncedOnShake = useCallback(debounce(onShake, timeout), [onShake, timeout]);

  useEffect(() => {
    let lastX: number | null = null;
    let lastY: number | null = null;
    let lastZ: number | null = null;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const { acceleration } = event;
      if (!acceleration) return;

      const { x, y, z } = acceleration;
      
      if (lastX !== null && lastY !== null && lastZ !== null) {
          const deltaX = Math.abs(x! - lastX);
          const deltaY = Math.abs(y! - lastY);
          const deltaZ = Math.abs(z! - lastZ);
          
          if ((deltaX + deltaY + deltaZ) > threshold) {
              debouncedOnShake();
          }
      }
      
      lastX = x;
      lastY = y;
      lastZ = z;
    };

    if (enabled && permissionState === 'granted') {
      window.addEventListener('devicemotion', handleDeviceMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [enabled, permissionState, threshold, debouncedOnShake]);

  return { permissionState, requestPermission };
};
