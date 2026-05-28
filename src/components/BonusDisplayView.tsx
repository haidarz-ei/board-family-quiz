import { useEffect, useRef, useState, useMemo } from "react";
import { useRevealSound } from "../hooks/useRevealSound";
import { GameState, Answer } from "../types/game";
import { FitScreenWrapper } from "./FitScreenWrapper";

export const BonusDisplayView = ({ gameState }: { gameState: GameState }) => {
  const { playRevealSound, playWrongAnswerSound, stopRevealSound } = useRevealSound();

  // Make stopRevealSound available globally for admin panel
  if (typeof window !== 'undefined') {
    window.stopRevealSound = stopRevealSound;
  }

  const prevRevealedRef = useRef<string[]>([]);
  const prevStrikesRef = useRef<{ left: { [round: number]: number }, right: { [round: number]: number } }>({ left: {}, right: {} });
  const [audioEnabled, setAudioEnabled] = useState(true);

  const currentRoundAnswers = useMemo(() => gameState.answers[gameState.round] || [], [gameState.answers, gameState.round]);

  // For each of the 5 questions, find the answer revealed for 'first' and 'second'
  const getRevealedForPlayer = (player: 'first' | 'second') => {
    const results: (Answer | null)[] = [];
    for (let q = 0; q < 5; q++) {
      const startIdx = q * 5;
      const endIdx = startIdx + 5;
      let found: Answer | null = null;
      for (let i = startIdx; i < endIdx; i++) {
        const a = currentRoundAnswers[i];
        if (a && a.revealedPlayer === player) {
          found = a;
          break;
        }
      }
      results.push(found);
    }
    return results;
  };

  const firstPlayerAnswers = getRevealedForPlayer('first');
  const secondPlayerAnswers = getRevealedForPlayer('second');

  // Check for newly revealed answers and strikes
  useEffect(() => {
    if (!audioEnabled) return;

    const validAnswers = currentRoundAnswers.filter((answer: Answer | null): answer is Answer => answer !== null);
    const currentRevealed = validAnswers
      .filter((answer: Answer) => answer.revealed)
      .map((answer: Answer) => `${gameState.round}-${answer.text}-${answer.revealedPlayer}`);

    const newRevealed = currentRevealed.filter(
      (id: string) => !prevRevealedRef.current.includes(id)
    );

    const newlyHidden = prevRevealedRef.current.filter(
      (id: string) => !currentRevealed.includes(id)
    );

    if (newlyHidden.length > 0) {
      stopRevealSound();
    }

    for (const revealedId of newRevealed) {
      const answer = validAnswers.find((a: Answer) =>
        a.revealed && `${gameState.round}-${a.text}-${a.revealedPlayer}` === revealedId
      );
      if (answer) {
        playRevealSound(answer.points, validAnswers);
      }
    }

    const currentLeftStrikes = gameState.teamLeft.strikes[gameState.round] || 0;
    const currentRightStrikes = gameState.teamRight.strikes[gameState.round] || 0;
    const prevLeftStrikes = prevStrikesRef.current.left[gameState.round] || 0;
    const prevRightStrikes = prevStrikesRef.current.right[gameState.round] || 0;

    if (currentLeftStrikes > prevLeftStrikes || currentRightStrikes > prevRightStrikes) {
      playWrongAnswerSound();
    }

    prevRevealedRef.current = currentRevealed;
    prevStrikesRef.current = {
      left: { ...gameState.teamLeft.strikes },
      right: { ...gameState.teamRight.strikes }
    };
  }, [gameState.answers, gameState.round, gameState.teamLeft.strikes, gameState.teamRight.strikes, currentRoundAnswers, playRevealSound, playWrongAnswerSound, audioEnabled, stopRevealSound]);

  return (
    <div className="bg-black text-white overflow-hidden font-sans relative" style={{ width: '100%', height: '100%' }}>
      <video autoPlay muted loop id="bgVideo" className="absolute top-0 left-0 z-0" style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
        <source src="/video/1.mp4" type="video/mp4" />
        Browser Anda tidak mendukung mp4.
      </video>

      <FitScreenWrapper width={875} height={650}>
        <div className="w-full text-center py-4 relative z-20">
          {gameState.showQuestion[gameState.round] && (
            <h1 className="text-3xl font-bold text-white">{gameState.questions[gameState.round]}</h1>
          )}
        </div>

        <div className="game-container relative z-10 flex items-start justify-center p-10 gap-32 flex-nowrap text-gray-800">
          {gameState.round !== 5 && (
            <div className="team-wrapper flex flex-col items-center gap-2.5" style={{ marginTop: '20px' }}>
              <div className="team-name inline-block font-semibold text-3xl px-7.5 py-1.5 rounded-[30px] mb-1 font-poppins shadow-lg bg-yellow-200 border-2 border-yellow-300 text-gray-800">
                {gameState.teamLeft.name}
              </div>

              <div className="team-box bg-[#ff6c00] border-4 border-[#ffd500] rounded-[30px] w-[140px] h-[110px] flex items-center justify-center shadow-lg">
                <div className="team-score text-[42px] font-bold text-white">
                  {gameState.teamLeft.score}
                </div>
              </div>

              {(gameState.teamLeft.strikes[gameState.round] || 0) > 0 && (
                <div className="strikes mt-2.5 flex flex-col gap-2 text-5xl text-red-500">
                  {[1, 2, 3].map((num) =>
                    (gameState.teamLeft.strikes[gameState.round] || 0) >= num ? <span key={num}>❌</span> : null
                  )}
                </div>
              )}
            </div>
          )}

          {/* PAPAN JAWABAN BONUS */}
          <div className="board-wrapper flex flex-col items-center gap-5" style={{ marginTop: '20px' }}>
            <div className="board p-4 min-w-[800px] relative">
              <div className="flex justify-between items-start gap-8 w-full relative">
                {/* Left Column - Orang Pertama */}
                <div className="flex-1 space-y-2">
                  <h3 className="text-center font-bold text-lg mb-2 text-yellow-800">Orang pertama</h3>
                  <ul className="answers list-none p-0 m-0">
                    {firstPlayerAnswers.map((answer, index) => {
                      const displayAnswer = answer || { text: '', points: 0, revealed: false };
                      const isRevealed = answer !== null;
                      return (
                        <li key={index} className="answer-wrap bg-white p-0.5 rounded-[20px] my-2 shadow-md">
                          <div className="answer-row grid grid-cols-[49px_1fr_90px] gap-px">
                            <div className="number bg-[#024694] text-white px-3 py-2.5 font-bold text-xl text-center rounded-[20px]">
                              {index + 1}
                            </div>
                            <div className={`text bg-[#024694] text-white px-3 py-2.5 font-bold text-xl text-center rounded-[20px] transition-all duration-500 ${isRevealed ? 'bg-yellow-400 text-blue-900' : ''}`}>
                              {isRevealed ? displayAnswer.text : '__________'}
                            </div>
                            <div className={`points bg-[#024694] text-white px-3 py-2.5 font-bold text-xl text-center rounded-[20px] transition-all duration-500 ${isRevealed ? 'bg-yellow-400 text-blue-900' : ''}`}>
                              {isRevealed ? displayAnswer.points : '__'}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Right Column - Orang Kedua */}
                <div className="flex-1 space-y-2">
                  <h3 className="text-center font-bold text-lg mb-2 text-yellow-800">Orang kedua</h3>
                  <ul className="answers list-none p-0 m-0">
                    {secondPlayerAnswers.map((answer, index) => {
                      const displayAnswer = answer || { text: '', points: 0, revealed: false };
                      const isRevealed = answer !== null;
                      return (
                        <li key={index} className="answer-wrap bg-white p-0.5 rounded-[20px] my-2 shadow-md">
                          <div className="answer-row grid grid-cols-[49px_1fr_90px] gap-px">
                            <div className="number bg-[#024694] text-white px-3 py-2.5 font-bold text-xl text-center rounded-[20px]">
                              {index + 1}
                            </div>
                            <div className={`text bg-[#024694] text-white px-3 py-2.5 font-bold text-xl text-center rounded-[20px] transition-all duration-500 ${isRevealed ? 'bg-yellow-400 text-blue-900' : ''}`}>
                              {isRevealed ? displayAnswer.text : '__________'}
                            </div>
                            <div className={`points bg-[#024694] text-white px-3 py-2.5 font-bold text-xl text-center rounded-[20px] transition-all duration-500 ${isRevealed ? 'bg-yellow-400 text-blue-900' : ''}`}>
                              {isRevealed ? displayAnswer.points : '__'}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>

            {/* TOTAL SCORE DI LUAR BOARD */}
            <div className="total-box flex justify-between items-center rounded-full p-1 text-lg font-bold w-full max-w-[200px] ml-auto mr-5 shadow-lg bg-orange-500 text-white" style={{ marginTop: '-10px' }}>
              <div className="total-label text-2xl font-bold ml-3">TOTAL</div>
              <div className="total-score px-2 py-1 rounded-[20px] text-2xl font-bold bg-white text-orange-500">
                {gameState.totalScore}
              </div>
            </div>
          </div>

          {gameState.round !== 5 && (
            <div className="team-wrapper flex flex-col items-center gap-2.5" style={{ marginTop: '20px' }}>
              <div className="team-name inline-block font-semibold text-3xl px-7.5 py-1.5 rounded-[30px] mb-1 font-poppins shadow-lg bg-yellow-200 border-2 border-yellow-300 text-gray-800">
                {gameState.teamRight.name}
              </div>

              <div className="team-box bg-[#ff6c00] border-4 border-[#ffd500] rounded-[30px] w-[140px] h-[110px] flex items-center justify-center shadow-lg">
                <div className="team-score text-[42px] font-bold text-white">
                  {gameState.teamRight.score}
                </div>
              </div>

              {(gameState.teamRight.strikes[gameState.round] || 0) > 0 && (
                <div className="strikes mt-2.5 flex flex-col gap-2 text-5xl text-red-500">
                  {[1, 2, 3].map((num) =>
                    (gameState.teamRight.strikes[gameState.round] || 0) >= num ? <span key={num}>❌</span> : null
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </FitScreenWrapper>
    </div>
  );
};
