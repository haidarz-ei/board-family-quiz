import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

import { Upload, Trash2, Play, Pause, Plus, Edit2, Music, Volume2 } from "lucide-react";
import { useFreeMusic } from "@/hooks/useFreeMusic";
import { useGameState } from "@/hooks/useGameState";
import { useToast } from "@/hooks/use-toast";

export const FreeMusicSection = () => {
  const { freeMusic, loading, uploading, uploadProgress, uploadMusic, updateMusicName, deleteMusic } = useFreeMusic();
  const { gameState, playAudioOnDisplay, updateVolume } = useGameState();
  const { toast } = useToast();
  const [playingMusic, setPlayingMusic] = useState<string | null>(null);
  const [newMusicName, setNewMusicName] = useState("");
  const [editingMusic, setEditingMusic] = useState<{ id: string; name: string } | null>(null);
  const [editName, setEditName] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [uploadFileSize, setUploadFileSize] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && newMusicName.trim()) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        toast({
          title: 'Format file tidak valid',
          description: 'Hanya file audio yang diizinkan: MP3, WAV, OGG, AAC. Bukan file video seperti MP4.',
          variant: 'destructive',
        });
        return;
      }

      setUploadFileSize(file.size);
      await uploadMusic(newMusicName.trim(), file);
      setNewMusicName("");
      setIsAddDialogOpen(false);
      // Reset input
      event.target.value = '';
    } else if (!newMusicName.trim()) {
      toast({
        title: 'Nama musik diperlukan',
        description: 'Masukkan nama musik terlebih dahulu',
        variant: 'destructive',
      });
    }
  };

  const playMusic = (url: string, musicId: string) => {
    if (playingMusic === musicId) {
      // Stop music - send stop command to display
      playAudioOnDisplay(`free_music_stop`);
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingMusic(null);
    } else {
      // Play music only on display screens via Firebase
      playAudioOnDisplay(`free_music_play_${url}`);
      setPlayingMusic(musicId);
    }
  };

  const handleEditName = (music: { id: string; name: string }) => {
    setEditingMusic({ id: music.id, name: music.name });
    setEditName(music.name);
  };

  const saveEditName = async () => {
    if (editingMusic && editName.trim()) {
      await updateMusicName(editingMusic.id, editName.trim());
      setEditingMusic(null);
      setEditName("");
    }
  };

  const handleDelete = (music: { id: string; name: string; file_name: string }) => {
    if (confirm(`Apakah Anda yakin ingin menghapus musik "${music.name}"?`)) {
      deleteMusic(music.id, music.file_name);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Memuat musik...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Musik Bebas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Kelola musik yang bisa diputar kapan saja. Musik ini akan tampil di layar display saat Anda klik play.
          Format yang didukung: <span className="font-semibold text-foreground">MP3, WAV, OGG, AAC</span>. Ukuran maks: <span className="font-semibold text-foreground">5 MB</span> per file
        </p>

        {/* Free Music Volume Slider */}
        <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Volume Music Bebas
            </Label>
            <span className="text-sm font-bold">{Math.round((gameState.volumes?.freeMusic ?? 0.5) * 100)}%</span>
          </div>
          <Slider
            value={[(gameState.volumes?.freeMusic ?? 0.5) * 100]}
            min={0}
            max={100}
            step={1}
            onValueChange={(val) => updateVolume('freeMusic', val[0] / 100)}
            className="cursor-pointer py-2"
          />
          <p className="text-xs text-muted-foreground">Volume ini mengatur kerasnya suara Music Bebas di layar Display Board.</p>
        </div>

        {/* Add Music Button */}
        <div className="flex justify-end">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Musik
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Musik Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="musicName">Nama Musik</Label>
                  <Input
                    id="musicName"
                    placeholder="Masukkan nama musik"
                    value={newMusicName}
                    onChange={(e) => setNewMusicName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="musicFile">File Musik</Label>
                  <p className="text-xs text-muted-foreground mb-1">Format: MP3, WAV, OGG, AAC · Maks. 5 MB</p>
                  <Input
                    id="musicFile"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </div>
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Mengupload... {uploadProgress}%</span>
                      {uploadFileSize && <span>{(uploadFileSize / 1024 / 1024).toFixed(2)} MB</span>}
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Music List - Display in rows of 3 */}
        <div className="space-y-4">
          {freeMusic.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Belum ada musik yang ditambahkan
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {freeMusic.map((music) => (
                <div key={music.id} className="border rounded-xl bg-slate-50/50 shadow-sm px-4 py-3">
                  {editingMusic?.id === music.id ? (
                    <div className="flex flex-col gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="text-sm w-full"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEditName} className="flex-1">Simpan</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingMusic(null)} className="flex-1">Batal</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {/* Info kiri */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" title={music.name}>{music.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(music.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      {/* Tombol aksi kanan - semua dalam satu baris */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant={playingMusic === music.id ? "default" : "outline"}
                          onClick={() => playMusic(music.audio_url, music.id)}
                          title={playingMusic === music.id ? 'Pause' : 'Play'}
                          className="h-8 w-8"
                        >
                          {playingMusic === music.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => handleEditName(music)} title="Edit Nama" className="h-8 w-8">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="destructive" onClick={() => handleDelete(music)} title="Hapus" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
