import { useState, useEffect, useRef } from "react";
import { BonusDisplayView } from "./BonusDisplayView";
import { useRevealSound } from "../hooks/useRevealSound";
import { useAudioSettings } from "../hooks/useAudioSettings";
import { database, ref, onValue, set } from "../firebase";

interface Team {
  name: string;
  score: number;
  strikes: { [round: number]: number };
}

interface Answer {
  text: string;
  points: number;
  revealed: boolean;
}

interface GameState {
  questions: { [round: number]: string };
  answers: { [round: number]: (Answer | null)[] };
  teamLeft: Team;
  teamRight: Team;
  totalScore: number;
  round: number;
  currentPlayingTeam: 'left' | 'right' | null;
  showQuestion: { [round: number]: boolean };
}

export const DisplayView = () => {
  const { playRevealSound, playWrongAnswerSound } = useRevealSound();
  const { getAudioUrl } = useAudioSettings();
  const prevRevealedRef = useRef<string[]>([]);
  const prevStrikesRef = useRef<{ left: { [round: number]: number }, right: { [round: number]: number } }>({
    left: {},
    right: {}
  });
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioCommandRef = useRef<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    questions: { 1: "", 2: "", 3: "", 4: "", 5: "" },
    answers: {
      1: [],
      2: [],
      3: [],
      4: [],
      5: []
    },
    teamLeft: { name: "TIM A", score: 0, strikes: {} },
    teamRight: { name: "TIM B", score: 0, strikes: {} },
    totalScore: 0,
    round: 1,
    currentPlayingTeam: null,
    showQuestion: { 1: false, 2: false, 3: false, 4: false, 5: false }
  });

  // Listen for audio commands from Firebase
  useEffect(() => {
    const audioCommandRef = ref(database, 'family100-audio-command');
    const unsubscribeAudio = onValue(audioCommandRef, (snapshot) => {
      const command = snapshot.val();
      if (command && command.audioType && audioEnabled) {
        const audioUrl = getAudioUrl(command.audioType);
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          audio.play().catch(console.error);
          // Clear the audio command after playing to prevent continuous playback
          set(ref(database, 'family100-audio-command'), null);
        }
      }
    });

    return () => {
      unsubscribeAudio();
    };
  }, [getAudioUrl, audioEnabled]);

  // Listen for updates from Firebase real-time database and localStorage
  useEffect(() => {
    const handleStateUpdate = (newState: GameState) => {
      // Check for newly revealed answers
      const currentAnswers = newState.answers[newState.round] || [];
      const validAnswers = currentAnswers.filter((answer): answer is Answer => answer !== null);
      const currentRevealed = validAnswers
        .filter((answer: Answer) => answer.revealed)
        .map((answer: Answer) => `${newState.round}-${answer.text}`);

      const newRevealed = currentRevealed.filter(
        (id: string) => !prevRevealedRef.current.includes(id)
      );

      // Play sound for each newly revealed answer
      for (const revealedId of newRevealed) {
        const answer = validAnswers.find((a: Answer) =>
          a.revealed && `${newState.round}-${a.text}` === revealedId
        );
        if (answer) {
          playRevealSound(answer.points, validAnswers);
        }
      }

      // Check for strikes increase and play wrong answer sound
      const currentRound = newState.round;
      const leftStrikesIncreased = (newState.teamLeft.strikes[currentRound] || 0) > (prevStrikesRef.current.left[currentRound] || 0);
      const rightStrikesIncreased = (newState.teamRight.strikes[currentRound] || 0) > (prevStrikesRef.current.right[currentRound] || 0);

      if (leftStrikesIncreased || rightStrikesIncreased) {
        playWrongAnswerSound();
      }

      prevRevealedRef.current = currentRevealed;
      prevStrikesRef.current = {
        left: newState.teamLeft.strikes,
        right: newState.teamRight.strikes
      };
      setGameState(newState);
    };

    // Firebase listener
    console.log('DisplayView: Setting up Firebase listener');
    const gameStateRef = ref(database, 'family100-game-state');
    const unsubscribeFirebase = onValue(gameStateRef, (snapshot) => {
      const newState = snapshot.val();
      console.log('DisplayView: Firebase snapshot received:', newState);
      if (newState) {
        console.log('DisplayView: Processing new state from Firebase');
        handleStateUpdate(newState);
      } else {
        console.log('DisplayView: No data in Firebase snapshot');
      }
    });

    // localStorage listener
    const handleStorageChange = () => {
      const stored = localStorage.getItem('family100-game-state');
      if (stored) {
        const newState = JSON.parse(stored);
        handleStateUpdate(newState);
      } else {
        // Set empty default state if no stored state
        const defaultState = {
          questions: { 1: "", 2: "", 3: "", 4: "", 5: "" },
          answers: {
            1: [],
            2: [],
            3: [],
            4: [],
            5: []
          },
          teamLeft: { name: "TIM A", score: 0, strikes: {} },
          teamRight: { name: "TIM B", score: 0, strikes: {} },
          totalScore: 0,
          round: 1,
          currentPlayingTeam: null,
          showQuestion: { 1: false, 2: false, 3: false, 4: false, 5: false }
        };
        localStorage.setItem('family100-game-state', JSON.stringify(defaultState));
        setGameState(defaultState);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange(); // Load initial state

    return () => {
      unsubscribeFirebase();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [playRevealSound, playWrongAnswerSound]);



  // Calculate answer count based on round
  const getAnswerCount = (round: number) => {
    if (round === 5) return 10; // Bonus round
    return 8 - round; // 7, 6, 5, 4 for rounds 1-4
  };

  const currentRoundAnswers = gameState.answers[gameState.round] || [];
  const answerCount = getAnswerCount(gameState.round);
  const displayAnswers = Array.from({ length: answerCount }, (_, index) => {
    const answer = currentRoundAnswers[index];
    return answer || { text: '', points: 0, revealed: false };
  });

  console.log('DisplayView RENDER: currentRoundAnswers:', currentRoundAnswers);
  console.log('DisplayView RENDER: displayAnswers:', displayAnswers);
  console.log('DisplayView RENDER: gameState.round:', gameState.round);

  const isBonusRound = gameState.round === 5;

  if (isBonusRound) {
    return <BonusDisplayView gameState={gameState} />;
  }

  const enableAudio = () => {
    if (!audioEnabled) {
      // Create and play a silent audio to unlock audio context
      const webkitAudioContext = (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      const audioContext = new (window.AudioContext || webkitAudioContext!)();
      const buffer = audioContext.createBuffer(1, 1, 22050);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
      setAudioEnabled(true);
      console.log('DisplayView: Audio enabled by user interaction');
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white overflow-hidden font-sans relative" onClick={enableAudio}>
      {!audioEnabled && (
        <div className="fixed top-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg z-50 font-bold">
          Klik di sini untuk enable suara 🎵
        </div>
      )}
      <video autoPlay muted loop id="bgVideo" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-auto z-0">
        <source src="/video/2.mp4" type="video/mp4" />
        Browser Anda tidak mendukung mp4.
      </video>

      <div className="w-full text-center py-4 relative z-20">
        {gameState.showQuestion[gameState.round] && (
          <h1 className="text-3xl font-bold text-white">{gameState.questions[gameState.round]}</h1>
        )}
      </div>

      <div className="game-container relative z-10 flex items-start justify-center p-4 gap-8 flex-nowrap text-white" style={{ marginTop: '20px' }}>

        {/* TIM KIRI */}
        <div className="team-wrapper flex flex-col items-center gap-2.5" style={{marginTop: '50px'}}>
          <div className="team-name inline-block font-semibold text-2xl px-4 py-1 rounded-[20px] mb-1 font-poppins shadow-lg bg-white text-gray-800">
            {gameState.teamLeft.name}
          </div>

          <div className="team-box bg-[#ff6c00] border-4 border-[#ffd500] rounded-[30px] w-[100px] h-[80px] flex items-center justify-center shadow-lg">
            <div className="team-score text-[32px] font-bold text-white">
              {gameState.teamLeft.score}
            </div>
          </div>

          {(gameState.teamLeft.strikes[gameState.round] || 0) > 0 && (
            <div className="strikes mt-2.5 flex flex-col gap-2 text-4xl text-red-500">
              {[1, 2, 3].map((num) =>
                (gameState.teamLeft.strikes[gameState.round] || 0) >= num ? <span key={num}>❌</span> : null
              )}
            </div>
          )}
        </div>

        {/* PAPAN JAWABAN REGULAR */}
        <div className="board-wrapper flex flex-col items-center gap-5">
          <div className="min-w-[400px]">
            <ul className="answers list-none p-0 m-0">
              {displayAnswers.map((answer, index) => (
                <li key={index} className="answer-wrap bg-white p-0.5 rounded-[15px] my-1 shadow-md">
                  <div className="answer-row grid grid-cols-[40px_1fr_70px] gap-px">
                    <div className="number bg-[#024694] text-white px-2 py-2 font-bold text-lg text-center rounded-[15px]">
                      {index + 1}
                    </div>
                    <div className={`text bg-[#024694] text-white px-2 py-2 font-bold text-lg text-center rounded-[15px] transition-all duration-500 ${
                      answer.revealed ? 'bg-yellow-400 text-blue-900' : ''
                    }`}>
                      {answer.revealed ? answer.text : '__________'}
                    </div>
                    <div className={`points bg-[#024694] text-white px-2 py-2 font-bold text-lg text-center rounded-[15px] transition-all duration-500 ${
                      answer.revealed ? 'bg-yellow-400 text-blue-900' : ''
                    }`}>
                      {answer.revealed ? answer.points : '__'}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* TOTAL SCORE DI LUAR BOARD */}
          <div className="total-box flex justify-between items-center rounded-full p-1 text-lg font-bold w-full max-w-[200px] ml-auto mr-5 shadow-lg bg-orange-500 text-white" style={{ marginTop: '-10px' }}>
            <div className="total-label text-2xl font-bold ml-3">TOTAL</div>
            <div className="total-score px-2 py-1 rounded-[20px] text-2xl font-bold bg-white text-orange-500">
              {gameState.totalScore}
            </div>
          </div>
        </div>

        {/* TIM KANAN */}
        <div className="team-wrapper flex flex-col items-center gap-2.5" style={{marginTop: '50px'}}>
          <div className="team-name inline-block font-semibold text-2xl px-4 py-1 rounded-[20px] mb-1 font-poppins shadow-lg bg-white text-gray-800">
            {gameState.teamRight.name}
          </div>

          <div className="team-box bg-[#ff6c00] border-4 border-[#ffd500] rounded-[30px] w-[100px] h-[80px] flex items-center justify-center shadow-lg">
            <div className="team-score text-[32px] font-bold text-white">
              {gameState.teamRight.score}
            </div>
          </div>

          {(gameState.teamRight.strikes[gameState.round] || 0) > 0 && (
            <div className="strikes mt-2.5 flex flex-col gap-2 text-4xl text-red-500">
              {[1, 2, 3].map((num) =>
                (gameState.teamRight.strikes[gameState.round] || 0) >= num ? <span key={num}>❌</span> : null
              )}
            </div>
          )}
        </div>

      </div>


    </div>
  );
};
