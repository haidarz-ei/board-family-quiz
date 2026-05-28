import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { uploadFileWithProgress } from '@/lib/storage';
import { getActiveRoom } from '@/lib/roomContext';

export interface AudioSetting {
  id: string;
  audio_type: string;
  audio_url: string | null;
  file_name: string | null;
  room_code?: string;
}

export const useAudioSettings = () => {
  const { toast } = useToast();
  const [audioSettings, setAudioSettings] = useState<AudioSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch audio settings
  const fetchAudioSettings = useCallback(async () => {
    try {
      const roomCode = getActiveRoom();
      if (!roomCode) return; // Need active room

      // Fetch regular audio settings
      const { data: audioData, error: audioError } = await supabase
        .from('audio_settings')
        .select('*')
        .eq('room_code', roomCode)
        .order('audio_type');

      if (audioError) throw audioError;

      // Fetch free music
      const { data: freeMusicData, error: freeMusicError } = await supabase
        .from('free_music')
        .select('*')
        .eq('room_code', roomCode)
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
  }, [toast]);

  useEffect(() => {
    fetchAudioSettings();
    // Refresh every 30 seconds so DisplayView picks up newly uploaded audio
    const interval = setInterval(fetchAudioSettings, 30_000);
    return () => clearInterval(interval);
  }, [fetchAudioSettings]);

  // Upload audio file
  const uploadAudio = async (audioType: string, file: File) => {
    setUploading(true);
    setUploadProgress(0);
    try {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${audioType}_${Date.now()}.${fileExt}`;
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

      // Update or insert database record (upsert in case the row doesn't exist)
      const { error: updateError } = await supabase
        .from('audio_settings')
        .upsert(
          {
            room_code: roomCode,
            audio_type: audioType,
            audio_url: urlData.publicUrl,
            file_name: fileName,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'room_code, audio_type' }
        );

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
      setUploadProgress(0);
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

      const roomCode = getActiveRoom();
      if (!roomCode) throw new Error("Room tidak ditemukan");

      // Update database to null
      const { error: updateError } = await supabase
        .from('audio_settings')
        .update({
          audio_url: null,
          file_name: null,
          updated_at: new Date().toISOString(),
        })
        .eq('audio_type', audioType)
        .eq('room_code', roomCode);

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
    uploadProgress,
    uploadAudio,
    deleteAudio,
    getAudioUrl,
    fetchAudioSettings,
  };
};
