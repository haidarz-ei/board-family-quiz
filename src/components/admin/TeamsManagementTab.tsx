import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameState } from "@/types/game";

interface TeamsManagementTabProps {
  gameState: GameState;
  updateTeam: (side: 'left' | 'right', field: keyof import("@/types/game").Team, value: string | number) => void;
}

export const TeamsManagementTab = ({
  gameState,
  updateTeam
}: TeamsManagementTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tim & Skor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-8">
          {/* Team Left */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-blue-600">{gameState.teamLeft.name}</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamLeftName" className="text-sm font-medium">Edit Nama Tim</Label>
                <Input
                  id="teamLeftName"
                  value={gameState.teamLeft.name}
                  onChange={(e) => updateTeam('left', 'name', e.target.value)}
                  placeholder="Masukkan nama tim kiri..."
                  className="text-center"
                />
              </div>
              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                <Label className="text-lg font-semibold text-blue-700">Skor Total</Label>
                <div className="text-4xl font-bold text-blue-800 mt-2">
                  {gameState.teamLeft.score}
                </div>
              </div>
            </div>
          </div>

          {/* Team Right */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-red-600">{gameState.teamRight.name}</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamRightName" className="text-sm font-medium">Edit Nama Tim</Label>
                <Input
                  id="teamRightName"
                  value={gameState.teamRight.name}
                  onChange={(e) => updateTeam('right', 'name', e.target.value)}
                  placeholder="Masukkan nama tim kanan..."
                  className="text-center"
                />
              </div>
              <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
                <Label className="text-lg font-semibold text-red-700">Skor Total</Label>
                <div className="text-4xl font-bold text-red-800 mt-2">
                  {gameState.teamRight.score}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            Skor tim akan otomatis bertambah ketika poin babak diberikan dari tab "Game Control"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
