import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameState, Answer } from "@/types/game";

interface GameControlTabProps {
  gameState: GameState;
  updateQuestion: (question: string, round?: number) => void;
  saveGameState: (state: GameState) => void;
  addStrike: (team: 'left' | 'right') => void;
  resetStrikes: (team: 'left' | 'right') => void;
  giveRoundPointsToTeam: (team: 'left' | 'right') => void;
  getRoundName: (round: number) => string;
  getAnswerCount: (round: number) => number;
  revealAnswer: (index: number, round?: number) => void;
  hideAnswer: (index: number, round?: number) => void;
  revealAnswerForPlayer: (index: number, player: 'first' | 'second', round?: number) => void;
  hideAnswerForPlayer: (index: number, round?: number) => void;
  toggleShowQuestion: (round: number) => void;
  toast: (options: { title: string; description?: string }) => void;
}

import { useState } from "react";
import { useAppSettings } from "@/contexts/SettingsContext";
export const GameControlTab = ({
  gameState,
  updateQuestion,
  saveGameState,
  addStrike,
  resetStrikes,
  giveRoundPointsToTeam,
  getRoundName,
  getAnswerCount,
  revealAnswer,
  hideAnswer,
  revealAnswerForPlayer,
  hideAnswerForPlayer,
  toggleShowQuestion,
  toast
}: GameControlTabProps) => {
  const { t } = useAppSettings();
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
          <CardTitle>{t("gameControl.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="round">{t("gameControl.round")}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedRound}
                onChange={(e) => setSelectedRound(parseInt(e.target.value) || 1)}
              >
                <option value={1}>{t("gameControl.round1")}</option>
                <option value={2}>{t("gameControl.round2")}</option>
                <option value={3}>{t("gameControl.round3")}</option>
                <option value={4}>{t("gameControl.round4")}</option>
                <option value={5}>{t("gameControl.round5")}</option>
              </select>
              <Button onClick={applyRoundChange} className="mt-2" variant="default">
                {t("gameControl.applyRound")}
              </Button>
            </div>
            <div>
              <Label>{t("gameControl.currentTotalScore")}</Label>
              <Input value={gameState.totalScore} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Control Features */}
      <Card>
        <CardHeader>
          <CardTitle>{t("gameControl.familyFunTimeControl")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{t("gameControl.teamLeftControl")}: {gameState.teamLeft.strikes[gameState.round] || 0}/3</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="destructive"
                  onClick={() => addStrike('left')}
                  disabled={(gameState.teamLeft.strikes[gameState.round] || 0) >= 3}
                >
                  {t("gameControl.addStrike")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => resetStrikes('left')}
                >
                  {t("gameControl.resetStrike")}
                </Button>
              </div>
            </div>

            <div>
              <Label>{t("gameControl.teamRightControl")}: {gameState.teamRight.strikes[gameState.round] || 0}/3</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="destructive"
                  onClick={() => addStrike('right')}
                  disabled={(gameState.teamRight.strikes[gameState.round] || 0) >= 3}
                >
                  {t("gameControl.addStrike")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => resetStrikes('right')}
                >
                  {t("gameControl.resetStrike")}
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label>{t("gameControl.awardRoundPoints")} {gameState.totalScore})</Label>
            <div className="flex flex-col md:flex-row gap-2 mt-2">
              <Button
                variant="default"
                onClick={() => giveRoundPointsToTeam('left')}
                disabled={gameState.totalScore === 0}
              >
                {t("gameControl.awardToLeft")}
              </Button>
              <Button
                variant="default"
                onClick={() => giveRoundPointsToTeam('right')}
                disabled={gameState.totalScore === 0}
              >
                {t("gameControl.awardToRight")}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t("gameControl.awardDesc")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Answer Reveal */}
      <Card>
        <CardHeader>
          <CardTitle>{getRoundName(gameState.round)} - {t("gameControl.answers")} ({filledCurrent} dari {answerCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {gameState.round === 5 ? (
            // Bonus: 5 questions × 5 possible answers; each answer can be revealed per player
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((questionNum) => {
                const questionKey = questionNum + 4;
                const questionText = gameState.questions[questionKey] || `${t("gameControl.question")} ${questionNum}`;
                const qOffset = (questionNum - 1) * 5;

                // Find which answer is currently revealed for each player in this question
                const firstRevealedIdx = currentRoundAnswers.findIndex(
                  (a, i) => i >= qOffset && i < qOffset + 5 && a?.revealedPlayer === 'first'
                );
                const secondRevealedIdx = currentRoundAnswers.findIndex(
                  (a, i) => i >= qOffset && i < qOffset + 5 && a?.revealedPlayer === 'second'
                );

                return (
                  <div key={questionNum} className="border rounded-lg p-4 bg-card shadow-sm">
                    <h3 className="font-bold text-base mb-1 text-yellow-800">
                      {t("gameControl.question")} {questionNum}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 italic">{questionText}</p>

                    {/* Player status row */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg border text-center ${
                        firstRevealedIdx >= 0 ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-muted border-border text-muted-foreground'
                      }`}>
                        {t("gameControl.firstPerson")}: {firstRevealedIdx >= 0
                          ? `${currentRoundAnswers[firstRevealedIdx]?.text} (${currentRoundAnswers[firstRevealedIdx]?.points})`
                          : t("gameControl.notRevealed")}
                      </div>
                      <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg border text-center ${
                        secondRevealedIdx >= 0 ? 'bg-green-100 border-green-400 text-green-800' : 'bg-muted border-border text-muted-foreground'
                      }`}>
                        {t("gameControl.secondPerson")}: {secondRevealedIdx >= 0
                          ? `${currentRoundAnswers[secondRevealedIdx]?.text} (${currentRoundAnswers[secondRevealedIdx]?.points})`
                          : t("gameControl.notRevealed")}
                      </div>
                    </div>

                    {/* 5 possible answers */}
                    <div className="space-y-2">
                      {Array.from({ length: 5 }, (_, slotIdx) => {
                        const answerIndex = qOffset + slotIdx;
                        const answer = currentRoundAnswers[answerIndex];
                        if (!answer) return (
                          <div key={answerIndex} className="flex items-center justify-between p-2 rounded border border-dashed bg-muted/50 text-muted-foreground text-sm gap-2">
                            <span className="font-bold w-5 shrink-0">{slotIdx + 1}.</span>
                            <span className="flex-1">{t("gameControl.notFilled")}</span>
                          </div>
                        );

                        const isFirstRevealed = answer.revealedPlayer === 'first';
                        const isSecondRevealed = answer.revealedPlayer === 'second';

                        return (
                          <div
                            key={answerIndex}
                            className={`flex flex-col md:flex-row items-stretch md:items-center gap-2 p-2 rounded-lg border ${
                              isFirstRevealed ? 'bg-blue-50 border-blue-300' :
                              isSecondRevealed ? 'bg-green-50 border-green-300' :
                              'bg-muted/40 border-border'
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="font-bold w-5 shrink-0 text-sm">{slotIdx + 1}.</span>
                              <span className="text-sm font-medium truncate">{answer.text}</span>
                              <span className="text-xs bg-yellow-200 text-yellow-900 font-bold px-1.5 py-0.5 rounded shrink-0">{answer.points} Poin</span>
                              {isFirstRevealed && <span className="text-xs bg-blue-200 text-blue-800 font-bold px-1.5 py-0.5 rounded shrink-0">P1</span>}
                              {isSecondRevealed && <span className="text-xs bg-green-200 text-green-800 font-bold px-1.5 py-0.5 rounded shrink-0">P2</span>}
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button
                                size="sm"
                                variant={isFirstRevealed ? "destructive" : "outline"}
                                onClick={() => isFirstRevealed
                                  ? hideAnswerForPlayer(answerIndex, gameState.round)
                                  : revealAnswerForPlayer(answerIndex, 'first', gameState.round)
                                }
                                className="h-7 text-xs px-2"
                              >
                                {isFirstRevealed ? t("gameControl.hideP1") : t("gameControl.revealP1")}
                              </Button>
                              <Button
                                size="sm"
                                variant={isSecondRevealed ? "destructive" : "outline"}
                                onClick={() => isSecondRevealed
                                  ? hideAnswerForPlayer(answerIndex, gameState.round)
                                  : revealAnswerForPlayer(answerIndex, 'second', gameState.round)
                                }
                                className="h-7 text-xs px-2"
                              >
                                {isSecondRevealed ? t("gameControl.hideP2") : t("gameControl.revealP2")}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {new Array(answerCount).fill(null).map((_, index) => {
                const answer = currentRoundAnswers[index];
                if (answer) {
                  return (
                    <div
                      key={index}
                      className={`flex flex-col md:flex-row items-stretch md:items-center justify-between p-4 rounded-lg border gap-3 ${
                        answer.revealed ? 'bg-game-gold/20 border-game-gold' : 'bg-muted border-border'
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate min-w-0">
                        <span className="font-bold shrink-0">{index + 1}.</span>
                        <span className={`truncate ${answer.revealed ? 'font-bold' : ''}`}>
                          {answer.text} ({answer.points})
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => answer.revealed ? hideAnswer(index, gameState.round) : revealAnswer(index, gameState.round)}
                        variant={answer.revealed ? "destructive" : "default"}
                        className="shrink-0 w-full md:w-auto"
                      >
                        {answer.revealed ? t("gameControl.hide") : t("gameControl.reveal")}
                      </Button>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row items-stretch md:items-center justify-between p-4 rounded-lg border border-dashed border-border bg-muted gap-3"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <span className="font-bold shrink-0">{index + 1}.</span>
                        <span className="text-sm truncate">{t("gameControl.answerNotAdded")}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast({ title: `${t("gameControl.noAnswerAtPosition")} ${index + 1}` })}
                        className="shrink-0 w-full md:w-auto"
                      >
                        {t("gameControl.reveal")}
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
                {t("gameControl.bonusDesc")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
