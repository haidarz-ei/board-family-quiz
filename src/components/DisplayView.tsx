import { useState, useEffect } from "react";

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
}

export const DisplayView = () => {
  const [gameState, setGameState] = useState<GameState>({
    question: "Sebutkan makanan yang sering dibawa saat piknik!",
    answers: {
      1: [
        { text: "NASI BUNGKUS", points: 40, revealed: false },
        { text: "SANDWICH", points: 25, revealed: false },
        { text: "MIE INSTAN", points: 15, revealed: false },
        { text: "BUAH-BUAHAN", points: 10, revealed: false },
        { text: "KUE", points: 5, revealed: false },
        { text: "MINUMAN KEMASAN", points: 3, revealed: false },
        { text: "KERUPUK", points: 2, revealed: false },
      ],
      2: [],
      3: [],
      4: [],
      5: []
    },
    teamLeft: { name: "ASE", score: 30, strikes: 1 },
    teamRight: { name: "AIS", score: 230, strikes: 3 },
    totalScore: 120,
    round: 1
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
  const displayAnswers = currentRoundAnswers.slice(0, answerCount);

  return (
    <div>
      <video autoPlay muted loop id="bgVideo" className="fixed top-0 left-0 w-full h-full object-cover z-0">
        <source src={gameState.round === 5 ? "/video/1.mp4" : "/video/2.mp4"} type="video/mp4" />
        Browser Anda tidak mendukung mp4.
      </video>

      <div className="game-container relative z-10 flex items-center justify-between min-h-screen p-8">
        
        {/* TIM KIRI */}
        <div className="team-wrapper flex flex-col items-center space-y-6">
          <div className="team-name bg-gradient-gold px-8 py-4 rounded-2xl shadow-gold text-3xl font-bold text-primary-foreground text-center">
            {gameState.teamLeft.name}
          </div>
          
          <div className="team-box bg-gradient-card p-6 rounded-2xl shadow-card">
            <div className="team-score text-6xl font-bold text-primary text-center">
              {gameState.teamLeft.score}
            </div>
          </div>

          <div className="strikes flex space-x-2">
            {[1, 2, 3].map((num) => (
              <span
                key={num}
                className={`strike w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                  gameState.teamLeft.strikes >= num ? 'bg-game-red animate-strike' : 'bg-secondary/50'
                }`}
              >
                ❌
              </span>
            ))}
          </div>
        </div>

        {/* PAPAN JAWABAN */}
        <div className="board-wrapper flex flex-col items-center space-y-6">
          <div className="board bg-gradient-card p-8 rounded-3xl shadow-card">
            <ul className="answers space-y-3">
              {displayAnswers.map((answer, index) => (
                <li key={index} className="answer-wrap">
                  <div className={`answer-row flex items-center justify-between px-8 py-4 rounded-xl transition-all duration-500 ${
                    answer.revealed
                      ? 'bg-gradient-gold text-primary-foreground animate-flip'
                      : 'bg-game-primary text-white'
                  } shadow-lg`} style={{ minWidth: '500px' }}>
                    <div className="number text-3xl font-bold w-12 text-center">
                      {index + 1}
                    </div>
                    <div className="text text-2xl font-bold flex-1 text-center">
                      {answer.revealed ? answer.text : '__________'}
                    </div>
                    <div className="points text-3xl font-bold w-16 text-center">
                      {answer.revealed ? answer.points : '__'}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* TOTAL SCORE DI LUAR BOARD */}
          <div className="total-box bg-gradient-gold p-6 rounded-2xl shadow-gold">
            <div className="total-label text-xl font-bold text-primary-foreground mb-2 text-center">TOTAL</div>
            <div className="total-score text-4xl font-bold text-primary-foreground text-center">
              {gameState.totalScore}
            </div>
          </div>
        </div>

        {/* TIM KANAN */}
        <div className="team-wrapper flex flex-col items-center space-y-6">
          <div className="team-name bg-gradient-gold px-8 py-4 rounded-2xl shadow-gold text-3xl font-bold text-primary-foreground text-center">
            {gameState.teamRight.name}
          </div>
          
          <div className="team-box bg-gradient-card p-6 rounded-2xl shadow-card">
            <div className="team-score text-6xl font-bold text-primary text-center">
              {gameState.teamRight.score}
            </div>
          </div>

          <div className="strikes flex space-x-2">
            {[1, 2, 3].map((num) => (
              <span
                key={num}
                className={`strike w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                  gameState.teamRight.strikes >= num ? 'bg-game-red animate-strike' : 'bg-secondary/50'
                }`}
              >
                ❌
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};