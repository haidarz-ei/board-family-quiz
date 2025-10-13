import { AdminPanel } from "@/components/AdminPanel";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Admin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p>Silakan login terlebih dahulu untuk mengakses Admin Panel.</p>
          <Button onClick={() => navigate('/auth')}>Login</Button>
        </div>
      </div>
    );
  }

  return <AdminPanel />;
};

export default Admin;