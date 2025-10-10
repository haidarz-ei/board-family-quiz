import { useCallback, useEffect, useState } from 'react';
import { Howl } from 'howler';
import { supabase } from '@/integrations/supabase/client';

// Dynamic sound instances that will be loaded from database
let regularAnswerSound: Howl | null = null;
let highestAnswerSound: Howl | null = null;
let wrongAnswerSound: Howl | null = null;
let addStrikeSound: Howl | null = null;
let roundPointsSound: Howl | null = null;

export const useRevealSound = () => {
  const [soundsLoaded, setSoundsLoaded] = useState(false);

  // Load audio settings from database
  useEffect(() => {
    const loadAudioSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('audio_settings')
          .select('*');

        if (error) throw error;

        // Load each sound
        data?.forEach((setting) => {
          if (!setting.audio_url) return;

          const howlConfig = {
            src: [setting.audio_url],
            volume: 0.7,
            onload: () => console.log(`${setting.audio_type} sound loaded`),
            onloaderror: (id: number, error: string) => console.error(`${setting.audio_type} sound load error:`, error),
          };

          switch (setting.audio_type) {
            case 'regular_answer':
              regularAnswerSound = new Howl(howlConfig);
              break;
            case 'highest_answer':
              highestAnswerSound = new Howl(howlConfig);
              break;
            case 'wrong_answer':
              wrongAnswerSound = new Howl(howlConfig);
              break;
            case 'add_strike':
              addStrikeSound = new Howl(howlConfig);
              break;
            case 'round_points':
              roundPointsSound = new Howl(howlConfig);
              break;
          }
        });

        setSoundsLoaded(true);
      } catch (error) {
        console.error('Error loading audio settings:', error);
      }
    };

    loadAudioSettings();
  }, []);

  const playRevealSound = useCallback((points: number, allAnswers: Array<{ points: number; text: string }>) => {
    if (!soundsLoaded) return;

    try {
      // Find the highest points in the current round
      const maxPoints = Math.max(...allAnswers.map(a => a.points));

      // Determine which sound to play
      const isHighestAnswer = points === maxPoints && points > 0;
      const sound = isHighestAnswer ? highestAnswerSound : regularAnswerSound;

      if (!sound) {
        console.log('Sound not available');
        return;
      }

      // Stop any currently playing instance and play
      sound.stop();
      const playResult = sound.play();
      console.log('Playing reveal sound:', isHighestAnswer ? 'highest' : 'regular', 'points:', points, 'result:', playResult);
    } catch (error) {
      console.error('Error playing reveal sound:', error);
    }
  }, [soundsLoaded]);

  const playWrongAnswerSound = useCallback(() => {
    if (!soundsLoaded || !wrongAnswerSound) return;

    try {
      wrongAnswerSound.stop();
      const playResult = wrongAnswerSound.play();
      console.log('Playing wrong answer sound, result:', playResult);
    } catch (error) {
      console.error('Error playing wrong answer sound:', error);
    }
  }, [soundsLoaded]);

  const playAddStrikeSound = useCallback(() => {
    if (!soundsLoaded || !addStrikeSound) return;

    try {
      addStrikeSound.stop();
      const playResult = addStrikeSound.play();
      console.log('Playing add strike sound, result:', playResult);
    } catch (error) {
      console.error('Error playing add strike sound:', error);
    }
  }, [soundsLoaded]);

  const playRoundPointsSound = useCallback(() => {
    if (!soundsLoaded || !roundPointsSound) return;

    try {
      roundPointsSound.stop();
      const playResult = roundPointsSound.play();
      console.log('Playing round points sound, result:', playResult);
    } catch (error) {
      console.error('Error playing round points sound:', error);
    }
  }, [soundsLoaded]);

  return { 
    playRevealSound, 
    playWrongAnswerSound,
    playAddStrikeSound,
    playRoundPointsSound,
    soundsLoaded 
  };
};