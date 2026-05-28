import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameState } from "@/types/game";
import { RefreshCcw } from "lucide-react";
import { useAppSettings } from "@/contexts/SettingsContext";

interface TeamsManagementTabProps {
  gameState: GameState;
  updateTeam: (side: 'left' | 'right', field: keyof import("@/types/game").Team, value: string | number) => void;
}

export const TeamsManagementTab = ({
  gameState,
  updateTeam
}: TeamsManagementTabProps) => {
  const { t } = useAppSettings();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.teams")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Team Left */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-blue-600">{gameState.teamLeft.name}</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamLeftName" className="text-sm font-medium">{t("teamsManagement.editTeamName")}</Label>
                <Input
                  id="teamLeftName"
                  value={gameState.teamLeft.name}
                  onChange={(e) => updateTeam('left', 'name', e.target.value)}
                  placeholder={t("teamsManagement.enterLeftTeam")}
                  className="text-center"
                />
              </div>
              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-lg font-semibold text-blue-700">{t("teamsManagement.totalScore")}</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateTeam('left', 'score', 0)}
                    className="h-8 px-2 text-blue-600 border-blue-300 hover:bg-blue-100"
                  >
                    <RefreshCcw className="w-3.5 h-3.5 mr-1" />
                    {t("teamsManagement.reset")}
                  </Button>
                </div>
                <Input
                  type="number"
                  value={gameState.teamLeft.score}
                  onChange={(e) => updateTeam('left', 'score', parseInt(e.target.value) || 0)}
                  className="text-4xl font-bold text-center h-16 text-blue-800 border-blue-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Team Right */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-red-600">{gameState.teamRight.name}</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamRightName" className="text-sm font-medium">{t("teamsManagement.editTeamName")}</Label>
                <Input
                  id="teamRightName"
                  value={gameState.teamRight.name}
                  onChange={(e) => updateTeam('right', 'name', e.target.value)}
                  placeholder={t("teamsManagement.enterRightTeam")}
                  className="text-center"
                />
              </div>
              <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-lg font-semibold text-red-700">{t("teamsManagement.totalScore")}</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateTeam('right', 'score', 0)}
                    className="h-8 px-2 text-red-600 border-red-300 hover:bg-red-100"
                  >
                    <RefreshCcw className="w-3.5 h-3.5 mr-1" />
                    {t("teamsManagement.reset")}
                  </Button>
                </div>
                <Input
                  type="number"
                  value={gameState.teamRight.score}
                  onChange={(e) => updateTeam('right', 'score', parseInt(e.target.value) || 0)}
                  className="text-4xl font-bold text-center h-16 text-red-800 border-red-300 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            {t("teamsManagement.autoScoreNote")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
