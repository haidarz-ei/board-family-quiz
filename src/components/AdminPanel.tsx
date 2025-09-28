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
  answers: { [round: number]: Answer[] };
  teamLeft: Team;
  teamRight: Team;
  totalScore: number;
  round: number;
  currentPlayingTeam: 'left' | 'right' | null;
}

export const AdminPanel = () => {
  const { toast } = useToast();
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
      5: [] // Bonus round
    },
    teamLeft: { name: "ASE", score: 30, strikes: 1 },
    teamRight: { name: "AIS", score: 230, strikes: 3 },
    totalScore: 120,
    round: 1,
    currentPlayingTeam: null
  });

  const [selectedRoundForAnswers, setSelectedRoundForAnswers] = useState(1);

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

  const addAnswer = (round: number = selectedRoundForAnswers) => {
    if (newAnswer.text.trim() && newAnswer.points > 0) {
      const updatedAnswers = { ...gameState.answers };
      updatedAnswers[round] = [...(updatedAnswers[round] || []), { ...newAnswer, revealed: false }];
      saveGameState({ ...gameState, answers: updatedAnswers });
      setNewAnswer({ text: "", points: 0 });
      toast({ title: `Jawaban ditambahkan ke babak ${round}!` });
    }
  };

  const updateAnswer = (index: number, field: keyof Answer, value: string | number | boolean, round: number = selectedRoundForAnswers) => {
    const updatedAnswers = { ...gameState.answers };
    updatedAnswers[round] = [...(updatedAnswers[round] || [])];
    updatedAnswers[round][index] = { ...updatedAnswers[round][index], [field]: value };
    saveGameState({ ...gameState, answers: updatedAnswers });
  };

  const deleteAnswer = (index: number, round: number = selectedRoundForAnswers) => {
    const updatedAnswers = { ...gameState.answers };
    updatedAnswers[round] = (updatedAnswers[round] || []).filter((_, i) => i !== index);
    saveGameState({ ...gameState, answers: updatedAnswers });
    toast({ title: `Jawaban dihapus dari babak ${round}!` });
  };

  const revealAnswer = (index: number, round: number = gameState.round) => {
    updateAnswer(index, 'revealed', true, round);
    toast({ title: `Jawaban ${index + 1} diungkap!` });
  };

  const hideAnswer = (index: number, round: number = gameState.round) => {
    updateAnswer(index, 'revealed', false, round);
  };

  const updateTeam = (side: 'left' | 'right', field: keyof Team, value: string | number) => {
    const teamKey = side === 'left' ? 'teamLeft' : 'teamRight';
    const updatedTeam = { ...gameState[teamKey], [field]: value };
    saveGameState({ ...gameState, [teamKey]: updatedTeam });
  };

  const updateTotalScore = () => {
    const currentRoundAnswers = gameState.answers[gameState.round] || [];
    const total = currentRoundAnswers
      .filter(answer => answer.revealed)
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
  
  const currentRoundAnswers = gameState.answers[gameState.round] || [];
  const selectedRoundAnswers = gameState.answers[selectedRoundForAnswers] || [];
  const answerCount = getAnswerCount(gameState.round);
  const displayAnswers = currentRoundAnswers.slice(0, answerCount);

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
    updateTeam(team, 'score', newScore);
    
    // Reset total score and strikes for new round
    saveGameState({ 
      ...gameState, 
      totalScore: 0,
      teamLeft: { ...gameState.teamLeft, strikes: 0 },
      teamRight: { ...gameState.teamRight, strikes: 0 },
      currentPlayingTeam: null
    });
    
    toast({ 
      title: `Poin babak diberikan ke Tim ${team === 'left' ? 'Kiri' : 'Kanan'}!`, 
      description: `+${gameState.totalScore} poin` 
    });
  };

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
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={gameState.round}
                      onChange={(e) => saveGameState({ ...gameState, round: parseInt(e.target.value) || 1 })}
                    >
                      <option value={1}>Babak 1 (7 jawaban)</option>
                      <option value={2}>Babak 2 (6 jawaban)</option>
                      <option value={3}>Babak 3 (5 jawaban)</option>
                      <option value={4}>Babak 4 (4 jawaban)</option>
                      <option value={5}>Babak Bonus (10 jawaban)</option>
                    </select>
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

            {/* Game Control Features */}
            <Card>
              <CardHeader>
                <CardTitle>Kontrol Permainan Family 100</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tim Yang Sedang Bermain</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={gameState.currentPlayingTeam === 'left' ? 'default' : 'outline'}
                      onClick={() => setPlayingTeam('left')}
                    >
                      Tim Kiri ({gameState.teamLeft.name})
                    </Button>
                    <Button
                      variant={gameState.currentPlayingTeam === 'right' ? 'default' : 'outline'}
                      onClick={() => setPlayingTeam('right')}
                    >
                      Tim Kanan ({gameState.teamRight.name})
                    </Button>
                    <Button
                      variant={gameState.currentPlayingTeam === null ? 'default' : 'outline'}
                      onClick={() => setPlayingTeam(null)}
                    >
                      Tidak Ada
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Kontrol Tim Kiri - Strike: {gameState.teamLeft.strikes}/3</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="destructive"
                        onClick={() => addStrike('left')}
                        disabled={gameState.teamLeft.strikes >= 3}
                      >
                        Tambah Strike
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => resetStrikes('left')}
                      >
                        Reset Strike
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Kontrol Tim Kanan - Strike: {gameState.teamRight.strikes}/3</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="destructive"
                        onClick={() => addStrike('right')}
                        disabled={gameState.teamRight.strikes >= 3}
                      >
                        Tambah Strike
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => resetStrikes('right')}
                      >
                        Reset Strike
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Berikan Poin Babak (Total: {gameState.totalScore})</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="default"
                      onClick={() => giveRoundPointsToTeam('left')}
                      disabled={gameState.totalScore === 0}
                    >
                      Berikan ke Tim Kiri
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => giveRoundPointsToTeam('right')}
                      disabled={gameState.totalScore === 0}
                    >
                      Berikan ke Tim Kanan
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Memberikan poin akan mereset total skor dan strike kedua tim untuk babak baru
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Answer Reveal */}
            <Card>
              <CardHeader>
                <CardTitle>{getRoundName(gameState.round)} - Jawaban ({displayAnswers.length} dari {answerCount})</CardTitle>
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
                        onClick={() => answer.revealed ? hideAnswer(index, gameState.round) : revealAnswer(index, gameState.round)}
                        variant={answer.revealed ? "destructive" : "default"}
                      >
                        {answer.revealed ? 'Sembunyikan' : 'Ungkap'}
                      </Button>
                    </div>
                  ))}
                </div>
                {gameState.round === 5 && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Babak Bonus:</strong> 5 jawaban pertama untuk orang pertama, 5 jawaban terakhir untuk orang kedua
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Answers Management Tab */}
          <TabsContent value="answers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pilih Babak untuk Kelola Jawaban</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((round) => (
                    <Button
                      key={round}
                      variant={selectedRoundForAnswers === round ? "default" : "outline"}
                      onClick={() => setSelectedRoundForAnswers(round)}
                      className="w-full"
                    >
                      {getRoundName(round)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tambah Jawaban Baru - {getRoundName(selectedRoundForAnswers)}</CardTitle>
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
                    <Button onClick={() => addAnswer(selectedRoundForAnswers)}>Tambah</Button>
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Max jawaban: {getAnswerCount(selectedRoundForAnswers)} | 
                  Jawaban saat ini: {selectedRoundAnswers.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daftar Jawaban - {getRoundName(selectedRoundForAnswers)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedRoundAnswers.map((answer, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <span className="font-bold w-8">{index + 1}.</span>
                      <Input
                        value={answer.text}
                        onChange={(e) => updateAnswer(index, 'text', e.target.value, selectedRoundForAnswers)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={answer.points}
                        onChange={(e) => updateAnswer(index, 'points', parseInt(e.target.value) || 0, selectedRoundForAnswers)}
                        className="w-20"
                      />
                      <Button
                        size="sm"
                        onClick={() => updateAnswer(index, 'revealed', !answer.revealed, selectedRoundForAnswers)}
                        variant={answer.revealed ? "destructive" : "default"}
                      >
                        {answer.revealed ? 'Hide' : 'Show'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteAnswer(index, selectedRoundForAnswers)}
                      >
                        Hapus
                      </Button>
                    </div>
                  ))}
                  {selectedRoundAnswers.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Belum ada jawaban untuk {getRoundName(selectedRoundForAnswers)}
                    </p>
                  )}
                </div>
                {selectedRoundForAnswers === 5 && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Babak Bonus:</strong> Jawaban 1-5 untuk orang pertama, jawaban 6-10 untuk orang kedua
                    </p>
                  </div>
                )}
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