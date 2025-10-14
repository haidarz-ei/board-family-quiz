import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Upload, Trash2, Play, Volume2, Pause } from "lucide-react";
import { useAudioSettings } from "@/hooks/useAudioSettings";
import { useGameState } from "@/hooks/useGameState";
import { useRef, useState } from "react";


export const AudioSettingsTab = () => {
  const { audioSettings, loading, uploading, uploadAudio, deleteAudio } = useAudioSettings();
  const { playAudioOnDisplay } = useGameState();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);



  const audioTypes = [
    { type: 'regular_answer', label: 'Jawaban Reguler', description: 'Suara saat mengungkap jawaban biasa' },
    { type: 'highest_answer', label: 'Jawaban Poin Tertinggi', description: 'Suara saat mengungkap jawaban dengan poin tertinggi' },
    { type: 'wrong_answer', label: 'Jawaban Salah', description: 'Suara saat jawaban salah' },
    { type: 'add_strike', label: 'Tambah Strike', description: 'Suara saat menambahkan strike' },
    { type: 'round_points', label: 'Poin Babak', description: 'Suara saat memberikan poin babak ke tim' },
    { type: 'background_music', label: 'Musik Latar', description: 'Musik latar saat bermain' },
  ];

  const handleFileSelect = (audioType: string) => {
    const input = fileInputRefs.current[audioType];
    if (input) {
      input.click();
    }
  };

  const handleFileChange = async (audioType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        alert('File harus berupa audio!');
        return;
      }
      await uploadAudio(audioType, file);
      // Reset input
      event.target.value = '';
    }
  };

  const playAudio = (url: string, audioType: string) => {
    if (playingAudio === audioType) {
      // Stop audio
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingAudio(null);
    } else {
      // Play audio on display screens via Firebase
      playAudioOnDisplay(audioType);
      
      // Also play locally for preview
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audio.play();
      audioRef.current = audio;
      setPlayingAudio(audioType);
      audio.onended = () => {
        setPlayingAudio(null);
        audioRef.current = null;
      };
    }
  };

  const handleDelete = (audioType: string, fileName: string | null) => {
    if (confirm('Apakah Anda yakin ingin menghapus audio ini?')) {
      deleteAudio(audioType, fileName);
    }
  };



  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Memuat...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Pengaturan Audio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Upload file audio untuk berbagai event dalam game. Format yang didukung: MP3, WAV, OGG
        </p>

        {audioTypes.map((audioType) => {
          const setting = audioSettings.find(s => s.audio_type === audioType.type);
          const hasAudio = setting?.audio_url;

          return (
            <div key={audioType.type} className="border rounded-lg p-4 space-y-3">
              <div>
                <Label className="text-base font-semibold">{audioType.label}</Label>
                <p className="text-sm text-muted-foreground">{audioType.description}</p>
              </div>

              <div className="flex items-center gap-2">
                {hasAudio ? (
                  <>
                    <div className="flex-1 p-2 bg-muted rounded-md text-sm">
                      {setting.file_name || 'Audio tersedia'}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => playAudio(setting.audio_url!, audioType.type)}
                    >
                      {playingAudio === audioType.type ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFileSelect(audioType.type)}
                      disabled={uploading}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(audioType.type, setting.file_name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 p-2 bg-muted rounded-md text-sm text-muted-foreground">
                      Belum ada audio
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleFileSelect(audioType.type)}
                      disabled={uploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </>
                )}

                <input
                  ref={(el) => (fileInputRefs.current[audioType.type] = el)}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(audioType.type, e)}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
