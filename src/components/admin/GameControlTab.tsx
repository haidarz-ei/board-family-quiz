import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameState, Answer } from "@/types/game";

interface GameControlTabProps {
  gameState: GameState;
  updateQuestion: (question: string, round?: number) => void;
  saveGameState: (state: GameState) => void;
  setPlayingTeam: (team: 'left' | 'right' | null) => void;
  addStrike: (team: 'left' | 'right') => void;
  resetStrikes: (team: 'left' | 'right') => void;
  giveRoundPointsToTeam: (team: 'left' | 'right') => void;
  getRoundName: (round: number) => string;
  getAnswerCount: (round: number) => number;
  revealAnswer: (index: number, round?: number) => void;
  hideAnswer: (index: number, round?: number) => void;
  toggleShowQuestion: (round: number) => void;
  toast: (options: { title: string; description?: string }) => void;
}

import { useState } from "react";
export const GameControlTab = ({
  gameState,
  updateQuestion,
  saveGameState,
  setPlayingTeam,
  addStrike,
  resetStrikes,
  giveRoundPointsToTeam,
  getRoundName,
  getAnswerCount,
  revealAnswer,
  hideAnswer,
  toggleShowQuestion,
  toast
}: GameControlTabProps) => {
  const [selectedRound, setSelectedRound] = useState(gameState.round);
  const [selectedBonusQuestion, setSelectedBonusQuestion] = useState(5);



  const currentRoundAnswers = gameState.answers[gameState.round] || [];
  const answerCount = getAnswerCount(gameState.round);
  const filledCurrent = currentRoundAnswers.filter(a => a !== null).length;

  const applyRoundChange = () => {
    console.log("applyRoundChange called with selectedRound:", selectedRound);
    // Update the round in gameState and save
    const newState = { ...gameState, round: selectedRound };
    // Ensure answers array for the new round is initialized if empty
    if (!newState.answers[selectedRound] || newState.answers[selectedRound].length === 0) {
      newState.answers[selectedRound] = [];
    }



    // Calculate total score for the new round
    const currentRoundAnswers = newState.answers[selectedRound] || [];
    const total = currentRoundAnswers
      .filter((answer): answer is Answer => answer !== null && answer.revealed)
      .reduce((sum, answer) => sum + answer.points, 0);

    newState.totalScore = total;
    saveGameState(newState);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Kontrol Game</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Pertanyaan</Label>
            <div className="flex items-center space-x-4">
              {gameState.round === 5 && (
                <select
                  className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedBonusQuestion}
                  onChange={(e) => setSelectedBonusQuestion(parseInt(e.target.value) || 5)}
                >
                  <option value={5}>Pertanyaan 1</option>
                  <option value={6}>Pertanyaan 2</option>
                  <option value={7}>Pertanyaan 3</option>
                  <option value={8}>Pertanyaan 4</option>
                  <option value={9}>Pertanyaan 5</option>
                </select>
              )}
              <Input
                id="question"
                value={gameState.questions[selectedBonusQuestion] || ""}
                onChange={(e) => updateQuestion(e.target.value, selectedBonusQuestion)}
                placeholder="Masukkan pertanyaan..."
                className="flex-1"
              />
              <Button onClick={() => toggleShowQuestion(selectedBonusQuestion)} variant={gameState.showQuestion[selectedBonusQuestion] ? "destructive" : "default"} size="sm">
                {gameState.showQuestion[selectedBonusQuestion] ? "Sembunyikan" : "Munculkan Pertanyaan"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="round">Babak</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedRound}
                onChange={(e) => setSelectedRound(parseInt(e.target.value) || 1)}
              >
                <option value={1}>Babak 1 (7 jawaban)</option>
                <option value={2}>Babak 2 (6 jawaban)</option>
                <option value={3}>Babak 3 (5 jawaban)</option>
                <option value={4}>Babak 4 (4 jawaban)</option>
                <option value={5}>Babak Bonus (10 jawaban)</option>
              </select>
              <Button onClick={applyRoundChange} className="mt-2" variant="default">
                Terapkan Babak
              </Button>
            </div>
            <div>
              <Label>Total Skor Saat Ini</Label>
              <Input value={gameState.totalScore} readOnly />
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
          <CardTitle>{getRoundName(gameState.round)} - Jawaban ({filledCurrent} dari {answerCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {gameState.round === 5 ? (
            <div className="space-y-8">
              {[5, 6, 7, 8, 9].map((questionRound) => (
                <div key={questionRound} className="border rounded-lg p-4">
                  <h3 className="text-center font-bold text-lg mb-4 text-yellow-800">
                    Pertanyaan {questionRound - 4}
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {new Array(5).fill(null).map((_, index) => {
                      const answerIndex = (questionRound - 5) * 5 + index;
                      const answer = currentRoundAnswers[answerIndex];
                      if (answer) {
                        return (
                          <div
                            key={answerIndex}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              answer.revealed ? 'bg-game-gold/20 border-game-gold' : 'bg-muted border-border'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="font-bold w-6">{index + 1}.</span>
                              <span className={answer.revealed ? 'font-bold' : ''}>
                                {answer.text} ({answer.points})
                              </span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => answer.revealed ? hideAnswer(answerIndex, gameState.round) : revealAnswer(answerIndex, gameState.round)}
                              variant={answer.revealed ? "destructive" : "default"}
                            >
                              {answer.revealed ? 'Sembunyikan' : 'Ungkap'}
                            </Button>
                          </div>
                        );
                      } else {
                        return (
                          <div
                            key={answerIndex}
                            className="flex items-center justify-between p-3 rounded-lg border border-dashed border-border bg-muted"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="font-bold w-6">{index + 1}.</span>
                              <span>Jawaban belum ditambahkan</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toast({ title: `Tidak ada jawaban di posisi ${answerIndex + 1}` })}
                            >
                              Ungkap
                            </Button>
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {new Array(answerCount).fill(null).map((_, index) => {
                const answer = currentRoundAnswers[index];
                if (answer) {
                  return (
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
                  );
                } else {
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg border border-dashed border-border bg-muted"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-bold">{index + 1}.</span>
                        <span>Jawaban belum ditambahkan</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast({ title: `Tidak ada jawaban di posisi ${index + 1}` })}
                      >
                        Ungkap
                      </Button>
                    </div>
                  );
                }
              })}
            </div>
          )}
          {gameState.round === 5 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Babak Bonus:</strong> 5 jawaban pertama untuk orang pertama, 5 jawaban terakhir untuk orang kedua
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
