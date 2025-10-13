import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Play, Pause, Square, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SoundManagementTabProps {
  gameState: any;
  updateSoundAssignments: (assignments: Partial<any>) => void;
  addMusic: (music: any) => void;
  removeMusic: (index: number) => void;
  playMusic: (musicUrl: string) => void;
  pauseMusic: () => void;
  stopMusic: () => void;
}

const SoundManagementTab: React.FC<SoundManagementTabProps> = ({
  gameState,
  updateSoundAssignments,
  addMusic,
  removeMusic,
  playMusic,
  pauseMusic,
  stopMusic
}) => {

  const [newMusicName, setNewMusicName] = useState("");

  const deleteSoundFile = async (soundUrl: string) => {
    try {
      const url = new URL(soundUrl);
      const path = url.pathname.split('/storage/v1/object/public/audio/')[1];
      await supabase.storage.from('audio').remove([path]);
    } catch (error) {
      console.error('Error deleting sound:', error);
    }
  };

  const deleteMusicFile = async (musicUrl: string) => {
    try {
      const url = new URL(musicUrl);
      const path = url.pathname.split('/storage/v1/object/public/audio/')[1];
      await supabase.storage.from('audio').remove([path]);
    } catch (error) {
      console.error('Error deleting music:', error);
    }
  };

  const handleSoundFileChange = async (soundType: string, file: File | null) => {
    if (file && updateSoundAssignments) {
      try {
        const fileName = `sounds/${soundType}.${file.name.split('.').pop()}`;
        const { data, error } = await supabase.storage
          .from('audio')
          .upload(fileName, file, { upsert: true });

        if (error) throw error;

        const { data: publicUrl } = supabase.storage
          .from('audio')
          .getPublicUrl(fileName);

        updateSoundAssignments({ [soundType]: publicUrl.publicUrl });
      } catch (error) {
        console.error('Error uploading sound:', error);
        alert('Gagal mengupload suara');
      }
    } else if (updateSoundAssignments) {
      updateSoundAssignments({ [soundType]: null });
    }
  };

  const handleMusicFileChange = async (file: File | null) => {
    if (file && newMusicName.trim() && addMusic) {
      try {
        const fileName = `music/${newMusicName.trim()}.${file.name.split('.').pop()}`;
        const { data, error } = await supabase.storage
          .from('audio')
          .upload(fileName, file, { upsert: true });

        if (error) throw error;

        const { data: publicUrl } = supabase.storage
          .from('audio')
          .getPublicUrl(fileName);

        addMusic({ name: newMusicName.trim(), url: publicUrl.publicUrl });
        setNewMusicName("");
      } catch (error) {
        console.error('Error uploading music:', error);
        alert('Gagal mengupload musik');
      }
    }
  };

  const handlePlayMusic = (musicUrl: string) => {
    if (gameState?.currentMusic === musicUrl && gameState?.musicPlaying) {
      pauseMusic?.();
    } else {
      playMusic?.(musicUrl);
    }
  };

  const handleStopMusic = () => {
    stopMusic?.();
  };

  return (
    <div className="space-y-6">
      {/* Sound Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Suara Game</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button
              variant="destructive"
              onClick={() => updateSoundAssignments({
                regularAnswer: null,
                highestAnswer: null,
                wrongAnswer: null,
                backgroundMusic: null
              })}
            >
              Hapus Semua Suara
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="regularAnswer">Suara Jawaban Biasa</Label>
              <Input
                id="regularAnswer"
                type="file"
                accept="audio/*"
                onChange={(e) => handleSoundFileChange('regularAnswer', e.target.files?.[0] || null)}
              />
              {gameState?.soundAssignments?.regularAnswer && (
                <div className="flex gap-2">
                  <audio controls src={gameState.soundAssignments.regularAnswer} className="flex-1" />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      await deleteSoundFile(gameState.soundAssignments.regularAnswer);
                      updateSoundAssignments({ regularAnswer: null });
                    }}
                  >
                    Hapus
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="highestAnswer">Suara Jawaban Tertinggi</Label>
              <Input
                id="highestAnswer"
                type="file"
                accept="audio/*"
                onChange={(e) => handleSoundFileChange('highestAnswer', e.target.files?.[0] || null)}
              />
              {gameState?.soundAssignments?.highestAnswer && (
                <div className="flex gap-2">
                  <audio controls src={gameState.soundAssignments.highestAnswer} className="flex-1" />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      await deleteSoundFile(gameState.soundAssignments.highestAnswer);
                      updateSoundAssignments({ highestAnswer: null });
                    }}
                  >
                    Hapus
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="wrongAnswer">Suara Jawaban Salah</Label>
              <Input
                id="wrongAnswer"
                type="file"
                accept="audio/*"
                onChange={(e) => handleSoundFileChange('wrongAnswer', e.target.files?.[0] || null)}
              />
              {gameState?.soundAssignments?.wrongAnswer && (
                <div className="flex gap-2">
                  <audio controls src={gameState.soundAssignments.wrongAnswer} className="flex-1" />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      await deleteSoundFile(gameState.soundAssignments.wrongAnswer);
                      updateSoundAssignments({ wrongAnswer: null });
                    }}
                  >
                    Hapus
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="backgroundMusic">Musik Latar Belakang</Label>
              <Input
                id="backgroundMusic"
                type="file"
                accept="audio/*"
                onChange={(e) => handleSoundFileChange('backgroundMusic', e.target.files?.[0] || null)}
              />
              {gameState?.soundAssignments?.backgroundMusic && (
                <div className="flex gap-2">
                  <audio controls src={gameState.soundAssignments.backgroundMusic} className="flex-1" />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      await deleteSoundFile(gameState.soundAssignments.backgroundMusic);
                      updateSoundAssignments({ backgroundMusic: null });
                    }}
                  >
                    Hapus
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Music Management */}
      <Card>
        <CardHeader>
          <CardTitle>Kelola Musik</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Music */}
          <div className="flex gap-2">
            <Input
              placeholder="Nama musik"
              value={newMusicName}
              onChange={(e) => setNewMusicName(e.target.value)}
            />
            <div className="relative">
              <Input
                type="file"
                accept="audio/*"
                onChange={(e) => handleMusicFileChange(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="w-32">
                <Upload className="w-4 h-4 mr-2" />
                Pilih File
              </Button>
            </div>
          </div>

          {/* Music List */}
          <div className="space-y-2">
            {gameState?.musics?.map((music, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <span className="font-medium">{music.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={gameState?.currentMusic === music.url && gameState?.musicPlaying ? "secondary" : "outline"}
                    onClick={() => handlePlayMusic(music.url)}
                  >
                    {gameState?.currentMusic === music.url && gameState?.musicPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleStopMusic}
                    disabled={!gameState?.musicPlaying}
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      await deleteMusicFile(music.url);
                      removeMusic?.(index);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {(!gameState?.musics || gameState.musics.length === 0) && (
              <div className="text-center text-muted-foreground py-8">
                Belum ada musik yang ditambahkan
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SoundManagementTab;
