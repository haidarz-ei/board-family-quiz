import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface DeviceSession {
  id: string;
  device_id: string;
  device_name: string | null;
  device_type: string | null;
  last_accessed_at: string;
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

  // Get device type
  const getDeviceType = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
      return 'mobile';
    }
    if (userAgent.includes('tablet') || userAgent.includes('ipad')) {
      return 'tablet';
    }
    return 'desktop';
  };

  // Register current device session
  const registerDevice = async () => {
    if (!user) return null;

    const deviceId = getDeviceId();
    const deviceType = getDeviceType();
    const deviceName = `${navigator.platform} - ${new Date().toLocaleDateString('id-ID')}`;

    // Check if can add device
    const { data: canAdd } = await supabase.rpc('can_add_device', {
      p_user_id: user.id
    });

    if (!canAdd) {
      return { success: false, error: 'Device limit reached' };
    }

    // Insert or update device
    const { error } = await supabase
      .from('user_devices')
      .upsert({
        user_id: user.id,
        device_id: deviceId,
        device_name: deviceName,
        device_type: deviceType,
      }, {
        onConflict: 'user_id,device_id'
      });

    if (error) {
      console.error('Error registering device:', error);
      return { success: false, error };
    }

    await fetchDevices();
    return { success: true };
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
      .from('user_devices')
      .select('*')
      .eq('user_id', user.id)
      .order('last_accessed_at', { ascending: false });

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
      .from('user_devices')
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

    const { data, error } = await supabase.rpc('can_add_device', {
      p_user_id: user.id
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