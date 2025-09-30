import { useCallback } from 'react';
import { Howl } from 'howler';

// Preload sounds
const regularAnswerSound = new Howl({
  src: ['/audio/regularAnswer.mp3'],
  volume: 0.7,
});

const highestAnswerSound = new Howl({
  src: ['/audio/highestAnswer.mp3'],
  volume: 0.7,
});

const wrongAnswerSound = new Howl({
  src: ['/audio/jawabanSalah.mp3'],
  volume: 0.7,
});

export const useRevealSound = () => {
  const playRevealSound = useCallback((points: number, allAnswers: Array<{ points: number; text: string }>) => {
    // Find the highest points in the current round
    const maxPoints = Math.max(...allAnswers.map(a => a.points));
    
    // Determine which sound to play
    const isHighestAnswer = points === maxPoints && points > 0;
    const sound = isHighestAnswer ? highestAnswerSound : regularAnswerSound;
    
    // Stop any currently playing instance and play
    sound.stop();
    sound.play();
  }, []);

  const playWrongAnswerSound = useCallback(() => {
    wrongAnswerSound.stop();
    wrongAnswerSound.play();
  }, []);

  return { playRevealSound, playWrongAnswerSound };
};