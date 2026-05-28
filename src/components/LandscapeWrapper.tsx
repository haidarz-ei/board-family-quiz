import { ReactNode, CSSProperties } from "react";
import { useForceLandscape } from "../hooks/useForceLandscape";

interface LandscapeWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper component that forces its children to render in landscape orientation.
 *
 * When the device/viewport is in portrait mode, this component creates a
 * landscape-shaped container (width=viewportHeight, height=viewportWidth)
 * and rotates it 90° clockwise so it fills the portrait viewport.
 *
 * Children inside see a landscape coordinate system where width > height.
 *
 * When the device is already in landscape, no transformation is applied.
 */
export const LandscapeWrapper = ({ children }: LandscapeWrapperProps) => {
  const { isPortrait, landscapeWidth, landscapeHeight } = useForceLandscape();

  if (!isPortrait) {
    // Already landscape — render children as-is, fullscreen
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          position: "fixed",
          top: 0,
          left: 0,
        }}
      >
        {children}
      </div>
    );
  }

  // Portrait → force landscape via CSS rotation
  // The container is landscape-shaped BEFORE rotation:
  //   width  = landscapeWidth  = viewport height (the larger dimension, e.g. 812px)
  //   height = landscapeHeight = viewport width  (the smaller dimension, e.g. 375px)
  //
  // After rotate(90deg) around top-left + translateY(-100%):
  //   The container fills the portrait viewport [0, 375] × [0, 812]
  const wrapperStyle: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: `${landscapeWidth}px`,   // landscape width (larger dimension)
    height: `${landscapeHeight}px`, // landscape height (smaller dimension)
    transform: `rotate(90deg) translateY(-100%)`,
    transformOrigin: "top left",
    overflow: "hidden",
    zIndex: 9999,
  };

  return <div style={wrapperStyle}>{children}</div>;
};
