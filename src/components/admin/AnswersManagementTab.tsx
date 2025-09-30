import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameState } from "@/types/game";

interface AnswersManagementTabProps {
  gameState: GameState;
  selectedRoundForAnswers: number;
  setSelectedRoundForAnswers: (round: number) => void;
  newAnswer: { text: string; points: number };
  setNewAnswer: (answer: { text: string; points: number }) => void;
  targetIndex: number | null;
  setTargetIndex: (index: number | null) => void;
  addAnswer: (round?: number) => void;
  updateAnswer: (index: number, field: keyof import("@/types/game").Answer, value: string | number | boolean, round?: number) => void;
  deleteAnswer: (index: number, round?: number) => void;
  getAnswerCount: (round: number) => number;
  getRoundName: (round: number) => string;
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
  toast
}: AnswersManagementTabProps) => {
  const newAnswerTextRef = useRef<HTMLInputElement>(null);
  const selectedRoundAnswers = gameState.answers[selectedRoundForAnswers] || [];
  const filledSelected = selectedRoundAnswers.filter(a => a !== null).length;

  return (
    <>
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
                ref={newAnswerTextRef}
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
                value={newAnswer.points.toString()}
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
            Jawaban saat ini: {filledSelected}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Jawaban - {getRoundName(selectedRoundForAnswers)} ({filledSelected} dari {getAnswerCount(selectedRoundForAnswers)})</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedRoundForAnswers === 5 ? (
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column - Orang Pertama (1-5) */}
              <div>
                <h3 className="text-center font-bold text-lg mb-4 text-yellow-800">Orang Pertama</h3>
                <div className="space-y-4">
                  {new Array(5).fill(null).map((_, index) => {
                    const answer = selectedRoundAnswers[index];
                    if (answer) {
                      return (
                        <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                          <span className="font-bold w-8">{index + 1}.</span>
                          <Input
                            value={answer.text}
                            onChange={(e) => updateAnswer(index, 'text', e.target.value, selectedRoundForAnswers)}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={answer.points.toString()}
                            onChange={(e) => updateAnswer(index, 'points', parseInt(e.target.value) || 0, selectedRoundForAnswers)}
                            className="w-20"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteAnswer(index, selectedRoundForAnswers)}
                          >
                            Hapus
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
                            onClick={() => {
                              setTargetIndex(index);
                              setNewAnswer({ text: "", points: 0 });
                              toast({ title: `Siap menambahkan jawaban di posisi ${index + 1}` });
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
              </div>

              {/* Right Column - Orang Kedua (6-10) */}
              <div>
                <h3 className="text-center font-bold text-lg mb-4 text-yellow-800">Orang Kedua</h3>
                <div className="space-y-4">
                  {new Array(5).fill(null).map((_, index) => {
                    const actualIndex = index + 5;
                    const answer = selectedRoundAnswers[actualIndex];
                    if (answer) {
                      return (
                        <div key={actualIndex} className="flex items-center gap-4 p-4 border rounded-lg">
                          <span className="font-bold w-8">{actualIndex + 1}.</span>
                          <Input
                            value={answer.text}
                            onChange={(e) => updateAnswer(actualIndex, 'text', e.target.value, selectedRoundForAnswers)}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={answer.points.toString()}
                            onChange={(e) => updateAnswer(actualIndex, 'points', parseInt(e.target.value) || 0, selectedRoundForAnswers)}
                            className="w-20"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteAnswer(actualIndex, selectedRoundForAnswers)}
                          >
                            Hapus
                          </Button>
                        </div>
                      );
                    } else {
                      return (
                        <div
                          key={actualIndex}
                          className="flex items-center justify-between p-4 rounded-lg border border-dashed border-border bg-muted"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="font-bold">{actualIndex + 1}.</span>
                            <span>Jawaban belum ditambahkan</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setTargetIndex(actualIndex);
                              setNewAnswer({ text: "", points: 0 });
                              toast({ title: `Siap menambahkan jawaban di posisi ${actualIndex + 1}` });
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
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {new Array(getAnswerCount(selectedRoundForAnswers)).fill(null).map((_, index) => {
                const answer = selectedRoundAnswers[index];
                if (answer) {
                  return (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <span className="font-bold w-8">{index + 1}.</span>
                      <Input
                        value={answer.text}
                        onChange={(e) => updateAnswer(index, 'text', e.target.value, selectedRoundForAnswers)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={answer.points.toString()}
                        onChange={(e) => updateAnswer(index, 'points', parseInt(e.target.value) || 0, selectedRoundForAnswers)}
                        className="w-20"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteAnswer(index, selectedRoundForAnswers)}
                      >
                        Hapus
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
                        onClick={() => {
                          setTargetIndex(index);
                          setNewAnswer({ text: "", points: 0 });
                          toast({ title: `Siap menambahkan jawaban di posisi ${index + 1}` });
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
