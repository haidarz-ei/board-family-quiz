import { useState, useEffect, useRef } from "react";
import { GameState, Answer, Team } from "../types/game";
import { useToast } from "./use-toast";
import { broadcastChannelName, localStorageKey } from "../lib/roomContext";
import { subscribeGameState, publishGameState, publishAudioCommand } from "../lib/realtimeSync";

declare global {
  interface Window {
    stopRevealSound?: () => void;
  }
}

export const useGameState = () => {
  const { toast } = useToast();
  const bcRef = useRef<BroadcastChannel | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    questions: { 1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: "" },
    answers: {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [] // Bonus round (25 answers: 5 questions × 5 answers)
    },
    teamLeft: { name: "TIM A", score: 0, strikes: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
    teamRight: { name: "TIM B", score: 0, strikes: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
    totalScore: 0,
    round: 1,
    showQuestion: { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false, 9: false },
    volumes: { sfx: 0.7, freeMusic: 0.5, freeVideo: 0.8 }
  });

  const [selectedRoundForAnswers, setSelectedRoundForAnswers] = useState(1);
  const [newAnswer, setNewAnswer] = useState({ text: "", points: 0 });
  const [targetIndex, setTargetIndex] = useState<number | null>(null);

  // BroadcastChannel for same-window/tab communication
  useEffect(() => {
    try {
      bcRef.current = new BroadcastChannel(broadcastChannelName());
      console.log('useGameState: BroadcastChannel initialized');
    } catch (e) {
      console.warn('useGameState: BroadcastChannel not supported');
    }
    return () => {
      bcRef.current?.close();
      bcRef.current = null;
    };
  }, []);

  // Supabase Realtime broadcast listener for cross-device sync
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unsubscribe = subscribeGameState((incoming: any) => {
      if (!incoming) return;
      console.log('useGameState: Received update via realtime:', incoming);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const convertToArray = (data: any) => {
          if (Array.isArray(data)) {
            return data.map(a => a === undefined ? null : a);
          } else if (data && typeof data === 'object') {
            const keys = Object.keys(data).map(k => parseInt(k)).filter(k => !isNaN(k));
            if (keys.length === 0) return [];
            const maxIndex = Math.max(...keys);
            const arr = new Array(maxIndex + 1).fill(null);
            for (const [k, v] of Object.entries(data)) {
              const index = parseInt(k);
              if (!isNaN(index)) {
                arr[index] = v === undefined ? null : v;
              }
            }
            return arr;
          } else {
            return [];
          }
      };
      const processedData = {
        ...incoming,
        answers: {
          1: convertToArray(incoming.answers?.[1]),
          2: convertToArray(incoming.answers?.[2]),
          3: convertToArray(incoming.answers?.[3]),
          4: convertToArray(incoming.answers?.[4]),
          5: convertToArray(incoming.answers?.[5])
        }
      };
        // Only update if the data is different from current state to prevent unnecessary re-renders
        setGameState(currentState => {
          if (JSON.stringify(currentState) !== JSON.stringify(processedData)) {
            return processedData;
          }
          return currentState;
        });
        try {
          localStorage.setItem(localStorageKey(), JSON.stringify(processedData));
        } catch (e) {
          console.error('useGameState: Failed to update localStorage', e);
        }
    });
    return () => { unsubscribe(); };
  }, []);

  // Load saved state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(localStorageKey());
      if (saved) {
        const parsedState = JSON.parse(saved);

        // Ensure answers is an object
        if (!parsedState.answers || typeof parsedState.answers !== 'object') {
          parsedState.answers = { 1: [], 2: [], 3: [], 4: [], 5: [] };
        }

        // Ensure answers structure is complete and arrays
        parsedState.answers = {
          1: Array.isArray(parsedState.answers[1]) ? parsedState.answers[1] : [],
          2: Array.isArray(parsedState.answers[2]) ? parsedState.answers[2] : [],
          3: Array.isArray(parsedState.answers[3]) ? parsedState.answers[3] : [],
          4: Array.isArray(parsedState.answers[4]) ? parsedState.answers[4] : [],
          5: Array.isArray(parsedState.answers[5]) ? parsedState.answers[5] : []
        };

        // Ensure round is valid
        if (!parsedState.round || parsedState.round < 1 || parsedState.round > 5) {
          parsedState.round = 1;
        }

        // Ensure other properties exist
        // Handle questions migration from old single question to questions per round
        if (typeof parsedState.question === 'string') {
          // Migrate old single question to questions object
          parsedState.questions = {
            1: parsedState.question,
            2: "",
            3: "",
            4: "",
            5: ""
          };
          delete parsedState.question;
        } else if (!parsedState.questions || typeof parsedState.questions !== 'object') {
          parsedState.questions = { 1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: "" };
        }

        // Handle strikes migration from number to object per round
        if (typeof parsedState.teamLeft?.strikes === 'number') {
          parsedState.teamLeft.strikes = { 1: parsedState.teamLeft.strikes, 2: 0, 3: 0, 4: 0, 5: 0 };
        } else if (!parsedState.teamLeft?.strikes || typeof parsedState.teamLeft.strikes !== 'object') {
          parsedState.teamLeft = parsedState.teamLeft || { name: "TIM A", score: 0, strikes: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
        }

        if (typeof parsedState.teamRight?.strikes === 'number') {
          parsedState.teamRight.strikes = { 1: parsedState.teamRight.strikes, 2: 0, 3: 0, 4: 0, 5: 0 };
        } else if (!parsedState.teamRight?.strikes || typeof parsedState.teamRight.strikes !== 'object') {
          parsedState.teamRight = parsedState.teamRight || { name: "TIM B", score: 0, strikes: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
        }
        parsedState.totalScore = parsedState.totalScore || 0;
        // Fix: Use the saved showQuestion value as is, do not force false here
        if (!parsedState.showQuestion || typeof parsedState.showQuestion !== 'object') {
          parsedState.showQuestion = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false, 9: false };
        }

        if (!parsedState.volumes || typeof parsedState.volumes !== 'object') {
          parsedState.volumes = { sfx: 0.7, freeMusic: 0.5, freeVideo: 0.8 };
        }

        setGameState(parsedState);
      }
    } catch (error) {
      console.error('Error loading game state:', error);
      // Reset to default state if loading fails
      setGameState({
        questions: { 1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: "" },
        answers: { 1: [], 2: [], 3: [], 4: [], 5: [] },
        teamLeft: { name: "TIM A", score: 0, strikes: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
        teamRight: { name: "TIM B", score: 0, strikes: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
        totalScore: 0,
        round: 1,
        showQuestion: { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false, 9: false },
        volumes: { sfx: 0.7, freeMusic: 0.5, freeVideo: 0.8 }
      });
    }
  }, []);

  // Save state to localStorage and Firebase
  const saveGameState = async (newState: GameState) => {
    console.log('useGameState: Saving game state:', newState);
    setGameState(newState);
    try {
      localStorage.setItem(localStorageKey(), JSON.stringify(newState));
      console.log('useGameState: State saved to localStorage');
    } catch (e) {
      console.error('useGameState: Failed to save state to localStorage', e);
    }
    // Trigger storage event for other windows
    try {
      window.dispatchEvent(new StorageEvent('storage', {
        key: localStorageKey(),
        newValue: JSON.stringify(newState)
      }));
      console.log('useGameState: Storage event dispatched');
    } catch (e) {
      console.error('useGameState: Failed to dispatch storage event', e);
    }
    // Broadcast to same-tab listeners (DisplayView in same SPA)
    try {
      bcRef.current?.postMessage({ type: 'state', payload: newState });
      console.log('useGameState: BroadcastChannel message posted');
    } catch (e) {
      console.warn('useGameState: BroadcastChannel post failed', e);
    }
    // Clean answers arrays to replace undefined values with null before saving to Firebase
    const cleanedState = {
      ...newState,
      _updatedAt: Date.now(),
      answers: {
        1: newState.answers[1]?.map(a => a === undefined ? null : a) || [],
        2: newState.answers[2]?.map(a => a === undefined ? null : a) || [],
        3: newState.answers[3]?.map(a => a === undefined ? null : a) || [],
        4: newState.answers[4]?.map(a => a === undefined ? null : a) || [],
        5: newState.answers[5]?.map(a => a === undefined ? null : a) || []
      }
    };
    // Publish via Supabase Realtime broadcast for cross-device sync
    try {
      await publishGameState(cleanedState);
      console.log('useGameState: State broadcast successfully');
    } catch (e) {
      console.error('useGameState: Realtime broadcast failed', e);
    }
  };

  const updateQuestion = (question: string, round: number = gameState.round) => {
    const updatedQuestions = { ...gameState.questions };
    updatedQuestions[round] = question;
    saveGameState({ ...gameState, questions: updatedQuestions });
  };

  const addAnswer = (round: number = selectedRoundForAnswers, overrideIndex?: number) => {
    if (newAnswer.text.trim()) {
      const updatedAnswers = { ...gameState.answers };
      const arr = [...(updatedAnswers[round] || [])];

      // Add the new answer
      const newAnswerObj = { ...newAnswer, revealed: false };
      const finalTargetIndex = overrideIndex !== undefined ? overrideIndex : targetIndex;

      if (finalTargetIndex !== null) {
        // Pad with null if necessary
        while (arr.length <= finalTargetIndex) {
          arr.push(null);
        }
        arr[finalTargetIndex] = newAnswerObj;
      } else {
        // Always append to preserve insertion order for all rounds
        arr.push(newAnswerObj);
      }

      // Keep insertion order for all rounds - sorting only happens when points are updated
      updatedAnswers[round] = arr;

      saveGameState({ ...gameState, answers: updatedAnswers });
      setNewAnswer({ text: "", points: 0 });
      setTargetIndex(null);
      if (finalTargetIndex !== null) {
        toast({ title: "Jawaban diperbarui!" });
      } else {
        toast({ title: "Jawaban ditambahkan!" });
      }
    } else {
      toast({ title: "Masukkan jawaban terlebih dahulu!" });
    }
  };

  const updateAnswer = (index: number, field: keyof Answer, value: string | number | boolean, round: number = selectedRoundForAnswers) => {
    const updatedAnswers = { ...gameState.answers };
    const arr = [...(updatedAnswers[round] || [])];
    if (arr[index]) {
      arr[index] = { ...arr[index], [field]: value } as Answer;

      // For bonus round (round 5), don't sort - keep insertion order
      if (round !== 5 && field === 'points') {
        const validAnswers = arr.filter(a => a !== null);
        const sortedAnswers = validAnswers.sort((a, b) => b.points - a.points);
        const nullCount = arr.length - validAnswers.length;
        const nullArray = new Array(nullCount).fill(null);
        updatedAnswers[round] = [...sortedAnswers, ...nullArray];
      } else {
        // For bonus round or other fields, keep the array as is (insertion order)
        updatedAnswers[round] = arr;
      }

      saveGameState({ ...gameState, answers: updatedAnswers });
    }
  };

  const deleteAnswer = (index: number, round?: number) => {
    const roundToUse = round ?? selectedRoundForAnswers;
    const updatedAnswers = { ...gameState.answers };
    const arr = [...(updatedAnswers[roundToUse] || [])];

    if (roundToUse === 5) {
      // For bonus round, set to null to avoid shifting other questions' answers
      if (index < arr.length && arr[index] !== null) {
        arr[index] = null;
        updatedAnswers[roundToUse] = arr;
        saveGameState({ ...gameState, answers: updatedAnswers });
        const questionNum = Math.floor(index / 5) + 1;
        const positionInQuestion = (index % 5) + 1;
        toast({ title: `Jawaban dihapus dari Pertanyaan ${questionNum}, posisi ${positionInQuestion}!` });
      }
    } else {
      // For regular rounds (1-4), delete by position in sorted list
      const nonNullAnswers = arr.filter(a => a !== null);
      if (index < nonNullAnswers.length) {
        // Find the actual index in the array
        let count = 0;
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] !== null) {
            if (count === index) {
              arr.splice(i, 1);
              break;
            }
            count++;
          }
        }
        updatedAnswers[roundToUse] = arr;
        saveGameState({ ...gameState, answers: updatedAnswers });
        toast({ title: `Jawaban dihapus dari posisi ${index + 1} babak ${roundToUse}!` });
      }
    }
  };

  const revealAnswer = (index: number, round: number = gameState.round) => {
    console.log('useGameState: Revealing answer at index', index, 'for round', round);
    console.log('useGameState: Current gameState before reveal:', gameState);

    // Update answer revealed status and total score in one state update
    const updatedAnswers = { ...gameState.answers };
    const arr = [...(updatedAnswers[round] || [])];
    if (index >= 0 && index < arr.length && arr[index] !== null) {
      arr[index] = { ...arr[index], revealed: true } as Answer;
      updatedAnswers[round] = arr;

      // Calculate new total score
      const currentRoundAnswers = updatedAnswers[round] || [];
      const total = currentRoundAnswers
        .filter(answer => answer != null && answer.revealed)
        .reduce((sum, answer) => sum + answer.points, 0);

      const newState = { ...gameState, answers: updatedAnswers, totalScore: total };
      saveGameState(newState);

      console.log('useGameState: Answer revealed and total score updated');
      toast({ title: `Jawaban ${index + 1} diungkap!` });
    } else {
      console.log('useGameState: Cannot reveal answer - invalid index or null answer');
      toast({ title: `Tidak dapat mengungkap jawaban ${index + 1} - jawaban tidak ada` });
    }
  };

  const hideAnswer = (index: number, round: number = gameState.round) => {
    console.log('useGameState: Hiding answer at index', index, 'for round', round);

    // Update answer revealed status and total score in one state update
    const updatedAnswers = { ...gameState.answers };
    const arr = [...(updatedAnswers[round] || [])];
    if (index >= 0 && index < arr.length && arr[index] !== null) {
      arr[index] = { ...arr[index], revealed: false } as Answer;
      updatedAnswers[round] = arr;

      // Calculate new total score
      const currentRoundAnswers = updatedAnswers[round] || [];
      const total = currentRoundAnswers
        .filter(answer => answer != null && answer.revealed)
        .reduce((sum, answer) => sum + answer.points, 0);

      const newState = { ...gameState, answers: updatedAnswers, totalScore: total };
      saveGameState(newState);

      // Stop any reveal sound when hiding an answer
      if (typeof window !== 'undefined' && window.stopRevealSound) {
        window.stopRevealSound();
      }

      toast({ title: `Jawaban ${index + 1} disembunyikan!` });
    } else {
      console.log('useGameState: Cannot hide answer - invalid index or null answer');
      toast({ title: `Tidak dapat menyembunyikan jawaban ${index + 1} - jawaban tidak ada` });
    }
  };

  const revealAnswerForPlayer = (index: number, player: 'first' | 'second', round: number = gameState.round) => {
    const updatedAnswers = { ...gameState.answers };
    const arr = [...(updatedAnswers[round] || [])];
    if (index < 0 || index >= arr.length || arr[index] === null) {
      toast({ title: `Jawaban di posisi ${index + 1} tidak ada` });
      return;
    }

    // For bonus round: per-question, only one answer per player can be revealed
    if (round === 5) {
      const questionNum = Math.floor(index / 5);
      const startIdx = questionNum * 5;
      const endIdx = startIdx + 5;
      // Check if this player already has a revealed answer for this question
      for (let i = startIdx; i < endIdx; i++) {
        const a = arr[i];
        if (a && a.revealedPlayer === player) {
          // Hide the previous one first
          arr[i] = { ...a, revealed: false, revealedPlayer: null };
        }
      }
    }

    arr[index] = { ...arr[index]!, revealed: true, revealedPlayer: player };
    updatedAnswers[round] = arr;

    const total = (updatedAnswers[round] || []).filter(a => a !== null && a.revealed).reduce((sum, a) => sum + a!.points, 0);
    saveGameState({ ...gameState, answers: updatedAnswers, totalScore: total });
    const playerLabel = player === 'first' ? 'Orang Pertama' : 'Orang Kedua';
    toast({ title: `Jawaban diungkap untuk ${playerLabel}!` });
  };

  const hideAnswerForPlayer = (index: number, round: number = gameState.round) => {
    const updatedAnswers = { ...gameState.answers };
    const arr = [...(updatedAnswers[round] || [])];
    if (index < 0 || index >= arr.length || arr[index] === null) return;

    arr[index] = { ...arr[index]!, revealed: false, revealedPlayer: null };
    updatedAnswers[round] = arr;

    const total = (updatedAnswers[round] || []).filter(a => a !== null && a.revealed).reduce((sum, a) => sum + a!.points, 0);
    saveGameState({ ...gameState, answers: updatedAnswers, totalScore: total });
    toast({ title: `Jawaban disembunyikan!` });
  };

  const updateTeam = (side: 'left' | 'right', field: keyof Team, value: string | number | { [round: number]: number }) => {
    const teamKey = side === 'left' ? 'teamLeft' : 'teamRight';
    const updatedTeam = { ...gameState[teamKey], [field]: value };
    saveGameState({ ...gameState, [teamKey]: updatedTeam });
  };

  const updateVolume = (category: 'sfx' | 'freeMusic' | 'freeVideo', value: number) => {
    const currentVolumes = gameState.volumes || { sfx: 0.7, freeMusic: 0.5, freeVideo: 0.8 };
    saveGameState({ ...gameState, volumes: { ...currentVolumes, [category]: value } });
  };

  const updateTotalScore = () => {
    const currentRoundAnswers = gameState.answers[gameState.round] || [];
    const total = currentRoundAnswers
      .filter(answer => answer != null && answer.revealed)
      .reduce((sum, answer) => sum + answer.points, 0);
    saveGameState({ ...gameState, totalScore: total });
  };

  const resetGame = () => {
    // Clear localStorage first
    try {
      localStorage.removeItem(localStorageKey());
      console.log('useGameState: localStorage cleared');
    } catch (e) {
      console.error('useGameState: Failed to clear localStorage', e);
    }

    const resetState: GameState = {
      questions: { 1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: "" },
      answers: { 1: [], 2: [], 3: [], 4: [], 5: [] },
      teamLeft: { name: "TIM A", score: 0, strikes: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
      teamRight: { name: "TIM B", score: 0, strikes: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
      totalScore: 0,
      round: 1,
      showQuestion: { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false, 9: false },
      volumes: { sfx: 0.7, freeMusic: 0.5, freeVideo: 0.8 }
    };
    saveGameState(resetState);
    setSelectedRoundForAnswers(1);
    toast({ title: "Game direset!" });
  };

  const toggleShowQuestion = (round: number = gameState.round) => {
    const updatedShowQuestion = { ...gameState.showQuestion };
    updatedShowQuestion[round] = !updatedShowQuestion[round];
    saveGameState({ ...gameState, showQuestion: updatedShowQuestion });
  };

  const showQuestion = (round: number = gameState.round) => {
    const updatedShowQuestion = { ...gameState.showQuestion };
    updatedShowQuestion[round] = true;
    saveGameState({ ...gameState, showQuestion: updatedShowQuestion });
  };

  const hideQuestion = (round: number = gameState.round) => {
    const updatedShowQuestion = { ...gameState.showQuestion };
    updatedShowQuestion[round] = false;
    saveGameState({ ...gameState, showQuestion: updatedShowQuestion });
  };



  const getAnswerCount = (round: number) => {
    if (round === 5) return 25; // Bonus round: 5 questions × 5 answers
    return 8 - round; // 7, 6, 5, 4 for rounds 1-4
  };

  const getRoundName = (round: number) => {
    if (round === 5) return "Bonus";
    return `Babak ${round}`;
  };

  // Game Control Functions for Family Fun Time Rules

  const addStrike = (team: 'left' | 'right') => {
    const teamKey = team === 'left' ? 'teamLeft' : 'teamRight';
    const currentStrikes = gameState[teamKey].strikes[gameState.round];
    if (currentStrikes < 3) {
      const newStrikes = { ...gameState[teamKey].strikes };
      newStrikes[gameState.round] = currentStrikes + 1;
      updateTeam(team, 'strikes', newStrikes);
      toast({
        title: `Strike ditambahkan untuk Tim ${team === 'left' ? 'Kiri' : 'Kanan'}`,
        description: `Strike: ${newStrikes[gameState.round]}/3`
      });

      if (newStrikes[gameState.round] === 3) {
        toast({
          title: "3 Strike! Tim lawan mendapat kesempatan",
          description: "Giliran berpindah ke tim lawan untuk rebutan poin"
        });
      }
    }
  };

  const resetStrikes = (team: 'left' | 'right') => {
    // Stop any reveal sound when resetting strikes
    if (typeof window !== 'undefined' && window.stopRevealSound) {
      window.stopRevealSound();
    }

    // Stop any free music that might be playing
    playAudioOnDisplay('free_music_stop');

    const resetStrikesObj = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    updateTeam(team, 'strikes', resetStrikesObj);

    toast({ title: `Strike direset untuk Tim ${team === 'left' ? 'Kiri' : 'Kanan'}` });
  };

  const giveRoundPointsToTeam = (team: 'left' | 'right') => {
    const currentScore = team === 'left' ? gameState.teamLeft.score : gameState.teamRight.score;
    const newScore = currentScore + gameState.totalScore;

    // Update team score and reset total score and strikes in one state update
    const resetStrikesObj = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const updatedState = {
      ...gameState,
      teamLeft: team === 'left'
        ? { ...gameState.teamLeft, score: newScore, strikes: resetStrikesObj }
        : { ...gameState.teamLeft, strikes: resetStrikesObj },
      teamRight: team === 'right'
        ? { ...gameState.teamRight, score: newScore, strikes: resetStrikesObj }
        : { ...gameState.teamRight, strikes: resetStrikesObj },
      totalScore: 0
    };

    saveGameState(updatedState);

    // Play audio for round points
    playAudioOnDisplay('round_points');

    toast({
      title: `Poin babak diberikan ke Tim ${team === 'left' ? 'Kiri' : 'Kanan'}!`,
      description: `+${gameState.totalScore} poin`
    });
  };

  const playAudioOnDisplay = async (audioType: string) => {
    try {
      await publishAudioCommand(audioType);
      console.log('Audio command sent to display:', audioType);
    } catch (e) {
      console.error('Failed to send audio command:', e);
    }
  };

  return {
    gameState,
    selectedRoundForAnswers,
    setSelectedRoundForAnswers,
    newAnswer,
    setNewAnswer,
    targetIndex,
    setTargetIndex,
    updateQuestion,
    addAnswer,
    updateAnswer,
    deleteAnswer,
    revealAnswer,
    hideAnswer,
    revealAnswerForPlayer,
    hideAnswerForPlayer,
    updateTeam,
    updateTotalScore,
    resetGame,
    getAnswerCount,
    getRoundName,
    addStrike,
    resetStrikes,
    giveRoundPointsToTeam,
    saveGameState,
    toggleShowQuestion,
    showQuestion,
    hideQuestion,
    playAudioOnDisplay,
    updateVolume
  };
};
