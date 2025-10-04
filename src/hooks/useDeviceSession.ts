import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface DeviceSession {
  id: string;
  device_id: string;
  device_name: string | null;
  device_info: unknown;
  last_active: string;
  created_at: string;
}

export const useDeviceSession = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate a unique device ID for this browser
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  };

  // Get device info
  const getDeviceInfo = () => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`
    };
  };

  // Register current device session
  const registerDevice = async () => {
    if (!user) return null;

    const deviceId = getDeviceId();
    const deviceInfo = getDeviceInfo();
    const deviceName = `${navigator.platform} - ${new Date().toLocaleDateString('id-ID')}`;

    const { data, error } = await supabase.rpc('register_device_session', {
      p_user_id: user.id,
      p_device_id: deviceId,
      p_device_name: deviceName,
      p_device_info: deviceInfo
    });

    if (error) {
      console.error('Error registering device:', error);
      return { success: false, error };
    }

    return data;
  };

  // Fetch all devices for current user
  const fetchDevices = async () => {
    if (!user) {
      setDevices([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('device_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('last_active', { ascending: false });

    if (error) {
      console.error('Error fetching devices:', error);
    } else {
      setDevices(data || []);
    }
    setLoading(false);
  };

  // Remove a device
  const removeDevice = async (deviceId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('device_sessions')
      .delete()
      .eq('user_id', user.id)
      .eq('device_id', deviceId);

    if (error) {
      console.error('Error removing device:', error);
      return { success: false, error };
    }

    await fetchDevices();
    return { success: true };
  };

  // Check device limit
  const checkDeviceLimit = async () => {
    if (!user) return null;

    const deviceId = getDeviceId();
    const { data, error } = await supabase.rpc('check_device_limit', {
      p_user_id: user.id,
      p_device_id: deviceId
    });

    if (error) {
      console.error('Error checking device limit:', error);
      return null;
    }

    return data;
  };

  useEffect(() => {
    fetchDevices();
  }, [user]);

  return {
    devices,
    loading,
    registerDevice,
    removeDevice,
    checkDeviceLimit,
    fetchDevices,
    currentDeviceId: getDeviceId()
  };
};