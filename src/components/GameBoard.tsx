import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Answer {
  text: string;
  points: number;
  revealed: boolean;
}

interface Question {
  question: string;
  answers: Answer[];
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    question: "Sebutkan makanan yang sering dibawa saat piknik!",
    answers: [
      { text: "Nasi Bungkus", points: 40, revealed: false },
      { text: "Sandwich", points: 25, revealed: false },
      { text: "Mie Instan", points: 15, revealed: false },
      { text: "Buah-buahan", points: 10, revealed: false },
      { text: "Kue", points: 5, revealed: false },
      { text: "Minuman Kemasan", points: 3, revealed: false },
      { text: "Kerupuk", points: 2, revealed: false },
    ]
  },
  {
    question: "Hal yang dilakukan orang saat menunggu di bandara!",
    answers: [
      { text: "Main HP", points: 35, revealed: false },
      { text: "Makan", points: 20, revealed: false },
      { text: "Tidur", points: 18, revealed: false },
      { text: "Baca Buku", points: 12, revealed: false },
      { text: "Jalan-jalan", points: 8, revealed: false },
      { text: "Foto-foto", points: 4, revealed: false },
      { text: "Belanja", points: 3, revealed: false },
    ]
  }
];

export const GameBoard = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [question, setQuestion] = useState<Question>(SAMPLE_QUESTIONS[0]);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && isPlaying) {
      handleStrike();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isPlaying]);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setStrikes(0);
    setTimeLeft(30);
    setGameOver(false);
    setCurrentQuestion(0);
    setQuestion({
      ...SAMPLE_QUESTIONS[0],
      answers: SAMPLE_QUESTIONS[0].answers.map(a => ({ ...a, revealed: false }))
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < SAMPLE_QUESTIONS.length - 1) {
      const nextQ = currentQuestion + 1;
      setCurrentQuestion(nextQ);
      setQuestion({
        ...SAMPLE_QUESTIONS[nextQ],
        answers: SAMPLE_QUESTIONS[nextQ].answers.map(a => ({ ...a, revealed: false }))
      });
      setTimeLeft(30);
      setUserAnswer("");
    } else {
      endGame();
    }
  };

  const handleStrike = () => {
    setStrikes(prev => {
      const newStrikes = prev + 1;
      if (newStrikes >= 3) {
        endGame();
      }
      return newStrikes;
    });
    setTimeLeft(30);
    toast({
      title: "SALAH!",
      description: `Strike ${strikes + 1}/3`,
      variant: "destructive",
    });
  };

  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    toast({
      title: "Game Selesai!",
      description: `Skor akhir: ${score} poin`,
    });
  };

  const checkAnswer = () => {
    const normalizedAnswer = userAnswer.toLowerCase().trim();
    const foundAnswer = question.answers.find(
      answer => answer.text.toLowerCase().includes(normalizedAnswer) && !answer.revealed
    );

    if (foundAnswer && normalizedAnswer.length > 2) {
      const newAnswers = question.answers.map(answer =>
        answer === foundAnswer ? { ...answer, revealed: true } : answer
      );
      setQuestion({ ...question, answers: newAnswers });
      setScore(prev => prev + foundAnswer.points);
      setUserAnswer("");
      setTimeLeft(30);
      
      toast({
        title: "BENAR!",
        description: `+${foundAnswer.points} poin`,
      });

      // Check if all answers revealed
      if (newAnswers.every(a => a.revealed)) {
        setTimeout(nextQuestion, 2000);
      }
    } else {
      handleStrike();
      setUserAnswer("");
    }
  };

  const revealAnswer = (index: number) => {
    const newAnswers = [...question.answers];
    newAnswers[index].revealed = true;
    setQuestion({ ...question, answers: newAnswers });
  };

  return (
    <div className="min-h-screen bg-gradient-game p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-primary mb-4 drop-shadow-lg">
            FAMILY 100
          </h1>
          <div className="flex justify-center gap-8 text-2xl font-bold text-foreground">
            <div className="bg-gradient-gold px-6 py-3 rounded-xl shadow-gold">
              SKOR: {score}
            </div>
            <div className="bg-secondary px-6 py-3 rounded-xl">
              WAKTU: {timeLeft}s
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    strikes >= num ? 'bg-game-red animate-strike' : 'bg-secondary'
                  }`}
                >
                  X
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Question */}
        {isPlaying && (
          <div className="text-center mb-8">
            <div className="bg-gradient-card p-6 rounded-2xl shadow-card mb-6">
              <h2 className="text-3xl font-bold text-primary mb-4">
                {question.question}
              </h2>
              <div className="flex gap-4 max-w-md mx-auto">
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Masukkan jawaban..."
                  className="text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                />
                <Button
                  onClick={checkAnswer}
                  className="bg-gradient-gold hover:bg-game-gold-dark text-primary-foreground font-bold px-8"
                  disabled={!userAnswer.trim()}
                >
                  JAWAB
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Answer Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {question.answers.map((answer, index) => (
            <div
              key={index}
              className={`relative h-20 rounded-xl shadow-lg cursor-pointer transition-all duration-300 ${
                answer.revealed
                  ? 'bg-gradient-gold animate-flip'
                  : 'bg-game-primary hover:bg-game-primary-dark'
              }`}
              onClick={() => !isPlaying && revealAnswer(index)}
            >
              <div className="absolute inset-0 flex items-center justify-between px-6 text-white font-bold">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{index + 1}</span>
                  <span className="text-xl">
                    {answer.revealed ? answer.text.toUpperCase() : '???'}
                  </span>
                </div>
                <span className="text-2xl">
                  {answer.revealed ? answer.points : '??'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="text-center space-y-4">
          {!isPlaying && !gameOver && (
            <Button
              onClick={startGame}
              className="bg-gradient-gold hover:bg-game-gold-dark text-primary-foreground font-bold text-2xl px-12 py-4 rounded-xl animate-glow"
            >
              MULAI BERMAIN
            </Button>
          )}
          
          {gameOver && (
            <div className="space-y-4">
              <div className="bg-gradient-card p-6 rounded-2xl shadow-card">
                <h3 className="text-3xl font-bold text-primary mb-2">Game Over!</h3>
                <p className="text-xl text-foreground">Skor Akhir: {score} poin</p>
              </div>
              <Button
                onClick={startGame}
                className="bg-gradient-gold hover:bg-game-gold-dark text-primary-foreground font-bold text-2xl px-12 py-4 rounded-xl"
              >
                MAIN LAGI
              </Button>
            </div>
          )}

          {!isPlaying && !gameOver && (
            <div className="text-center mt-4">
              <p className="text-foreground text-lg">
                Klik kartu jawaban untuk melihat jawabannya
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};