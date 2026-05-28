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
import { FreeVideoSection } from "@/components/admin/FreeVideoSection";

import { useAppSettings } from "@/contexts/SettingsContext";

export const AdminPanel = () => {
  const { toast } = useToast();
  const { t } = useAppSettings();
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
    revealAnswerForPlayer,
    hideAnswerForPlayer,
    updateTeam,
    resetGame,
    getAnswerCount,
    getRoundName,
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
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground text-center md:text-left">{t("admin.title")}</h1>
          <div className="flex flex-wrap justify-center gap-2 md:space-x-4">
            <Button onClick={resetGame} variant="destructive">
              {t("admin.resetGame")}
            </Button>

          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "game" | "answers" | "teams" | "audio" | "music")} className="w-full">
          {/* Responsive Grid Tabs Container */}
          <div className="w-full mb-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto gap-1">
              <TabsTrigger value="game" className="whitespace-normal text-xs md:text-sm py-2 h-auto">{t("admin.gameControl")}</TabsTrigger>
              <TabsTrigger value="answers" className="whitespace-normal text-xs md:text-sm py-2 h-auto">{t("admin.answers")}</TabsTrigger>
              <TabsTrigger value="teams" className="whitespace-normal text-xs md:text-sm py-2 h-auto">{t("admin.teams")}</TabsTrigger>
              <TabsTrigger value="audio" className="whitespace-normal text-xs md:text-sm py-2 h-auto">{t("admin.audio")}</TabsTrigger>
              <TabsTrigger value="music" className="col-span-2 md:col-span-1 whitespace-normal text-xs md:text-sm py-2 h-auto">{t("admin.freeMedia")}</TabsTrigger>
            </TabsList>
          </div>

          {/* Game Control Tab */}
          <TabsContent value="game" className="space-y-6">
      <GameControlTab
        gameState={gameState}
        updateQuestion={updateQuestion}
        saveGameState={saveGameState}
        addStrike={addStrike}
        resetStrikes={resetStrikes}
        giveRoundPointsToTeam={giveRoundPointsToTeam}
        getRoundName={getRoundName}
        getAnswerCount={getAnswerCount}
        revealAnswer={revealAnswer}
        hideAnswer={hideAnswer}
        revealAnswerForPlayer={revealAnswerForPlayer}
        hideAnswerForPlayer={hideAnswerForPlayer}
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
              updateQuestion={updateQuestion}
              toggleShowQuestion={toggleShowQuestion}
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

          {/* Free Media Tab */}
          <TabsContent value="music">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 min-w-0">
                <FreeMusicSection />
              </div>
              <div className="flex-1 min-w-0">
                <FreeVideoSection />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
