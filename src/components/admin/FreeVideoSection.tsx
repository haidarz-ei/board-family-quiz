import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

import { Trash2, Play, Plus, Edit2, Video, Eye, Square, Volume2 } from "lucide-react";
import { useFreeVideos } from "@/hooks/useFreeVideos";
import { useGameState } from "@/hooks/useGameState";
import { useToast } from "@/hooks/use-toast";

export const FreeVideoSection = () => {
  const { freeVideos, loading, uploading, uploadProgress, uploadVideo, updateVideoName, deleteVideo } = useFreeVideos();
  const { gameState, playAudioOnDisplay, updateVolume } = useGameState();
  const { toast } = useToast();
  
  const [newVideoName, setNewVideoName] = useState("");
  const [editingVideo, setEditingVideo] = useState<{ id: string; name: string } | null>(null);
  const [editName, setEditName] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [uploadFileSize, setUploadFileSize] = useState<number | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && newVideoName.trim()) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast({
          title: 'Format file tidak valid',
          description: 'Hanya file video yang diizinkan: MP4, WebM, MOV, AVI. Bukan file audio seperti MP3.',
          variant: 'destructive',
        });
        return;
      }

      setUploadFileSize(file.size);
      await uploadVideo(newVideoName.trim(), file);
      setNewVideoName("");
      setIsAddDialogOpen(false);
      // Reset input
      event.target.value = '';
    } else if (!newVideoName.trim()) {
      toast({
        title: 'Nama video diperlukan',
        description: 'Masukkan nama video terlebih dahulu',
        variant: 'destructive',
      });
    }
  };

  const showVideo = (url: string) => {
    playAudioOnDisplay(`video_show_${url}`);
    toast({ title: 'Video ditampilkan (pause)' });
  };

  const playVideo = (url: string) => {
    playAudioOnDisplay(`video_play_${url}`);
    toast({ title: 'Video diputar' });
  };

  const stopVideo = () => {
    playAudioOnDisplay(`video_stop`);
    toast({ title: 'Video dihentikan' });
  };

  const handleEditName = (video: { id: string; name: string }) => {
    setEditingVideo({ id: video.id, name: video.name });
    setEditName(video.name);
  };

  const saveEditName = async () => {
    if (editingVideo && editName.trim()) {
      await updateVideoName(editingVideo.id, editName.trim());
      setEditingVideo(null);
      setEditName("");
    }
  };

  const handleDelete = (video: { id: string; name: string; file_name: string }) => {
    if (confirm(`Apakah Anda yakin ingin menghapus video "${video.name}"?`)) {
      deleteVideo(video.id, video.file_name);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Memuat video...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Video Bebas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Kelola video yang bisa diputar di layar display. Gunakan tombol "Tampilkan" untuk memunculkan video dalam kondisi pause.
          Format yang didukung: <span className="font-semibold text-foreground">MP4, WebM, MOV, AVI</span>. Ukuran maks: <span className="font-semibold text-foreground">20 MB</span> per file
        </p>

        {/* Free Video Volume Slider */}
        <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Volume Video Bebas
            </Label>
            <span className="text-sm font-bold">{Math.round((gameState.volumes?.freeVideo ?? 0.8) * 100)}%</span>
          </div>
          <Slider
            value={[(gameState.volumes?.freeVideo ?? 0.8) * 100]}
            min={0}
            max={100}
            step={1}
            onValueChange={(val) => updateVolume('freeVideo', val[0] / 100)}
            className="cursor-pointer py-2"
          />
          <p className="text-xs text-muted-foreground">Volume ini mengatur kerasnya suara Video Bebas di layar Display Board.</p>
        </div>

        {/* Global Stop Button & Add Button */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <Button variant="destructive" onClick={stopVideo}>
            <Square className="h-4 w-4 mr-2" />
            Stop Video (Tutup Layar)
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Video
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Video Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="videoName">Nama Video</Label>
                  <Input
                    id="videoName"
                    placeholder="Masukkan nama video"
                    value={newVideoName}
                    onChange={(e) => setNewVideoName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="videoFile">File Video</Label>
                  <p className="text-xs text-muted-foreground mb-1">Format: MP4, WebM, MOV, AVI · Maks. 20 MB</p>
                  <Input
                    id="videoFile"
                    type="file"
                    accept="video/*"
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

        {/* Video List - Display in rows of 3 */}
        <div className="space-y-4">
          {freeVideos.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Belum ada video yang ditambahkan
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {freeVideos.map((video) => (
                <div key={video.id} className="border rounded-xl bg-slate-50/50 shadow-sm px-4 py-3">
                  {editingVideo?.id === video.id ? (
                    <div className="flex flex-col gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="text-sm w-full"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEditName} className="flex-1">Simpan</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingVideo(null)} className="flex-1">Batal</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {/* Info kiri */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" title={video.name}>{video.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(video.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      {/* Tombol aksi kanan - semua dalam satu baris */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="icon" variant="outline" onClick={() => showVideo(video.video_url)} title="Tampilkan" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => playVideo(video.video_url)} title="Play" className="h-8 w-8">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => handleEditName(video)} title="Edit Nama" className="h-8 w-8">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="destructive" onClick={() => handleDelete(video)} title="Hapus" className="h-8 w-8">
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
