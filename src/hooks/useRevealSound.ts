import { useCallback, useRef } from 'react';
import { Howl } from 'howler';
import { useAudioSettings } from './useAudioSettings';

// Debounce utility to prevent rapid successive calls
const debounce = <T extends (...args: unknown[]) => void>(func: T, wait: number): T => {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  }) as T;
};

// Preload sounds
const regularAnswerSound = new Howl({
  src: ['/audio/regularAnswer.mp3'],
  volume: 0.7,
  onload: () => console.log('Regular answer sound loaded'),
  onloaderror: (id, error) => console.error('Regular answer sound load error:', error),
});

const highestAnswerSound = new Howl({
  src: ['/audio/highestAnswer.mp3'],
  volume: 0.7,
  onload: () => console.log('Highest answer sound loaded'),
  onloaderror: (id, error) => console.error('Highest answer sound load error:', error),
});

const wrongAnswerSound = new Howl({
  src: ['/audio/jawabanSalah.mp3'],
  volume: 0.7,
  onload: () => console.log('Wrong answer sound loaded'),
  onloaderror: (id, error) => console.error('Wrong answer sound load error:', error),
});

export const useRevealSound = () => {
  const { getAudioUrl } = useAudioSettings();
  const currentRevealSoundRef = useRef<Howl | null>(null);
  const currentWrongSoundRef = useRef<Howl | null>(null);
  const revealTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wrongTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRevealPlayingRef = useRef<boolean>(false);

  const playRevealSound = useCallback((points: number, allAnswers: Array<{ points: number; text: string }>) => {
    // If a reveal sound is already playing, don't start a new one
    if (isRevealPlayingRef.current) {
      console.log('Reveal sound already playing, skipping new play request');
      return;
    }

    // Clear any existing timeout to prevent overlapping sounds
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }

    // Stop any currently playing reveal sound immediately
    if (currentRevealSoundRef.current) {
      currentRevealSoundRef.current.stop();
      currentRevealSoundRef.current.unload();
      currentRevealSoundRef.current = null;
    }

    // Set playing flag
    isRevealPlayingRef.current = true;

    // Debounce the sound playing to prevent rapid successive calls
    revealTimeoutRef.current = setTimeout(() => {
      try {
        // Find the highest points in the current round
        const maxPoints = Math.max(...allAnswers.map(a => a.points));

        // Determine which sound to play
        const isHighestAnswer = points === maxPoints && points > 0;

        // Check if custom audio is available from settings
        const customRegularUrl = getAudioUrl('regular_answer');
        const customHighestUrl = getAudioUrl('highest_answer');

        let sound: Howl;

        if (isHighestAnswer) {
          if (customHighestUrl) {
            sound = new Howl({
              src: [customHighestUrl],
              volume: 0.7,
              onload: () => console.log('Custom highest answer sound loaded'),
              onloaderror: (id, error) => console.error('Custom highest answer sound load error:', error),
              onplay: () => {
                console.log('Custom highest answer sound started playing');
                isRevealPlayingRef.current = true;
              },
              onend: () => {
                console.log('Custom highest answer sound finished');
                if (currentRevealSoundRef.current === sound) {
                  currentRevealSoundRef.current = null;
                }
                isRevealPlayingRef.current = false;
              },
              onstop: () => {
                console.log('Custom highest answer sound stopped');
                if (currentRevealSoundRef.current === sound) {
                  currentRevealSoundRef.current = null;
                }
                isRevealPlayingRef.current = false;
              }
            });
          } else {
            sound = highestAnswerSound;
          }
        } else {
          if (customRegularUrl) {
            sound = new Howl({
              src: [customRegularUrl],
              volume: 0.7,
              onload: () => console.log('Custom regular answer sound loaded'),
              onloaderror: (id, error) => console.error('Custom regular answer sound load error:', error),
              onplay: () => {
                console.log('Custom regular answer sound started playing');
                isRevealPlayingRef.current = true;
              },
              onend: () => {
                console.log('Custom regular answer sound finished');
                if (currentRevealSoundRef.current === sound) {
                  currentRevealSoundRef.current = null;
                }
                isRevealPlayingRef.current = false;
              },
              onstop: () => {
                console.log('Custom regular answer sound stopped');
                if (currentRevealSoundRef.current === sound) {
                  currentRevealSoundRef.current = null;
                }
                isRevealPlayingRef.current = false;
              }
            });
          } else {
            sound = regularAnswerSound;
          }
        }

        currentRevealSoundRef.current = sound;
        const playResult = sound.play();
        console.log('Playing reveal sound:', isHighestAnswer ? 'highest' : 'regular', 'points:', points, 'custom:', !!((isHighestAnswer && customHighestUrl) || (!isHighestAnswer && customRegularUrl)), 'result:', playResult);
      } catch (error) {
        console.error('Error playing reveal sound:', error);
        isRevealPlayingRef.current = false;
      }
    }, 100); // 100ms debounce
  }, [getAudioUrl]);

  const playWrongAnswerSound = useCallback(() => {
    // Clear any existing timeout to prevent overlapping sounds
    if (wrongTimeoutRef.current) {
      clearTimeout(wrongTimeoutRef.current);
      wrongTimeoutRef.current = null;
    }

    // Stop any currently playing wrong sound immediately
    if (currentWrongSoundRef.current) {
      currentWrongSoundRef.current.stop();
      currentWrongSoundRef.current.unload();
      currentWrongSoundRef.current = null;
    }

    // Debounce the sound playing to prevent rapid successive calls
    wrongTimeoutRef.current = setTimeout(() => {
      try {
        const customWrongUrl = getAudioUrl('wrong_answer');
        let sound: Howl;

        if (customWrongUrl) {
          sound = new Howl({
            src: [customWrongUrl],
            volume: 0.7,
            onload: () => console.log('Custom wrong answer sound loaded'),
            onloaderror: (id, error) => console.error('Custom wrong answer sound load error:', error),
          });
        } else {
          sound = wrongAnswerSound;
        }

        currentWrongSoundRef.current = sound;
        const playResult = sound.play();
        console.log('Playing wrong answer sound, custom:', !!customWrongUrl, 'result:', playResult);
      } catch (error) {
        console.error('Error playing wrong answer sound:', error);
      }
    }, 100); // 100ms debounce
  }, [getAudioUrl]);

  const stopRevealSound = useCallback(() => {
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    if (currentRevealSoundRef.current) {
      currentRevealSoundRef.current.stop();
      currentRevealSoundRef.current.unload();
      currentRevealSoundRef.current = null;
    }
    isRevealPlayingRef.current = false;
  }, []);

  const stopWrongAnswerSound = useCallback(() => {
    if (wrongTimeoutRef.current) {
      clearTimeout(wrongTimeoutRef.current);
      wrongTimeoutRef.current = null;
    }
    if (currentWrongSoundRef.current) {
      currentWrongSoundRef.current.stop();
      currentWrongSoundRef.current.unload();
      currentWrongSoundRef.current = null;
    }
  }, []);

  return { playRevealSound, playWrongAnswerSound, stopRevealSound, stopWrongAnswerSound };
};
