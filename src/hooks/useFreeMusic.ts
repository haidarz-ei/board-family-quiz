import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { getActiveRoom } from '@/lib/roomContext';
import { uploadFileWithProgress } from '@/lib/storage';

export interface FreeMusic {
  id: string;
  name: string;
  audio_url: string;
  file_name: string;
  created_at: string;
  updated_at: string;
}

export const useFreeMusic = () => {
  const { toast } = useToast();
  const [freeMusic, setFreeMusic] = useState<FreeMusic[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch free music
  const fetchFreeMusic = useCallback(async () => {
    try {
      const roomCode = getActiveRoom();
      if (!roomCode) return; // Wait for room to be active

      const { data, error } = await supabase
        .from('free_music')
        .select('*')
        .eq('room_code', roomCode)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFreeMusic(data || []);
    } catch (error) {
      console.error('Error fetching free music:', error);
      toast({
        title: 'Gagal memuat musik',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFreeMusic();
  }, [fetchFreeMusic]);

  // Upload music file
  const uploadMusic = async (name: string, file: File) => {
    setUploading(true);
    setUploadProgress(0);
    try {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `free_music_${Date.now()}.${fileExt}`;
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
        .from('free_music')
        .insert({
          name: name.trim(),
          audio_url: urlData.publicUrl,
          file_name: fileName,
          room_code: roomCode,
        });

      if (insertError) throw insertError;

      toast({
        title: 'Musik berhasil diupload',
        description: `File ${file.name} berhasil diupload`,
      });

      // Refresh music list
      await fetchFreeMusic();
    } catch (error) {
      console.error('Error uploading music:', error);
      toast({
        title: 'Gagal upload musik',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Update music name
  const updateMusicName = async (id: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('free_music')
        .update({
          name: newName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Nama musik berhasil diubah',
      });

      // Refresh music list
      await fetchFreeMusic();
    } catch (error) {
      console.error('Error updating music name:', error);
      toast({
        title: 'Gagal mengubah nama musik',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    }
  };

  // Delete music
  const deleteMusic = async (id: string, fileName: string) => {
    try {
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('game-audio')
        .remove([fileName]);

      if (deleteError) throw deleteError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('free_music')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      toast({
        title: 'Musik berhasil dihapus',
      });

      // Refresh music list
      await fetchFreeMusic();
    } catch (error) {
      console.error('Error deleting music:', error);
      toast({
        title: 'Gagal menghapus musik',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    }
  };

  return {
    freeMusic,
    loading,
    uploading,
    uploadProgress,
    uploadMusic,
    updateMusicName,
    deleteMusic,
    fetchFreeMusic,
  };
};
