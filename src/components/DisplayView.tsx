import { useState, useEffect, useRef } from "react";
import { BonusDisplayView } from "./BonusDisplayView";
import { useRevealSound } from "../hooks/useRevealSound";
import { useAudioSettings } from "../hooks/useAudioSettings";
import { localStorageKey } from "../lib/roomContext";
import { subscribeGameState, subscribeAudioCommand } from "../lib/realtimeSync";
import { useAppSettings } from "../contexts/SettingsContext";
import { FitScreenWrapper } from "./FitScreenWrapper";

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
  showQuestion: { [round: number]: boolean };
  volumes?: {
    sfx: number;
    freeMusic: number;
    freeVideo: number;
  };
}

export const DisplayView = () => {
  const [gameState, setGameState] = useState<GameState>({
    questions: { 1: "", 2: "", 3: "", 4: "", 5: "" },
    answers: { 1: [], 2: [], 3: [], 4: [], 5: [] },
    teamLeft: { name: "TIM A", score: 0, strikes: {} },
    teamRight: { name: "TIM B", score: 0, strikes: {} },
    totalScore: 0,
    round: 1,
    showQuestion: { 1: false, 2: false, 3: false, 4: false, 5: false },
    volumes: { sfx: 0.7, freeMusic: 0.5, freeVideo: 0.8 }
  });

  const { playRevealSound, playWrongAnswerSound, playAddStrikeSound, stopRevealSound, stopWrongAnswerSound } = useRevealSound(gameState.volumes?.sfx ?? 0.7);
  const { getAudioUrl } = useAudioSettings();
  const { t } = useAppSettings();

  // Make stopRevealSound available globally for admin panel
  if (typeof window !== 'undefined') {
    window.stopRevealSound = stopRevealSound;
  }
  const prevRevealedRef = useRef<string[]>([]);
  const prevStrikesRef = useRef<{ left: { [round: number]: number }, right: { [round: number]: number } }>({
    left: {},
    right: {}
  });
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioCommandRef = useRef<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Store latest volumes in refs to avoid re-subscribing on volume change
  const volumesRef = useRef(gameState.volumes);
  useEffect(() => {
    volumesRef.current = gameState.volumes;
  }, [gameState.volumes]);

  // Listen for audio commands via Supabase Realtime
  useEffect(() => {
    const unsubscribeAudio = subscribeAudioCommand((command) => {
      if (command && command.audioType && audioEnabled) {
        // Handle free music stop command
        if (command.audioType === 'free_music_stop') {
          if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
          }
          return;
        }

        // Handle free music play command
        if (command.audioType.startsWith('free_music_play_')) {
          const url = command.audioType.replace('free_music_play_', '');
          if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
          }
          const audio = new Audio(url);
          audio.volume = volumesRef.current?.freeMusic ?? 0.5;
          currentAudioRef.current = audio;
          audio.play().catch(console.error);
          return;
        }

        // Handle video commands
        if (command.audioType.startsWith('video_show_')) {
          const url = command.audioType.replace('video_show_', '');
          setActiveVideoUrl(url);
          setIsVideoPlaying(false);
          return;
        }

        if (command.audioType.startsWith('video_play_')) {
          const url = command.audioType.replace('video_play_', '');
          setActiveVideoUrl(url);
          setIsVideoPlaying(true);
          return;
        }

        if (command.audioType === 'video_stop') {
          setActiveVideoUrl(null);
          setIsVideoPlaying(false);
          return;
        }

        let audioUrl = getAudioUrl(command.audioType);

        // Fallback for round_points if not set
        if (!audioUrl && command.audioType === 'round_points') {
          audioUrl = '/audio/round_points.mp3';
        }

        if (audioUrl) {
          if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
          }

          const audio = new Audio(audioUrl);
          audio.volume = volumesRef.current?.sfx ?? 0.7;
          currentAudioRef.current = audio;
          audio.play().catch(console.error);
        }
      }
    });

    return () => {
      unsubscribeAudio();
    };
  }, [getAudioUrl, audioEnabled]);

  // Stable refs for sound functions so useEffect doesn't re-run
  const playRevealSoundRef = useRef(playRevealSound);
  const playWrongAnswerSoundRef = useRef(playWrongAnswerSound);
  const playAddStrikeSoundRef = useRef(playAddStrikeSound);
  const stopRevealSoundRef = useRef(stopRevealSound);

  useEffect(() => {
    playRevealSoundRef.current = playRevealSound;
    playWrongAnswerSoundRef.current = playWrongAnswerSound;
    playAddStrikeSoundRef.current = playAddStrikeSound;
    stopRevealSoundRef.current = stopRevealSound;
  }, [playRevealSound, playWrongAnswerSound, playAddStrikeSound, stopRevealSound]);

  // Sync video play/pause state when state changes
  useEffect(() => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVideoPlaying, activeVideoUrl]);

  // Sync video volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = gameState.volumes?.freeVideo ?? 0.8;
    }
  }, [gameState.volumes?.freeVideo]);

  // Listen for updates from Supabase Realtime and localStorage
  useEffect(() => {
    let hasReceivedRemoteData = false;
    let isInitialLoad = true;

    const initPrevState = (state: GameState) => {
      // Initialize tracking refs from current state WITHOUT playing sounds
      const currentAnswers = state.answers[state.round] || [];
      const validAnswers = currentAnswers.filter((a: Answer | null): a is Answer => a !== null);
      const currentRevealed = validAnswers
        .filter((a: Answer) => a.revealed)
        .map((a: Answer) => `${state.round}-${a.text}`);
      prevRevealedRef.current = currentRevealed;
      prevStrikesRef.current = {
        left: state.teamLeft.strikes,
        right: state.teamRight.strikes
      };
    };

    const handleStateUpdate = (newState: GameState, silent = false) => {
      console.log(`[DisplayView] handleStateUpdate called. Silent: ${silent}`);
      if (silent) {
        // Initial load: just sync state, no sounds
        initPrevState(newState);
        setGameState(newState);
        return;
      }

      // Check for newly revealed answers
      const currentAnswers = newState.answers[newState.round] || [];
      const validAnswers = currentAnswers.filter((answer: Answer | null): answer is Answer => answer !== null);
      const currentRevealed = validAnswers
        .filter((answer: Answer) => answer.revealed)
        .map((answer: Answer) => `${newState.round}-${answer.text}`);

      const newRevealed = currentRevealed.filter(
        (id: string) => !prevRevealedRef.current.includes(id)
      );

      console.log(`[DisplayView] currentRevealed:`, currentRevealed);
      console.log(`[DisplayView] prevRevealed:`, prevRevealedRef.current);
      console.log(`[DisplayView] newRevealed:`, newRevealed);

      const newlyHidden = prevRevealedRef.current.filter(
        (id: string) => !currentRevealed.includes(id)
      );

      if (newlyHidden.length > 0) {
        console.log(`[DisplayView] newlyHidden > 0, stopping sound`);
        stopRevealSoundRef.current();
      }

      for (const revealedId of newRevealed) {
        const answer = validAnswers.find((a: Answer) =>
          a.revealed && `${newState.round}-${a.text}` === revealedId
        );
        if (answer) {
          console.log(`[DisplayView] Playing sound for answer: ${answer.text} (points: ${answer.points})`);
          playRevealSoundRef.current(answer.points, validAnswers);
        }
      }

      const currentRound = newState.round;
      const leftStrikesIncreased = (newState.teamLeft.strikes[currentRound] || 0) > (prevStrikesRef.current.left[currentRound] || 0);
      const rightStrikesIncreased = (newState.teamRight.strikes[currentRound] || 0) > (prevStrikesRef.current.right[currentRound] || 0);

      if (leftStrikesIncreased || rightStrikesIncreased) {
        console.log(`[DisplayView] Strikes increased, playing add strike sound`);
        playAddStrikeSoundRef.current();
      }

      prevRevealedRef.current = currentRevealed;
      prevStrikesRef.current = {
        left: newState.teamLeft.strikes,
        right: newState.teamRight.strikes
      };
      setGameState(newState);
    };

    // Supabase Realtime broadcast + DB poll listener (primary source)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unsubscribeRealtime = subscribeGameState((newState: any) => {
      if (newState) {
        const silent = isInitialLoad;
        isInitialLoad = false;
        hasReceivedRemoteData = true;
        handleStateUpdate(newState, silent);
      }
    });

    // localStorage listener (only for same-device/same-browser fallback)
    const handleStorageChange = () => {
      if (hasReceivedRemoteData) return;

      const stored = localStorage.getItem(localStorageKey());
      if (stored) {
        try {
          const newState = JSON.parse(stored);
          // localStorage is always initial load (same device fallback)
          handleStateUpdate(newState, true);
        } catch (e) {
          console.error('DisplayView: Failed to parse localStorage', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange();

    return () => {
      unsubscribeRealtime();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);



  // Calculate answer count based on round
  const getAnswerCount = (round: number) => {
    if (round === 5) return 25; // Bonus round
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

  const isBonusRound = gameState.round === 5;

  if (isBonusRound) {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        {/* Video Overlay */}
        {activeVideoUrl && (
          <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              src={activeVideoUrl}
              className="max-w-full max-h-full"
              autoPlay={isVideoPlaying}
              controls={false}
              onEnded={() => {
                setActiveVideoUrl(null);
                setIsVideoPlaying(false);
              }}
            />
          </div>
        )}
        {!audioEnabled && (
          <div
            className="fixed top-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg z-50 font-bold cursor-pointer"
            onClick={enableAudio}
          >
            {t("display.enableAudio")}
          </div>
        )}
        <div onClick={enableAudio} style={{ width: '100%', height: '100%' }}>
          <BonusDisplayView gameState={gameState} />
        </div>
      </div>
    );
  }



  return (
    <div className="bg-gray-900 text-white overflow-hidden font-sans relative" style={{ width: '100%', height: '100%' }} onClick={enableAudio}>

      {/* Video Overlay */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={activeVideoUrl}
            className="max-w-full max-h-full"
            autoPlay={isVideoPlaying}
            controls={false}
            onEnded={() => {
              setActiveVideoUrl(null);
              setIsVideoPlaying(false);
            }}
          />
        </div>
      )}

      {!audioEnabled && (
        <div className="fixed top-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg z-50 font-bold">
          {t("display.enableAudio")}
        </div>
      )}
      <video autoPlay muted loop id="bgVideo" className="absolute top-0 left-0 z-0" style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
        <source src="/video/2.mp4" type="video/mp4" />
        {t("display.noVideoSupport")}
      </video>

      <FitScreenWrapper width={825} height={600}>
        <div className="w-full text-center py-4 relative z-20">
          {gameState.showQuestion[gameState.round] && (
            <h1 className="text-3xl font-bold text-white">{gameState.questions[gameState.round]}</h1>
          )}
        </div>

        <div className="game-container relative z-10 flex items-start justify-center p-4 gap-8 flex-nowrap text-white" style={{ marginTop: '20px' }}>

          {/* TIM KIRI */}
          <div className="team-wrapper flex flex-col items-center gap-2.5" style={{ marginTop: '50px' }}>
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
                      <div className={`text bg-[#024694] text-white px-2 py-2 font-bold text-lg text-center rounded-[15px] transition-all duration-500 ${answer.revealed ? 'bg-yellow-400 text-blue-900' : ''
                        }`}>
                        {answer.revealed ? answer.text : '__________'}
                      </div>
                      <div className={`points bg-[#024694] text-white px-2 py-2 font-bold text-lg text-center rounded-[15px] transition-all duration-500 ${answer.revealed ? 'bg-yellow-400 text-blue-900' : ''
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
              <div className="total-label text-2xl font-bold ml-3">{t("display.total")}</div>
              <div className="total-score px-2 py-1 rounded-[20px] text-2xl font-bold bg-white text-orange-500">
                {gameState.totalScore}
              </div>
            </div>
          </div>

          {/* TIM KANAN */}
          <div className="team-wrapper flex flex-col items-center gap-2.5" style={{ marginTop: '50px' }}>
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
      </FitScreenWrapper>


    </div>
  );
};
