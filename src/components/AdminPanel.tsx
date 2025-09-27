import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

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
  answers: Answer[];
  teamLeft: Team;
  teamRight: Team;
  totalScore: number;
  round: number;
}

export const AdminPanel = () => {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>({
    question: "Sebutkan makanan yang sering dibawa saat piknik!",
    answers: [
      { text: "NASI BUNGKUS", points: 40, revealed: false },
      { text: "SANDWICH", points: 25, revealed: false },
      { text: "MIE INSTAN", points: 15, revealed: false },
      { text: "BUAH-BUAHAN", points: 10, revealed: false },
      { text: "KUE", points: 5, revealed: false },
      { text: "MINUMAN KEMASAN", points: 3, revealed: false },
      { text: "KERUPUK", points: 2, revealed: false },
    ],
    teamLeft: { name: "ASE", score: 30, strikes: 1 },
    teamRight: { name: "AIS", score: 230, strikes: 3 },
    totalScore: 120,
    round: 1
  });

  const [newAnswer, setNewAnswer] = useState({ text: "", points: 0 });

  // Load saved state
  useEffect(() => {
    const saved = localStorage.getItem('family100-game-state');
    if (saved) {
      setGameState(JSON.parse(saved));
    }
  }, []);

  // Save state to localStorage
  const saveGameState = (newState: GameState) => {
    setGameState(newState);
    localStorage.setItem('family100-game-state', JSON.stringify(newState));
    // Trigger storage event for other windows
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'family100-game-state',
      newValue: JSON.stringify(newState)
    }));
  };

  const updateQuestion = (question: string) => {
    saveGameState({ ...gameState, question });
  };

  const addAnswer = () => {
    if (newAnswer.text.trim() && newAnswer.points > 0) {
      const updatedAnswers = [...gameState.answers, { ...newAnswer, revealed: false }];
      saveGameState({ ...gameState, answers: updatedAnswers });
      setNewAnswer({ text: "", points: 0 });
      toast({ title: "Jawaban ditambahkan!" });
    }
  };

  const updateAnswer = (index: number, field: keyof Answer, value: string | number | boolean) => {
    const updatedAnswers = [...gameState.answers];
    updatedAnswers[index] = { ...updatedAnswers[index], [field]: value };
    saveGameState({ ...gameState, answers: updatedAnswers });
  };

  const deleteAnswer = (index: number) => {
    const updatedAnswers = gameState.answers.filter((_, i) => i !== index);
    saveGameState({ ...gameState, answers: updatedAnswers });
    toast({ title: "Jawaban dihapus!" });
  };

  const revealAnswer = (index: number) => {
    updateAnswer(index, 'revealed', true);
    toast({ title: `Jawaban ${index + 1} diungkap!` });
  };

  const hideAnswer = (index: number) => {
    updateAnswer(index, 'revealed', false);
  };

  const updateTeam = (side: 'left' | 'right', field: keyof Team, value: string | number) => {
    const teamKey = side === 'left' ? 'teamLeft' : 'teamRight';
    const updatedTeam = { ...gameState[teamKey], [field]: value };
    saveGameState({ ...gameState, [teamKey]: updatedTeam });
  };

  const updateTotalScore = () => {
    const total = gameState.answers
      .filter(answer => answer.revealed)
      .reduce((sum, answer) => sum + answer.points, 0);
    saveGameState({ ...gameState, totalScore: total });
  };

  const resetGame = () => {
    const resetState: GameState = {
      question: "",
      answers: [],
      teamLeft: { name: "TIM A", score: 0, strikes: 0 },
      teamRight: { name: "TIM B", score: 0, strikes: 0 },
      totalScore: 0,
      round: 1
    };
    saveGameState(resetState);
    toast({ title: "Game direset!" });
  };

  const answerCount = 8 - gameState.round;
  const displayAnswers = gameState.answers.slice(0, answerCount);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-foreground">Admin Panel Family 100</h1>
          <div className="space-x-4">
            <Button onClick={() => window.open('/display', '_blank')} variant="outline">
              Buka Display
            </Button>
            <Button onClick={resetGame} variant="destructive">
              Reset Game
            </Button>
          </div>
        </div>

        <Tabs defaultValue="game" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="game">Game Control</TabsTrigger>
            <TabsTrigger value="answers">Kelola Jawaban</TabsTrigger>
            <TabsTrigger value="teams">Tim & Skor</TabsTrigger>
          </TabsList>

          {/* Game Control Tab */}
          <TabsContent value="game" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kontrol Game</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="question">Pertanyaan</Label>
                  <Input
                    id="question"
                    value={gameState.question}
                    onChange={(e) => updateQuestion(e.target.value)}
                    placeholder="Masukkan pertanyaan..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="round">Babak</Label>
                    <Input
                      id="round"
                      type="number"
                      value={gameState.round}
                      onChange={(e) => saveGameState({ ...gameState, round: parseInt(e.target.value) || 1 })}
                      min="1"
                      max="7"
                    />
                  </div>
                  <div>
                    <Label>Total Skor Saat Ini</Label>
                    <div className="flex gap-2">
                      <Input value={gameState.totalScore} readOnly />
                      <Button onClick={updateTotalScore} variant="outline">
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Answer Reveal */}
            <Card>
              <CardHeader>
                <CardTitle>Jawaban ({displayAnswers.length} dari {answerCount})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayAnswers.map((answer, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        answer.revealed ? 'bg-game-gold/20 border-game-gold' : 'bg-muted border-border'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-bold">{index + 1}.</span>
                        <span className={answer.revealed ? 'font-bold' : ''}>
                          {answer.text} ({answer.points})
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => answer.revealed ? hideAnswer(index) : revealAnswer(index)}
                        variant={answer.revealed ? "destructive" : "default"}
                      >
                        {answer.revealed ? 'Sembunyikan' : 'Ungkap'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Answers Management Tab */}
          <TabsContent value="answers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tambah Jawaban Baru</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="newAnswerText">Jawaban</Label>
                    <Input
                      id="newAnswerText"
                      value={newAnswer.text}
                      onChange={(e) => setNewAnswer({ ...newAnswer, text: e.target.value })}
                      placeholder="Masukkan jawaban..."
                    />
                  </div>
                  <div className="w-32">
                    <Label htmlFor="newAnswerPoints">Poin</Label>
                    <Input
                      id="newAnswerPoints"
                      type="number"
                      value={newAnswer.points}
                      onChange={(e) => setNewAnswer({ ...newAnswer, points: parseInt(e.target.value) || 0 })}
                      placeholder="Poin"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addAnswer}>Tambah</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daftar Jawaban</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gameState.answers.map((answer, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <span className="font-bold w-8">{index + 1}.</span>
                      <Input
                        value={answer.text}
                        onChange={(e) => updateAnswer(index, 'text', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={answer.points}
                        onChange={(e) => updateAnswer(index, 'points', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                      <Button
                        size="sm"
                        onClick={() => updateAnswer(index, 'revealed', !answer.revealed)}
                        variant={answer.revealed ? "destructive" : "default"}
                      >
                        {answer.revealed ? 'Hide' : 'Show'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteAnswer(index)}
                      >
                        Hapus
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tim Kiri */}
              <Card>
                <CardHeader>
                  <CardTitle>Tim Kiri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Nama Tim</Label>
                    <Input
                      value={gameState.teamLeft.name}
                      onChange={(e) => updateTeam('left', 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Skor</Label>
                    <Input
                      type="number"
                      value={gameState.teamLeft.score}
                      onChange={(e) => updateTeam('left', 'score', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Strike (0-3)</Label>
                    <Input
                      type="number"
                      value={gameState.teamLeft.strikes}
                      onChange={(e) => updateTeam('left', 'strikes', Math.min(3, Math.max(0, parseInt(e.target.value) || 0)))}
                      min="0"
                      max="3"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tim Kanan */}
              <Card>
                <CardHeader>
                  <CardTitle>Tim Kanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Nama Tim</Label>
                    <Input
                      value={gameState.teamRight.name}
                      onChange={(e) => updateTeam('right', 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Skor</Label>
                    <Input
                      type="number"
                      value={gameState.teamRight.score}
                      onChange={(e) => updateTeam('right', 'score', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Strike (0-3)</Label>
                    <Input
                      type="number"
                      value={gameState.teamRight.strikes}
                      onChange={(e) => updateTeam('right', 'strikes', Math.min(3, Math.max(0, parseInt(e.target.value) || 0)))}
                      min="0"
                      max="3"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};