import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook to detect if the device is in portrait mode
 * and provide dimensions for a forced landscape layout.
 *
 * When the viewport is portrait (height > width), it signals
 * that the display container should be rotated 90°, swapping
 * width ↔ height so the content renders in landscape orientation.
 */
export const useForceLandscape = () => {
  const getOrientation = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return {
      isPortrait: h > w,
      viewportWidth: w,
      viewportHeight: h,
      // When portrait, the rotated container uses height as its width and vice-versa
      landscapeWidth: h > w ? h : w,
      landscapeHeight: h > w ? w : h,
    };
  };

  const [orientation, setOrientation] = useState(getOrientation);

  const handleResize = useCallback(() => {
    setOrientation(getOrientation());
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    // Also listen to screen.orientation API if available
    if (screen.orientation) {
      screen.orientation.addEventListener("change", handleResize);
    }

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (screen.orientation) {
        screen.orientation.removeEventListener("change", handleResize);
      }
    };
  }, [handleResize]);

  return orientation;
};
