import { useEffect, useRef, useState, ReactNode } from "react";

interface FitScreenWrapperProps {
  children: ReactNode;
  width?: number;
  height?: number;
}

export const FitScreenWrapper = ({ children, width = 1024, height = 768 }: FitScreenWrapperProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && containerRef.current.parentElement) {
        const parent = containerRef.current.parentElement;
        const parentWidth = parent.clientWidth;
        const parentHeight = parent.clientHeight;
        
        const scaleX = parentWidth / width;
        const scaleY = parentHeight / height;
        
        setScale(Math.min(scaleX, scaleY));
      }
    };

    window.addEventListener("resize", updateScale);
    window.addEventListener("orientationchange", updateScale);
    
    // Initial check and slight delay to ensure parent is fully rendered
    updateScale();
    const timeout = setTimeout(updateScale, 100);

    return () => {
      window.removeEventListener("resize", updateScale);
      window.removeEventListener("orientationchange", updateScale);
      clearTimeout(timeout);
    };
  }, [width, height]);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 10 }}>
      <div 
        ref={containerRef}
        style={{ 
          width: `${width}px`, 
          height: `${height}px`, 
          transform: `scale(${scale})`, 
          transformOrigin: "center center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start", // Start from top
          paddingTop: "40px" // give some breathing room
        }}
      >
        {children}
      </div>
    </div>
  );
};
