import { useCallback } from 'react';
import { Howl } from 'howler';

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
  const playRevealSound = useCallback((points: number, allAnswers: Array<{ points: number; text: string }>) => {
    try {
      // Find the highest points in the current round
      const maxPoints = Math.max(...allAnswers.map(a => a.points));

      // Determine which sound to play
      const isHighestAnswer = points === maxPoints && points > 0;
      const sound = isHighestAnswer ? highestAnswerSound : regularAnswerSound;

      // Stop any currently playing instance and play
      sound.stop();
      const playResult = sound.play();
      console.log('Playing reveal sound:', isHighestAnswer ? 'highest' : 'regular', 'points:', points, 'result:', playResult);
    } catch (error) {
      console.error('Error playing reveal sound:', error);
    }
  }, []);

  const playWrongAnswerSound = useCallback(() => {
    try {
      wrongAnswerSound.stop();
      const playResult = wrongAnswerSound.play();
      console.log('Playing wrong answer sound, result:', playResult);
    } catch (error) {
      console.error('Error playing wrong answer sound:', error);
    }
  }, []);

  return { playRevealSound, playWrongAnswerSound };
};