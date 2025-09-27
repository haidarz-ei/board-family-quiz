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
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Video */}
      <video 
        autoPlay 
        muted 
        loop 
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/video/family100-bg.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay untuk memastikan konten terlihat */}
      <div className="absolute inset-0 bg-black/30 z-10"></div>

      {/* Game Container */}
      <div className="relative z-20 flex items-center justify-between h-screen p-8">
        
        {/* TIM KIRI */}
        <div className="flex flex-col items-center space-y-6">
          <div className="bg-gradient-gold px-8 py-4 rounded-2xl shadow-gold">
            <div className="text-3xl font-bold text-primary-foreground text-center">
              {gameState.teamLeft.name}
            </div>
          </div>
          
          <div className="bg-gradient-card p-6 rounded-2xl shadow-card">
            <div className="text-6xl font-bold text-primary text-center">
              {gameState.teamLeft.score}
            </div>
          </div>

          <div className="flex space-x-2">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                  gameState.teamLeft.strikes >= num ? 'bg-game-red animate-strike' : 'bg-secondary/50'
                }`}
              >
                ❌
              </div>
            ))}
          </div>
        </div>

        {/* PAPAN JAWABAN */}
        <div className="flex flex-col items-center space-y-6">
          {/* Question */}
          <div className="bg-gradient-card p-6 rounded-2xl shadow-card max-w-4xl">
            <h2 className="text-3xl font-bold text-primary text-center">
              {gameState.question}
            </h2>
          </div>

          {/* Answer Board */}
          <div className="bg-gradient-card p-8 rounded-3xl shadow-card">
            <div className="space-y-3">
              {displayAnswers.map((answer, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between px-8 py-4 rounded-xl transition-all duration-500 ${
                    answer.revealed
                      ? 'bg-gradient-gold text-primary-foreground animate-flip'
                      : 'bg-game-primary text-white'
                  } shadow-lg`}
                  style={{ minWidth: '500px' }}
                >
                  <div className="flex items-center space-x-6">
                    <div className="text-3xl font-bold w-12 text-center">
                      {index + 1}
                    </div>
                    <div className="text-2xl font-bold">
                      {answer.revealed ? answer.text : '________________'}
                    </div>
                  </div>
                  <div className="text-3xl font-bold">
                    {answer.revealed ? answer.points : '___'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Score */}
          <div className="bg-gradient-gold p-6 rounded-2xl shadow-gold">
            <div className="text-center">
              <div className="text-xl font-bold text-primary-foreground mb-2">TOTAL</div>
              <div className="text-4xl font-bold text-primary-foreground">
                {gameState.totalScore}
              </div>
            </div>
          </div>
        </div>

        {/* TIM KANAN */}
        <div className="flex flex-col items-center space-y-6">
          <div className="bg-gradient-gold px-8 py-4 rounded-2xl shadow-gold">
            <div className="text-3xl font-bold text-primary-foreground text-center">
              {gameState.teamRight.name}
            </div>
          </div>
          
          <div className="bg-gradient-card p-6 rounded-2xl shadow-card">
            <div className="text-6xl font-bold text-primary text-center">
              {gameState.teamRight.score}
            </div>
          </div>

          <div className="flex space-x-2">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                  gameState.teamRight.strikes >= num ? 'bg-game-red animate-strike' : 'bg-secondary/50'
                }`}
              >
                ❌
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};