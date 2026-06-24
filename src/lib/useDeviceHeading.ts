import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Real device compass heading (degrees clockwise from north), from the
 * DeviceOrientation API. Returns null until a reading arrives or if the sensor
 * is unavailable. On iOS, call `request()` from a user gesture to grant access.
 */
export function useDeviceHeading() {
  const [heading, setHeading] = useState<number | null>(null);
  const [supported, setSupported] = useState(false);
  const listening = useRef(false);

  const onEvent = useCallback((e: DeviceOrientationEvent) => {
    // iOS exposes a true-north heading via webkitCompassHeading.
    const webkit = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading;
    if (typeof webkit === "number") {
      setHeading(webkit);
    } else if (e.alpha != null) {
      // alpha is counter-clockwise from north → convert to clockwise.
      setHeading((360 - e.alpha) % 360);
    }
  }, []);

  const start = useCallback(() => {
    if (listening.current) return;
    listening.current = true;
    window.addEventListener("deviceorientationabsolute", onEvent as EventListener);
    window.addEventListener("deviceorientation", onEvent as EventListener);
  }, [onEvent]);

  const request = useCallback(async () => {
    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof DOE?.requestPermission === "function") {
      try {
        const res = await DOE.requestPermission();
        if (res !== "granted") return false;
      } catch {
        return false;
      }
    }
    start();
    return true;
  }, [start]);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "DeviceOrientationEvent" in window);
    // Auto-start where no explicit permission is required (Android/desktop).
    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof DOE?.requestPermission !== "function") start();
    return () => {
      window.removeEventListener("deviceorientationabsolute", onEvent as EventListener);
      window.removeEventListener("deviceorientation", onEvent as EventListener);
      listening.current = false;
    };
  }, [onEvent, start]);

  return { heading, supported, request };
}
