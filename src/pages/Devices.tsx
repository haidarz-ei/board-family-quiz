import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useDeviceSession } from '../hooks/useDeviceSession';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Monitor, Smartphone, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Devices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { devices, loading, removeDevice, currentDeviceId, fetchDevices } = useDeviceSession();
  const { toast } = useToast();
  const [deviceToRemove, setDeviceToRemove] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleRemoveDevice = async () => {
    if (!deviceToRemove) return;

    const result = await removeDevice(deviceToRemove);
    
    if (result?.success) {
      toast({
        title: 'Perangkat dihapus',
        description: 'Perangkat berhasil dihapus dari akun Anda.'
      });
      setDeviceToRemove(null);
    } else {
      toast({
        title: 'Error',
        description: 'Gagal menghapus perangkat.',
        variant: 'destructive'
      });
    }
  };

  const getDeviceIcon = (deviceInfo: any) => {
    if (!deviceInfo) return <Monitor className="h-5 w-5" />;
    
    const userAgent = deviceInfo.userAgent?.toLowerCase() || '';
    if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-game p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Perangkat Aktif</CardTitle>
            <CardDescription>
              Kelola perangkat yang terhubung dengan akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Memuat perangkat...
              </div>
            ) : devices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada perangkat terdaftar
              </div>
            ) : (
              <div className="space-y-4">
                {devices.map((device) => {
                  const isCurrentDevice = device.device_id === currentDeviceId;
                  
                  return (
                    <div
                      key={device.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isCurrentDevice ? 'bg-primary/5 border-primary' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-primary">
                          {getDeviceIcon(device.device_info)}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {device.device_name || 'Perangkat Tidak Dikenal'}
                            {isCurrentDevice && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                Perangkat Ini
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Terakhir aktif: {formatDate(device.last_active)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Terdaftar: {formatDate(device.created_at)}
                          </div>
                        </div>
                      </div>
                      
                      {!isCurrentDevice && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeviceToRemove(device.device_id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Catatan:</strong> Batas perangkat tergantung pada tier langganan Anda.
                Logout dari perangkat lain jika Anda mencapai batas maksimal.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deviceToRemove} onOpenChange={() => setDeviceToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Perangkat</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus perangkat ini? Perangkat akan logout secara otomatis.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveDevice}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Devices;