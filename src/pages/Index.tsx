import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Monitor } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    // <div className="min-h-screen bg-gradient-game">
    <div className="min-h-screen" style={{ backgroundImage: 'url(/img/halloween.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="text-2xl font-bold text-white">
          HPRO
        </div>
        <div className="flex items-center gap-4">
          {!user && (
            <div className="bg-gray-300 rounded-lg p-1 flex">
              <Button
                onClick={() => navigate('/auth')}
                className="bg-gray-200 text-black font-bold px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Sign Up
              </Button>
              <Button
                onClick={() => navigate('/auth')}
                className="bg-blue-700 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-800 ml-1"
              >
                Login
              </Button>
            </div>
          )}
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white">Login sebagai: {user.email}</span>
              <Button
                onClick={() => signOut()}
                variant="outline"
                size="sm"
              >
                Logout
              </Button>
            </div>
          )}
          {/* Language Selector */}
          <div className="relative">
            <select className="appearance-none bg-white text-black font-bold px-4 py-2 rounded-full cursor-pointer">
              <option value="en">en</option>
              <option value="id">ID</option>
            </select>
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"></span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold  mb-4">
              FAMILY FUN TIME
            </CardTitle>
            <p className="text-muted-foreground">
              Pilih mode untuk memulai
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => navigate('/admin')}
              className="w-full bg-gradient-gold hover:bg-game-gold-dark text-primary-foreground font-bold text-lg py-6"
            >
              Admin Panel
            </Button>
            <Button
              onClick={() => navigate('/display')}
              className="w-full bg-game-primary hover:bg-game-primary-dark text-white font-bold text-lg py-6"
            >
              Tampilan Display
            </Button>

            {user && (
              <Button
                onClick={() => navigate('/devices')}
                variant="outline"
                className="w-full"
              >
                <Monitor className="mr-2 h-4 w-4" />
                Kelola Perangkat
              </Button>
            )}

            <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <Link to="/privacy" className="hover:underline">
                Kebijakan Privasi
              </Link>
              <span>•</span>
              <Link to="/terms" className="hover:underline">
                Syarat & Ketentuan
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;