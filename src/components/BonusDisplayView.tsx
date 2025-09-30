import { useEffect, useRef } from "react";
import { useRevealSound } from "../hooks/useRevealSound";

interface Team {
  name: string;
  score: number;
  strikes: number;
}

interface Answer {
  text: string;
  points: number;
  revealed: boolean;
}

interface GameState {
  question: string;
  answers: { [round: number]: (Answer | null)[] };
  teamLeft: Team;
  teamRight: Team;
  totalScore: number;
  round: number;
  currentPlayingTeam: 'left' | 'right' | null;
}

export const BonusDisplayView = ({ gameState }: { gameState: GameState }) => {
  const { playRevealSound, playWrongAnswerSound } = useRevealSound();
  const prevRevealedRef = useRef<string[]>([]);
  const prevStrikesRef = useRef({ left: 0, right: 0 });
  
  const currentRoundAnswers = gameState.answers[gameState.round] || [];
  const answerCount = 10; // Fixed for bonus round
  const displayAnswers = Array.from({ length: answerCount }, (_, index) => {
    const answer = currentRoundAnswers[index];
    return answer || { text: '', points: 0, revealed: false };
  });

  // Check for newly revealed answers and strikes
  useEffect(() => {
    const currentRevealed = currentRoundAnswers
      .filter((answer: Answer) => answer.revealed)
      .map((answer: Answer) => `${gameState.round}-${answer.text}`);
    
    const newRevealed = currentRevealed.filter(
      (id: string) => !prevRevealedRef.current.includes(id)
    );
    
    // Play sound for each newly revealed answer
    for (const revealedId of newRevealed) {
      const answer = currentRoundAnswers.find((a: Answer) => 
        a.revealed && `${gameState.round}-${a.text}` === revealedId
      );
      if (answer) {
        playRevealSound(answer.points, currentRoundAnswers);
      }
    }
    
    // Check for strikes increase and play wrong answer sound
    const leftStrikesIncreased = gameState.teamLeft.strikes > prevStrikesRef.current.left;
    const rightStrikesIncreased = gameState.teamRight.strikes > prevStrikesRef.current.right;
    
    if (leftStrikesIncreased || rightStrikesIncreased) {
      playWrongAnswerSound();
    }
    
    prevRevealedRef.current = currentRevealed;
    prevStrikesRef.current = {
      left: gameState.teamLeft.strikes,
      right: gameState.teamRight.strikes
    };
  }, [gameState.answers, gameState.round, gameState.teamLeft.strikes, gameState.teamRight.strikes, currentRoundAnswers, playRevealSound, playWrongAnswerSound]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans relative">
      <video autoPlay muted loop id="bgVideo" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-auto z-0">
        <source src="/video/1.mp4" type="video/mp4" />
        Browser Anda tidak mendukung mp4.
      </video>

      <div className="game-container relative z-10 flex items-start justify-center p-10 gap-32 flex-nowrap text-gray-800">
        {gameState.round !== 5 && (
          <div className="team-wrapper flex flex-col items-center gap-2.5" style={{marginTop: '150px'}}>
            <div className="team-name inline-block font-semibold text-3xl px-7.5 py-1.5 rounded-[30px] mb-1 font-poppins shadow-lg bg-yellow-200 border-2 border-yellow-300 text-gray-800">
              {gameState.teamLeft.name}
            </div>

            <div className="team-box bg-[#ff6c00] border-4 border-[#ffd500] rounded-[30px] w-[140px] h-[110px] flex items-center justify-center shadow-lg">
              <div className="team-score text-[42px] font-bold text-white">
                {gameState.teamLeft.score}
              </div>
            </div>

            {gameState.teamLeft.strikes > 0 && (
              <div className="strikes mt-2.5 flex flex-col gap-2 text-5xl text-red-500">
                {[1, 2, 3].map((num) =>
                  gameState.teamLeft.strikes >= num ? <span key={num}>❌</span> : null
                )}
              </div>
            )}
          </div>
        )}

        {/* PAPAN JAWABAN BONUS */}
        <div className="board-wrapper flex flex-col items-center gap-5" style={{marginTop: '100px'}}>
          <div className="board p-4 min-w-[800px] relative">
            <div className="flex justify-between items-start gap-8 w-full relative">
              {/* Left Column - Person 1 (Answers 1-5) */}
              <div className="flex-1 space-y-2">
                <h3 className="text-center font-bold text-lg mb-2 text-yellow-800">Orang Pertama</h3>
                <ul className="answers list-none p-0 m-0">
                  {displayAnswers.slice(0, 5).map((answer, index) => (
                    <li key={index} className="answer-wrap bg-white p-0.5 rounded-[20px] my-2 shadow-md">
                      <div className="answer-row grid grid-cols-[49px_1fr_90px] gap-px">
                        <div className="number bg-[#024694] text-white px-3 py-2.5 font-bold text-xl text-center rounded-[20px]">
                          {index + 1}
                        </div>
                        <div className={`text bg-[#024694] text-white px-3 py-2.5 font-bold text-xl text-center rounded-[20px] transition-all duration-500 ${
                          answer.revealed ? 'bg-yellow-400 text-blue-900' : ''
                        }`}>
                          {answer.revealed ? answer.text : '__________'}
                        </div>
                        <div className={`points bg-[#024694] text-white px-3 py-2.5 font-bold text-xl text-center rounded-[20px] transition-all duration-500 ${
                          answer.revealed ? 'bg-yellow-400 text-blue-900' : ''
                        }`}>
                          {answer.revealed ? answer.points : '__'}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Column - Person 2 (Answers 6-10) */}
              <div className="flex-1 space-y-2">
                <h3 className="text-center font-bold text-lg mb-2 text-yellow-800">Orang Kedua</h3>
                <ul className="answers list-none p-0 m-0">
                  {displayAnswers.slice(5, 10).map((answer, index) => (
                    <li key={index + 5} className="answer-wrap bg-white p-0.5 rounded-[20px] my-2 shadow-md">
                      <div className="answer-row grid grid-cols-[49px_1fr_90px] gap-px">
                        <div className="number bg-[#024694] text-white px-3 py-2.5 font-bold text-xl text-center rounded-[20px]">
                          {index + 6}
                        </div>
                        <div className={`text bg-[#024694] text-white px-3 py-2.5 font-bold text-xl text-center rounded-[20px] transition-all duration-500 ${
                          answer.revealed ? 'bg-yellow-400 text-blue-900' : ''
                        }`}>
                          {answer.revealed ? answer.text : '__________'}
                        </div>
                        <div className={`points bg-[#024694] text-white px-3 py-2.5 font-bold text-xl text-center rounded-[20px] transition-all duration-500 ${
                          answer.revealed ? 'bg-yellow-400 text-blue-900' : ''
                        }`}>
                          {answer.revealed ? answer.points : '__'}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* TOTAL SCORE DI LUAR BOARD */}
          <div className="total-box flex justify-between items-center rounded-full p-1.5 text-xl font-bold w-full max-w-[250px] ml-auto mr-5 shadow-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <div className="total-label text-3xl font-bold ml-5">TOTAL</div>
            <div className="total-score px-3.75 py-1.25 rounded-[30px] text-3xl font-bold bg-yellow-200 text-yellow-900 shadow-lg">
              {gameState.totalScore}
            </div>
          </div>
        </div>

        {gameState.round !== 5 && (
          <div className="team-wrapper flex flex-col items-center gap-2.5" style={{marginTop: '150px'}}>
            <div className="team-name inline-block font-semibold text-3xl px-7.5 py-1.5 rounded-[30px] mb-1 font-poppins shadow-lg bg-yellow-200 border-2 border-yellow-300 text-gray-800">
              {gameState.teamRight.name}
            </div>

            <div className="team-box bg-[#ff6c00] border-4 border-[#ffd500] rounded-[30px] w-[140px] h-[110px] flex items-center justify-center shadow-lg">
              <div className="team-score text-[42px] font-bold text-white">
                {gameState.teamRight.score}
              </div>
            </div>

            {gameState.teamRight.strikes > 0 && (
              <div className="strikes mt-2.5 flex flex-col gap-2 text-5xl text-red-500">
                {[1, 2, 3].map((num) =>
                  gameState.teamRight.strikes >= num ? <span key={num}>❌</span> : null
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
