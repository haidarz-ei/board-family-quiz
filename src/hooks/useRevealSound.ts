import { useCallback } from 'react';
import { Howl } from 'howler';
import { useAudioSettings } from './useAudioSettings';

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

  const playRevealSound = useCallback((points: number, allAnswers: Array<{ points: number; text: string }>) => {
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
          });
        } else {
          sound = regularAnswerSound;
        }
      }

      // Stop any currently playing instance and play
      sound.stop();
      const playResult = sound.play();
      console.log('Playing reveal sound:', isHighestAnswer ? 'highest' : 'regular', 'points:', points, 'custom:', !!((isHighestAnswer && customHighestUrl) || (!isHighestAnswer && customRegularUrl)), 'result:', playResult);
    } catch (error) {
      console.error('Error playing reveal sound:', error);
    }
  }, [getAudioUrl]);

  const playWrongAnswerSound = useCallback(() => {
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

      sound.stop();
      const playResult = sound.play();
      console.log('Playing wrong answer sound, custom:', !!customWrongUrl, 'result:', playResult);
    } catch (error) {
      console.error('Error playing wrong answer sound:', error);
    }
  }, [getAudioUrl]);

  return { playRevealSound, playWrongAnswerSound };
};
