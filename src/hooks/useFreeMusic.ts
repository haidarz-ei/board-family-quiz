import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

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

  // Fetch free music
  const fetchFreeMusic = async () => {
    try {
      const { data, error } = await supabase
        .from('free_music')
        .select('*')
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
  };

  useEffect(() => {
    fetchFreeMusic();
  }, []);

  // Upload music file
  const uploadMusic = async (name: string, file: File) => {
    setUploading(true);
    try {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `free_music_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('game-audio')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('game-audio')
        .getPublicUrl(filePath);

      // Insert into database
      const { error: insertError } = await supabase
        .from('free_music')
        .insert({
          name: name.trim(),
          audio_url: urlData.publicUrl,
          file_name: fileName,
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
    uploadMusic,
    updateMusicName,
    deleteMusic,
    fetchFreeMusic,
  };
};
