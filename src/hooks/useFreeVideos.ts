import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { getActiveRoom } from '@/lib/roomContext';
import { uploadFileWithProgress } from '@/lib/storage';

export interface FreeVideo {
  id: string;
  name: string;
  video_url: string;
  file_name: string;
  created_at: string;
  updated_at: string;
}

export const useFreeVideos = () => {
  const { toast } = useToast();
  const [freeVideos, setFreeVideos] = useState<FreeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch free videos
  const fetchFreeVideos = useCallback(async () => {
    try {
      const roomCode = getActiveRoom();
      if (!roomCode) return; // Wait for room to be active

      const { data, error } = await supabase
        .from('free_videos')
        .select('*')
        .eq('room_code', roomCode)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFreeVideos(data || []);
    } catch (error) {
      console.error('Error fetching free videos:', error);
      toast({
        title: 'Gagal memuat video',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFreeVideos();
  }, [fetchFreeVideos]);

  // Upload video file
  const uploadVideo = async (name: string, file: File) => {
    setUploading(true);
    setUploadProgress(0);
    try {
      // Upload to storage (we can reuse the game-audio bucket for simplicity, or we can use game-media if it existed)
      const fileExt = file.name.split('.').pop();
      const fileName = `free_video_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      await uploadFileWithProgress('game-audio', filePath, file, (progress) => {
        setUploadProgress(progress);
      });

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('game-audio')
        .getPublicUrl(filePath);

      const roomCode = getActiveRoom();
      if (!roomCode) throw new Error("Tidak dapat upload: Room tidak ditemukan");

      // Insert into database
      const { error: insertError } = await supabase
        .from('free_videos')
        .insert({
          name: name.trim(),
          video_url: urlData.publicUrl,
          file_name: fileName,
          room_code: roomCode,
        });

      if (insertError) throw insertError;

      toast({
        title: 'Video berhasil diupload',
        description: `File ${file.name} berhasil diupload`,
      });

      // Refresh video list
      await fetchFreeVideos();
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: 'Gagal upload video',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Update video name
  const updateVideoName = async (id: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('free_videos')
        .update({
          name: newName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Nama video berhasil diubah',
      });

      // Refresh video list
      await fetchFreeVideos();
    } catch (error) {
      console.error('Error updating video name:', error);
      toast({
        title: 'Gagal mengubah nama video',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    }
  };

  // Delete video
  const deleteVideo = async (id: string, fileName: string) => {
    try {
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('game-audio')
        .remove([fileName]);

      if (deleteError) throw deleteError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('free_videos')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      toast({
        title: 'Video berhasil dihapus',
      });

      // Refresh video list
      await fetchFreeVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: 'Gagal menghapus video',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    }
  };

  return {
    freeVideos,
    loading,
    uploading,
    uploadProgress,
    uploadVideo,
    updateVideoName,
    deleteVideo,
    fetchFreeVideos,
  };
};
