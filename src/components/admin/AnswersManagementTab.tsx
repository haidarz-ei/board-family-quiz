import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameState } from "@/types/game";
import { useAppSettings } from "@/contexts/SettingsContext";

interface AnswersManagementTabProps {
  gameState: GameState;
  selectedRoundForAnswers: number;
  setSelectedRoundForAnswers: (round: number) => void;
  newAnswer: { text: string; points: number };
  setNewAnswer: (answer: { text: string; points: number }) => void;
  targetIndex: number | null;
  setTargetIndex: (index: number | null) => void;
  addAnswer: (round?: number, overrideIndex?: number) => void;
  updateAnswer: (index: number, field: keyof import("@/types/game").Answer, value: string | number | boolean, round?: number) => void;
  deleteAnswer: (index: number, round?: number) => void;
  getAnswerCount: (round: number) => number;
  getRoundName: (round: number) => string;
  updateQuestion: (question: string, round?: number) => void;
  toggleShowQuestion: (round: number) => void;
  toast: (options: { title: string; description?: string }) => void;
}

export const AnswersManagementTab = ({
  gameState,
  selectedRoundForAnswers,
  setSelectedRoundForAnswers,
  newAnswer,
  setNewAnswer,
  targetIndex,
  setTargetIndex,
  addAnswer,
  updateAnswer,
  deleteAnswer,
  getAnswerCount,
  getRoundName,
  updateQuestion,
  toggleShowQuestion,
  toast
}: AnswersManagementTabProps) => {
  const { t } = useAppSettings();
  const newAnswerTextRef = useRef<HTMLInputElement>(null);
  const [selectedBonusQuestion, setSelectedBonusQuestion] = useState(5);
  const selectedRoundAnswers = gameState.answers[selectedRoundForAnswers] || [];
  const filledSelected = selectedRoundAnswers.filter(a => a !== null).length;

  // For bonus round, answers are stored per-question: indices 0-4 = Q1, 5-9 = Q2, etc.
  // addAnswer appends, so for bonus we use targetIndex to place at the right slot
  const handleBonusAdd = () => {
    if (!newAnswer.text.trim()) {
      toast({ title: t("answersManagement.enterAnswerFirst") });
      return;
    }
    const qOffset = (selectedBonusQuestion - 5) * 5;
    // Find next empty slot in this question's range
    const arr = gameState.answers[5] || [];
    if (targetIndex !== null) {
      // Editing existing
      addAnswer(5);
      return;
    }
    let placed = false;
    let indexToUse: number | undefined = undefined;
    for (let i = qOffset; i < qOffset + 5; i++) {
      if (!arr[i]) {
        indexToUse = i;
        placed = true;
        break;
      }
    }
    if (!placed) {
      toast({ title: t("answersManagement.questionFull") });
      return;
    }
    
    // Call addAnswer synchronously with the exact index
    addAnswer(5, indexToUse);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("answersManagement.selectRound")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((round) => (
              <Button
                key={round}
                variant={selectedRoundForAnswers === round ? "default" : "outline"}
                onClick={() => setSelectedRoundForAnswers(round)}
                className="flex-1 min-w-[100px]"
              >
                {getRoundName(round)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("answersManagement.question")} - {getRoundName(selectedRoundForAnswers)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            {selectedRoundForAnswers === 5 ? (
              <>
                <select
                  className="flex h-10 w-full md:w-36 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={selectedBonusQuestion}
                  onChange={(e) => {
                    setSelectedBonusQuestion(parseInt(e.target.value) || 5);
                    setTargetIndex(null);
                    setNewAnswer({ text: "", points: 0 });
                  }}
                >
                  <option value={5}>{t("answersManagement.question")} 1</option>
                  <option value={6}>{t("answersManagement.question")} 2</option>
                  <option value={7}>{t("answersManagement.question")} 3</option>
                  <option value={8}>{t("answersManagement.question")} 4</option>
                  <option value={9}>{t("answersManagement.question")} 5</option>
                </select>
                <Input
                  id="question"
                  value={gameState.questions[selectedBonusQuestion] || ""}
                  onChange={(e) => updateQuestion(e.target.value, selectedBonusQuestion)}
                  placeholder={t("answersManagement.enterQuestion")}
                  className="flex-1"
                />
                <Button onClick={() => toggleShowQuestion(selectedBonusQuestion)} variant={gameState.showQuestion[selectedBonusQuestion] ? "destructive" : "default"} className="w-full md:w-auto">
                  {gameState.showQuestion[selectedBonusQuestion] ? t("answersManagement.hideQuestion") : t("answersManagement.showQuestion")}
                </Button>
              </>
            ) : (
              <>
                <Input
                  id="question"
                  value={gameState.questions[selectedRoundForAnswers] || ""}
                  onChange={(e) => updateQuestion(e.target.value, selectedRoundForAnswers)}
                  placeholder={t("answersManagement.enterQuestion")}
                  className="flex-1"
                />
                <Button onClick={() => toggleShowQuestion(selectedRoundForAnswers)} variant={gameState.showQuestion[selectedRoundForAnswers] ? "destructive" : "default"} className="w-full md:w-auto">
                  {gameState.showQuestion[selectedRoundForAnswers] ? t("answersManagement.hideQuestion") : t("answersManagement.showQuestion")}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedRoundForAnswers === 5
              ? `${t("answersManagement.addAnswerQ")} ${selectedBonusQuestion - 4}`
              : `${t("answersManagement.addNewAnswer")} ${getRoundName(selectedRoundForAnswers)}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="newAnswerText">{t("answersManagement.answer")}</Label>
              <Input
                id="newAnswerText"
                ref={newAnswerTextRef}
                value={newAnswer.text}
                onChange={(e) => setNewAnswer({ ...newAnswer, text: e.target.value })}
                placeholder={t("answersManagement.enterAnswer")}
              />
            </div>
            <div className="w-full md:w-32">
              <Label htmlFor="newAnswerPoints">{t("answersManagement.points")}</Label>
              <Input
                id="newAnswerPoints"
                type="number"
                value={newAnswer.points.toString()}
                onChange={(e) => setNewAnswer({ ...newAnswer, points: parseInt(e.target.value) || 0 })}
                placeholder={t("answersManagement.points")}
              />
            </div>
            <div className="flex md:items-end mt-2 md:mt-0">
              <Button
                onClick={() => selectedRoundForAnswers === 5 ? handleBonusAdd() : addAnswer(selectedRoundForAnswers)}
                className="w-full md:w-auto"
              >
                {targetIndex !== null ? t("answersManagement.update") : t("answersManagement.add")}
              </Button>
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            {selectedRoundForAnswers === 5 ? (
              <>
                {t("answersManagement.answersForQ")} {selectedBonusQuestion - 4}: {" "}
                {(gameState.answers[5] || []).slice((selectedBonusQuestion - 5) * 5, (selectedBonusQuestion - 5) * 5 + 5).filter(Boolean).length} / 5
              </>
            ) : (
              <>{t("answersManagement.maxAnswers")} {getAnswerCount(selectedRoundForAnswers)} | {t("answersManagement.currentAnswers")} {filledSelected}</>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Answer List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("answersManagement.answerList")} {getRoundName(selectedRoundForAnswers)}
            {selectedRoundForAnswers !== 5 && ` (${filledSelected} ${t("answersManagement.of")} ${getAnswerCount(selectedRoundForAnswers)})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedRoundForAnswers === 5 ? (
            // Bonus: 5 questions, each with up to 5 possible answers
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((questionNum) => {
                const questionKey = questionNum + 4;
                const questionText = gameState.questions[questionKey] || "";
                const qOffset = (questionNum - 1) * 5;
                const qAnswers = (gameState.answers[5] || []).slice(qOffset, qOffset + 5);
                const filledCount = qAnswers.filter(Boolean).length;

                return (
                  <div key={questionNum} className="border rounded-lg p-4 bg-card shadow-sm">
                    <div className="flex items-center justify-between mb-3 border-b pb-2">
                      <h3 className="font-bold text-base text-yellow-800">
                        {t("answersManagement.question")} {questionNum}
                        {questionText && <span className="font-normal text-muted-foreground text-sm italic ml-2">— {questionText}</span>}
                      </h3>
                      <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">{filledCount}/5 {t("answersManagement.answers")}</span>
                    </div>
                    <div className="space-y-2">
                      {Array.from({ length: 5 }, (_, slotIdx) => {
                        const answerIndex = qOffset + slotIdx;
                        const answer = selectedRoundAnswers[answerIndex];
                        if (answer) {
                          return (
                            <div key={answerIndex} className="flex flex-col md:flex-row items-stretch md:items-center gap-2 p-3 border rounded-lg bg-background">
                              <span className="font-bold w-6 shrink-0 text-sm text-muted-foreground">{slotIdx + 1}.</span>
                              <Input
                                value={answer.text}
                                onChange={(e) => updateAnswer(answerIndex, 'text', e.target.value, 5)}
                                className="flex-1 text-sm"
                                placeholder={t("answersManagement.answer")}
                              />
                              <Input
                                type="number"
                                value={answer.points.toString()}
                                onChange={(e) => updateAnswer(answerIndex, 'points', parseInt(e.target.value) || 0, 5)}
                                className="w-20 text-sm"
                                placeholder={t("answersManagement.points")}
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setTargetIndex(answerIndex);
                                    setSelectedBonusQuestion(questionKey);
                                    setNewAnswer({ text: answer.text, points: answer.points });
                                    toast({ title: `${t("answersManagement.editAnswerQ")} ${slotIdx + 1} ${t("answersManagement.question")} ${questionNum}` });
                                    newAnswerTextRef.current?.focus();
                                  }}
                                  className="h-8 px-3 text-xs"
                                >
                                  {t("answersManagement.edit")}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteAnswer(answerIndex, 5)}
                                  className="h-8 px-3 text-xs"
                                >
                                  {t("answersManagement.delete")}
                                </Button>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div
                              key={answerIndex}
                              className="flex items-center justify-between p-3 rounded-lg border border-dashed border-border bg-muted/50"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-sm text-muted-foreground">{slotIdx + 1}.</span>
                                <span className="text-sm text-muted-foreground">{t("answersManagement.noAnswer")}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setTargetIndex(answerIndex);
                                  setSelectedBonusQuestion(questionKey);
                                  setNewAnswer({ text: "", points: 0 });
                                  toast({ title: `${t("answersManagement.readyToAddQ")} ${slotIdx + 1} ${t("answersManagement.forQuestion")} ${questionNum}` });
                                  newAnswerTextRef.current?.focus();
                                }}
                                className="h-8 w-8 p-0"
                              >
                                +
                              </Button>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {new Array(getAnswerCount(selectedRoundForAnswers)).fill(null).map((_, index) => {
                const answer = selectedRoundAnswers[index];
                if (answer) {
                  return (
                    <div key={index} className="flex flex-col md:flex-row items-stretch md:items-center gap-4 p-4 border rounded-lg">
                      <span className="font-bold hidden md:inline w-8">{index + 1}.</span>
                      <span className="font-bold md:hidden text-sm mb-1">{t("answersManagement.answer")} {index + 1}</span>
                      <Input
                        value={answer.text}
                        onChange={(e) => updateAnswer(index, 'text', e.target.value, selectedRoundForAnswers)}
                        className="flex-1 w-full"
                        placeholder={t("answersManagement.answerText")}
                      />
                      <div className="flex items-center gap-2 mt-2 md:mt-0 w-full md:w-auto">
                        <Input
                          type="number"
                          value={answer.points.toString()}
                          onChange={(e) => updateAnswer(index, 'points', parseInt(e.target.value) || 0, selectedRoundForAnswers)}
                          className="w-24 md:w-20"
                          placeholder={t("answersManagement.points")}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setTargetIndex(index);
                            setNewAnswer({ text: answer.text, points: answer.points });
                            toast({ title: `${t("answersManagement.editAnswerQ")} ${index + 1}` });
                            newAnswerTextRef.current?.focus();
                          }}
                          className="flex-1 md:flex-none"
                        >
                          {t("answersManagement.edit")}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteAnswer(index, selectedRoundForAnswers)}
                          className="flex-1 md:flex-none"
                        >
                          {t("answersManagement.delete")}
                        </Button>
                      </div>
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
                        <span>{t("answersManagement.noAnswer")}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTargetIndex(index);
                          setNewAnswer({ text: "", points: 0 });
                          toast({ title: `${t("answersManagement.readyToAddPos")} ${index + 1}` });
                          newAnswerTextRef.current?.focus();
                        }}
                      >
                        +
                      </Button>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
