import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Upload, Trash2, Play, Pause, Plus, Edit2, Music } from "lucide-react";
import { useFreeMusic } from "@/hooks/useFreeMusic";
import { useGameState } from "@/hooks/useGameState";
import { useToast } from "@/hooks/use-toast";

export const FreeMusicSection = () => {
  const { freeMusic, loading, uploading, uploadMusic, updateMusicName, deleteMusic } = useFreeMusic();
  const { playAudioOnDisplay } = useGameState();
  const { toast } = useToast();
  const [playingMusic, setPlayingMusic] = useState<string | null>(null);
  const [newMusicName, setNewMusicName] = useState("");
  const [editingMusic, setEditingMusic] = useState<{ id: string; name: string } | null>(null);
  const [editName, setEditName] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && newMusicName.trim()) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        toast({
          title: 'File tidak valid',
          description: 'File harus berupa audio!',
          variant: 'destructive',
        });
        return;
      }

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
      playAudioOnDisplay(`free_music_${musicId}`);
      setPlayingMusic(musicId);
    }
  };

  const handleEditName = (music: any) => {
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

  const handleDelete = (music: any) => {
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
        </p>

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
                  <Input
                    id="musicFile"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </div>
                {uploading && <p className="text-sm text-muted-foreground">Mengupload...</p>}
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
            // Group music into rows of 3
            Array.from({ length: Math.ceil(freeMusic.length / 3) }, (_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {freeMusic.slice(rowIndex * 3, (rowIndex + 1) * 3).map((music) => (
                  <div key={music.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      {editingMusic?.id === music.id ? (
                        <div className="flex-1 flex gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="text-sm"
                          />
                          <Button size="sm" onClick={saveEditName}>
                            Simpan
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingMusic(null)}
                          >
                            Batal
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <p className="font-medium text-sm truncate">{music.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(music.created_at).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => playMusic(music.audio_url, music.id)}
                            >
                              {playingMusic === music.id ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditName(music)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(music)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
