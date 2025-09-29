import { useState, useEffect } from "react";
import { BonusDisplayView } from "./BonusDisplayView";

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
  answers: { [round: number]: Answer[] };
  teamLeft: Team;
  teamRight: Team;
  totalScore: number;
  round: number;
  currentPlayingTeam: 'left' | 'right' | null;
}

export const DisplayView = () => {
  const [gameState, setGameState] = useState<GameState>({
    question: "",
    answers: {
      1: [],
      2: [],
      3: [],
      4: [],
      5: []
    },
    teamLeft: { name: "TIM A", score: 0, strikes: 0 },
    teamRight: { name: "TIM B", score: 0, strikes: 0 },
    totalScore: 0,
    round: 1,
    currentPlayingTeam: null
  });

  // Listen for updates from admin panel
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('family100-game-state');
      if (stored) {
        setGameState(JSON.parse(stored));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange(); // Load initial state

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

  const isBonusRound = gameState.round === 5;

  if (isBonusRound) {
    return <BonusDisplayView gameState={gameState} />;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans relative">
      <video autoPlay muted loop id="bgVideo" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-auto z-0">
        <source src="/video/2.mp4" type="video/mp4" />
        Browser Anda tidak mendukung mp4.
      </video>

      <div className="game-container relative z-10 flex items-start justify-center p-10 gap-32 flex-nowrap text-white">

        {/* TIM KIRI */}
        <div className="team-wrapper flex flex-col items-center gap-2.5" style={{marginTop: '150px'}}>
          <div className="team-name inline-block font-semibold text-3xl px-7.5 py-1.5 rounded-[30px] mb-1 font-poppins shadow-lg bg-white text-gray-800">
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

        {/* PAPAN JAWABAN REGULAR */}
        <div className="board-wrapper flex flex-col items-center gap-5">
          <div className="n min-w-[600px]">
            <ul className="answers list-none p-0 m-0">
              {displayAnswers.map((answer, index) => (
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

          {/* TOTAL SCORE DI LUAR BOARD */}
          <div className="total-box flex justify-between items-center rounded-full p-1.5 text-xl font-bold w-full max-w-[250px] ml-auto mr-5 shadow-lg bg-orange-500 text-white">
            <div className="total-label text-3xl font-bold ml-5">TOTAL</div>
            <div className="total-score px-3.75 py-1.25 rounded-[30px] text-3xl font-bold bg-white text-orange-500">
              {gameState.totalScore}
            </div>
          </div>
        </div>

        {/* TIM KANAN */}
        <div className="team-wrapper flex flex-col items-center gap-2.5" style={{marginTop: '150px'}}>
          <div className="team-name inline-block font-semibold text-3xl px-7.5 py-1.5 rounded-[30px] mb-1 font-poppins shadow-lg bg-white text-gray-800">
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

      </div>
    </div>
  );
};
