import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface AudioSetting {
  id: string;
  audio_type: string;
  audio_url: string | null;
  file_name: string | null;
}

export const useAudioSettings = () => {
  const { toast } = useToast();
  const [audioSettings, setAudioSettings] = useState<AudioSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Fetch audio settings
  const fetchAudioSettings = async () => {
    try {
      // Fetch regular audio settings
      const { data: audioData, error: audioError } = await supabase
        .from('audio_settings')
        .select('*')
        .order('audio_type');

      if (audioError) throw audioError;

      // Fetch free music
      const { data: freeMusicData, error: freeMusicError } = await supabase
        .from('free_music')
        .select('*')
        .order('created_at', { ascending: false });

      if (freeMusicError) throw freeMusicError;

      // Combine both
      const combinedSettings: AudioSetting[] = [
        ...(audioData || []),
        ...(freeMusicData || []).map(music => ({
          id: music.id,
          audio_type: `free_music_${music.id}`,
          audio_url: music.audio_url,
          file_name: music.file_name,
        }))
      ];

      setAudioSettings(combinedSettings);
    } catch (error) {
      console.error('Error fetching audio settings:', error);
      toast({
        title: 'Gagal memuat pengaturan audio',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudioSettings();
  }, []);

  // Upload audio file
  const uploadAudio = async (audioType: string, file: File) => {
    setUploading(true);
    try {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${audioType}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('game-audio')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('game-audio')
        .getPublicUrl(filePath);

      // Update database
      const { error: updateError } = await supabase
        .from('audio_settings')
        .update({
          audio_url: urlData.publicUrl,
          file_name: fileName,
          updated_at: new Date().toISOString(),
        })
        .eq('audio_type', audioType);

      if (updateError) throw updateError;

      toast({
        title: 'Audio berhasil diupload',
        description: `File ${file.name} berhasil diupload`,
      });

      // Refresh settings
      await fetchAudioSettings();
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast({
        title: 'Gagal upload audio',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // Delete audio
  const deleteAudio = async (audioType: string, fileName: string | null) => {
    try {
      // Delete from storage if file exists
      if (fileName) {
        const { error: deleteError } = await supabase.storage
          .from('game-audio')
          .remove([fileName]);

        if (deleteError) throw deleteError;
      }

      // Update database to null
      const { error: updateError } = await supabase
        .from('audio_settings')
        .update({
          audio_url: null,
          file_name: null,
          updated_at: new Date().toISOString(),
        })
        .eq('audio_type', audioType);

      if (updateError) throw updateError;

      toast({
        title: 'Audio berhasil dihapus',
      });

      // Refresh settings
      await fetchAudioSettings();
    } catch (error) {
      console.error('Error deleting audio:', error);
      toast({
        title: 'Gagal menghapus audio',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    }
  };

  // Get audio URL by type
  const getAudioUrl = (audioType: string): string | null => {
    const setting = audioSettings.find(s => s.audio_type === audioType);
    return setting?.audio_url || null;
  };

  return {
    audioSettings,
    loading,
    uploading,
    uploadAudio,
    deleteAudio,
    getAudioUrl,
    fetchAudioSettings,
  };
};
