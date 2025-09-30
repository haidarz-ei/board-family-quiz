import { useState, useEffect, useRef } from "react";
import { database, ref, set } from "../firebase";
import { GameState, Answer, Team } from "../types/game";
import { useToast } from "./use-toast";

export const useGameState = () => {
  const { toast } = useToast();
  const bcRef = useRef<BroadcastChannel | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    question: "",
    answers: {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [] // Bonus round
    },
    teamLeft: { name: "TIM A", score: 0, strikes: 0 },
    teamRight: { name: "TIM B", score: 0, strikes: 0 },
    totalScore: 0,
    round: 1,
    currentPlayingTeam: null
  });

  const [selectedRoundForAnswers, setSelectedRoundForAnswers] = useState(1);
  const [newAnswer, setNewAnswer] = useState({ text: "", points: 0 });
  const [targetIndex, setTargetIndex] = useState<number | null>(null);

  // BroadcastChannel for same-window/tab communication
  useEffect(() => {
    try {
      bcRef.current = new BroadcastChannel('family100-game');
      console.log('useGameState: BroadcastChannel initialized');
    } catch (e) {
      console.warn('useGameState: BroadcastChannel not supported');
    }
    return () => {
      bcRef.current?.close();
      bcRef.current = null;
    };
  }, []);

  // Load saved state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('family100-game-state');
      if (saved) {
        let parsedState = JSON.parse(saved);

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
        parsedState.question = parsedState.question || "";
        parsedState.teamLeft = parsedState.teamLeft || { name: "TIM A", score: 0, strikes: 0 };
        parsedState.teamRight = parsedState.teamRight || { name: "TIM B", score: 0, strikes: 0 };
        parsedState.totalScore = parsedState.totalScore || 0;
        parsedState.currentPlayingTeam = parsedState.currentPlayingTeam || null;

        setGameState(parsedState);
      }
    } catch (error) {
      console.error('Error loading game state:', error);
      // Reset to default state if loading fails
      setGameState({
        question: "",
        answers: { 1: [], 2: [], 3: [], 4: [], 5: [] },
        teamLeft: { name: "TIM A", score: 0, strikes: 0 },
        teamRight: { name: "TIM B", score: 0, strikes: 0 },
        totalScore: 0,
        round: 1,
        currentPlayingTeam: null
      });
    }
  }, []);

  // Save state to localStorage and Firebase
  const saveGameState = async (newState: GameState) => {
    console.log('useGameState: Saving game state:', newState);
    setGameState(newState);
    try {
      localStorage.setItem('family100-game-state', JSON.stringify(newState));
      console.log('useGameState: State saved to localStorage');
    } catch (e) {
      console.error('useGameState: Failed to save state to localStorage', e);
    }
    // Trigger storage event for other windows
    try {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'family100-game-state',
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
    // Save to Firebase for real-time sync across devices
    try {
      await set(ref(database, 'family100-game-state'), newState);
      console.log('useGameState: State saved to Firebase successfully');
    } catch (e) {
      console.error('useGameState: Firebase save failed', e);
    }
  };

  const updateQuestion = (question: string) => {
    saveGameState({ ...gameState, question });
  };

  const addAnswer = (round: number = selectedRoundForAnswers) => {
    if (newAnswer.text.trim()) {
      const updatedAnswers = { ...gameState.answers };
      let arr = [...(updatedAnswers[round] || [])];

      // Add the new answer
      const newAnswerObj = { ...newAnswer, revealed: false };
      if (targetIndex !== null) {
        // Pad with null if necessary
        while (arr.length <= targetIndex) {
          arr.push(null);
        }
        arr[targetIndex] = newAnswerObj;
      } else {
        // Find first empty slot
        const firstEmptyIndex = arr.findIndex(a => a === null);
        if (firstEmptyIndex !== -1) {
          arr[firstEmptyIndex] = newAnswerObj;
        } else {
          // Append if no empty slots
          arr.push(newAnswerObj);
        }
      }

      // Sort answers by points (highest first), keeping nulls at the end
      const validAnswers = arr.filter(a => a !== null);
      const sortedAnswers = validAnswers.sort((a, b) => b.points - a.points);
      const nullCount = arr.length - validAnswers.length;
      const nullArray = new Array(nullCount).fill(null);

      updatedAnswers[round] = [...sortedAnswers, ...nullArray];

      saveGameState({ ...gameState, answers: updatedAnswers });
      setNewAnswer({ text: "", points: 0 });
      setTargetIndex(null);
      toast({ title: `Jawaban ditambahkan dan diurutkan berdasarkan poin!` });
    } else {
      toast({ title: "Masukkan jawaban terlebih dahulu!" });
    }
  };

  const updateAnswer = (index: number, field: keyof Answer, value: string | number | boolean, round: number = selectedRoundForAnswers) => {
    const updatedAnswers = { ...gameState.answers };
    let arr = [...(updatedAnswers[round] || [])];
    if (arr[index]) {
      arr[index] = { ...arr[index], [field]: value } as Answer;

      // If points were updated, re-sort answers by points (highest first)
      if (field === 'points') {
        const validAnswers = arr.filter(a => a !== null);
        const sortedAnswers = validAnswers.sort((a, b) => b.points - a.points);
        const nullCount = arr.length - validAnswers.length;
        const nullArray = new Array(nullCount).fill(null);
        arr = [...sortedAnswers, ...nullArray];
      }

      updatedAnswers[round] = arr;
      saveGameState({ ...gameState, answers: updatedAnswers });
    }
  };

  const deleteAnswer = (index: number, round: number = selectedRoundForAnswers) => {
    const updatedAnswers = { ...gameState.answers };
    let arr = [...(updatedAnswers[round] || [])];
    if (index < arr.length) {
      arr[index] = null;
      updatedAnswers[round] = arr;
      saveGameState({ ...gameState, answers: updatedAnswers });
      toast({ title: `Jawaban dihapus dari posisi ${index + 1} babak ${round}!` });
    }
  };

  const revealAnswer = (index: number, round: number = gameState.round) => {
    console.log('useGameState: Revealing answer at index', index, 'for round', round);
    console.log('useGameState: Current gameState before reveal:', gameState);

    // Update answer revealed status and total score in one state update
    const updatedAnswers = { ...gameState.answers };
    let arr = [...(updatedAnswers[round] || [])];
    if (arr[index]) {
      arr[index] = { ...arr[index], revealed: true } as Answer;
      updatedAnswers[round] = arr;

      // Calculate new total score
      const currentRoundAnswers = updatedAnswers[round] || [];
      const total = currentRoundAnswers
        .filter((answer): answer is Answer => answer !== null && answer.revealed)
        .reduce((sum, answer) => sum + answer.points, 0);

      const newState = { ...gameState, answers: updatedAnswers, totalScore: total };
      saveGameState(newState);
    }

    console.log('useGameState: Answer revealed and total score updated');
    toast({ title: `Jawaban ${index + 1} diungkap!` });
  };

  const hideAnswer = (index: number, round: number = gameState.round) => {
    console.log('useGameState: Hiding answer at index', index, 'for round', round);

    // Update answer revealed status and total score in one state update
    const updatedAnswers = { ...gameState.answers };
    let arr = [...(updatedAnswers[round] || [])];
    if (arr[index]) {
      arr[index] = { ...arr[index], revealed: false } as Answer;
      updatedAnswers[round] = arr;

      // Calculate new total score
      const currentRoundAnswers = updatedAnswers[round] || [];
      const total = currentRoundAnswers
        .filter((answer): answer is Answer => answer !== null && answer.revealed)
        .reduce((sum, answer) => sum + answer.points, 0);

      const newState = { ...gameState, answers: updatedAnswers, totalScore: total };
      saveGameState(newState);
    }

    toast({ title: `Jawaban ${index + 1} disembunyikan!` });
  };

  const updateTeam = (side: 'left' | 'right', field: keyof Team, value: string | number) => {
    const teamKey = side === 'left' ? 'teamLeft' : 'teamRight';
    const updatedTeam = { ...gameState[teamKey], [field]: value };
    saveGameState({ ...gameState, [teamKey]: updatedTeam });
  };

  const updateTotalScore = () => {
    const currentRoundAnswers = gameState.answers[gameState.round] || [];
    const total = currentRoundAnswers
      .filter((answer): answer is Answer => answer !== null && answer.revealed)
      .reduce((sum, answer) => sum + answer.points, 0);
    saveGameState({ ...gameState, totalScore: total });
  };

  const resetGame = () => {
    const resetState: GameState = {
      question: "",
      answers: { 1: [], 2: [], 3: [], 4: [], 5: [] },
      teamLeft: { name: "TIM A", score: 0, strikes: 0 },
      teamRight: { name: "TIM B", score: 0, strikes: 0 },
      totalScore: 0,
      round: 1,
      currentPlayingTeam: null
    };
    saveGameState(resetState);
    setSelectedRoundForAnswers(1);
    toast({ title: "Game direset!" });
  };



  const getAnswerCount = (round: number) => {
    if (round === 5) return 10; // Bonus round
    return 8 - round; // 7, 6, 5, 4 for rounds 1-4
  };

  const getRoundName = (round: number) => {
    if (round === 5) return "Bonus";
    return `Babak ${round}`;
  };

  // Game Control Functions for Family 100 Rules
  const setPlayingTeam = (team: 'left' | 'right' | null) => {
    saveGameState({ ...gameState, currentPlayingTeam: team });
    toast({ title: team ? `Tim ${team === 'left' ? 'Kiri' : 'Kanan'} sedang bermain` : 'Tidak ada tim yang bermain' });
  };

  const addStrike = (team: 'left' | 'right') => {
    const teamKey = team === 'left' ? 'teamLeft' : 'teamRight';
    const currentStrikes = gameState[teamKey].strikes;
    if (currentStrikes < 3) {
      const newStrikes = currentStrikes + 1;
      updateTeam(team, 'strikes', newStrikes);
      toast({
        title: `Strike ditambahkan untuk Tim ${team === 'left' ? 'Kiri' : 'Kanan'}`,
        description: `Strike: ${newStrikes}/3`
      });

      if (newStrikes === 3) {
        toast({
          title: "3 Strike! Tim lawan mendapat kesempatan",
          description: "Giliran berpindah ke tim lawan untuk rebutan poin"
        });
      }
    }
  };

  const resetStrikes = (team: 'left' | 'right') => {
    updateTeam(team, 'strikes', 0);
    toast({ title: `Strike direset untuk Tim ${team === 'left' ? 'Kiri' : 'Kanan'}` });
  };

  const giveRoundPointsToTeam = (team: 'left' | 'right') => {
    const currentScore = team === 'left' ? gameState.teamLeft.score : gameState.teamRight.score;
    const newScore = currentScore + gameState.totalScore;

    // Update team score and reset total score and strikes in one state update
    const updatedState = {
      ...gameState,
      teamLeft: team === 'left'
        ? { ...gameState.teamLeft, score: newScore, strikes: 0 }
        : { ...gameState.teamLeft, strikes: 0 },
      teamRight: team === 'right'
        ? { ...gameState.teamRight, score: newScore, strikes: 0 }
        : { ...gameState.teamRight, strikes: 0 },
      totalScore: 0,
      currentPlayingTeam: null
    };

    saveGameState(updatedState);

    toast({
      title: `Poin babak diberikan ke Tim ${team === 'left' ? 'Kiri' : 'Kanan'}!`,
      description: `+${gameState.totalScore} poin`
    });
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
    updateTeam,
    updateTotalScore,
    resetGame,
    getAnswerCount,
    getRoundName,
    setPlayingTeam,
    addStrike,
    resetStrikes,
    giveRoundPointsToTeam,
    saveGameState
  };
};
