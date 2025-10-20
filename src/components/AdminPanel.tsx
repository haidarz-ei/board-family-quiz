import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useGameState } from "@/hooks/useGameState";
import { GameControlTab } from "@/components/admin/GameControlTab";
import { AnswersManagementTab } from "@/components/admin/AnswersManagementTab";
import { TeamsManagementTab } from "@/components/admin/TeamsManagementTab";
import { AudioSettingsTab } from "@/components/admin/AudioSettingsTab";
import { FreeMusicSection } from "@/components/admin/FreeMusicSection";
import { Settings } from "lucide-react";

export const AdminPanel = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"game" | "answers" | "teams" | "audio" | "music">("game");

  const {
    gameState,
    selectedRoundForAnswers,
    setSelectedRoundForAnswers,
    newAnswer,
    setNewAnswer,
    targetIndex,
    setTargetIndex,
    updateQuestion,
    addAnswer,
    updateAnswer,
    deleteAnswer,
    revealAnswer,
    hideAnswer,
    updateTeam,
    resetGame,
    getAnswerCount,
    getRoundName,
    setPlayingTeam,
    addStrike,
    resetStrikes,
    giveRoundPointsToTeam,
    saveGameState,
    toggleShowQuestion,
    showQuestion,
    hideQuestion
  } = useGameState();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-foreground">Control Panel</h1>
          <div className="space-x-4">
            <Button onClick={() => window.open('/display', '_blank')} variant="outline">
              Buka Display
            </Button>
            <Button onClick={resetGame} variant="destructive">
              Reset Game
            </Button>
            <Button variant="secondary" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "game" | "answers" | "teams" | "audio" | "music")} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="game">Game Control</TabsTrigger>
            <TabsTrigger value="answers">Kelola Jawaban</TabsTrigger>
            <TabsTrigger value="teams">Tim & Skor</TabsTrigger>
            <TabsTrigger value="audio">Pengaturan Audio</TabsTrigger>
            <TabsTrigger value="music">Musik Bebas</TabsTrigger>
          </TabsList>

          {/* Game Control Tab */}
          <TabsContent value="game" className="space-y-6">
      <GameControlTab
        gameState={gameState}
        updateQuestion={updateQuestion}
        saveGameState={saveGameState}
        setPlayingTeam={setPlayingTeam}
        addStrike={addStrike}
        resetStrikes={resetStrikes}
        giveRoundPointsToTeam={giveRoundPointsToTeam}
        getRoundName={getRoundName}
        getAnswerCount={getAnswerCount}
        revealAnswer={revealAnswer}
        hideAnswer={hideAnswer}
        toggleShowQuestion={toggleShowQuestion}
        toast={toast}
      />
          </TabsContent>

          {/* Answers Management Tab */}
          <TabsContent value="answers" className="space-y-6">
            <AnswersManagementTab
              gameState={gameState}
              selectedRoundForAnswers={selectedRoundForAnswers}
              setSelectedRoundForAnswers={setSelectedRoundForAnswers}
              newAnswer={newAnswer}
              setNewAnswer={setNewAnswer}
              targetIndex={targetIndex}
              setTargetIndex={setTargetIndex}
              addAnswer={addAnswer}
              updateAnswer={updateAnswer}
              deleteAnswer={deleteAnswer}
              getAnswerCount={getAnswerCount}
              getRoundName={getRoundName}
              toast={toast}
            />
          </TabsContent>

          {/* Teams Management Tab */}
          <TabsContent value="teams" className="space-y-6">
            <TeamsManagementTab
              gameState={gameState}
              updateTeam={updateTeam}
            />
          </TabsContent>

          {/* Audio Settings Tab */}
          <TabsContent value="audio" className="space-y-6">
            <AudioSettingsTab />
          </TabsContent>

          {/* Free Music Tab */}
          <TabsContent value="music" className="space-y-6">
            <FreeMusicSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
