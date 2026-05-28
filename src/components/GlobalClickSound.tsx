import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const GlobalClickSound = () => {
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Exclude admin and display routes
  const isExcludedRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/display');

  useEffect(() => {
    // Initialize audio instance once
    if (!audioRef.current) {
      const audio = new Audio('/audio/click.mp3');
      audio.volume = 0.5; // Set appropriate volume
      audioRef.current = audio;
    }
  }, []);

  useEffect(() => {
    if (isExcludedRoute) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if the clicked element or its parent is a button or clickable element
      const isClickable = target.closest('button') || 
                         target.closest('a') || 
                         target.closest('[role="button"]') ||
                         target.tagName.toLowerCase() === 'input' && (target as HTMLInputElement).type === 'button' ||
                         target.tagName.toLowerCase() === 'input' && (target as HTMLInputElement).type === 'submit';

      if (isClickable) {
        // Play the sound, resetting time if it's already playing
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {
            // Ignore autoplay errors
          });
        }
      }
    };

    // Use capture phase to catch the event early
    document.addEventListener('click', handleClick, true);
    
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [isExcludedRoute]);

  return null; // This is a utility component, no UI
};
