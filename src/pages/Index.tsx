import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative" style={{ backgroundImage: 'url(/img/halloween.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black/50" />
      <header className="relative z-10 flex justify-between items-center p-6">
        <div className="text-2xl font-bold text-white drop-shadow">HPRO</div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full p-1">
          <button className="w-8 h-8 rounded-full overflow-hidden border border-white/40">
            <img src="/flags/en.svg" alt="English" className="w-full h-full object-cover" />
          </button>
          <button className="w-8 h-8 rounded-full overflow-hidden border border-white/40">
            <img src="/flags/id.svg" alt="Indonesia" className="w-full h-full object-cover" />
          </button>
        </div>
      </header>

      <div className="relative z-10 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 text-white shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold mb-2">FAMILY FUN TIME</CardTitle>
            <p className="text-white/80">Pilih mode untuk memulai</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate('/admin')} className="w-full">
              Admin Panel
            </Button>
            <Button onClick={() => navigate('/display')} variant="secondary" className="w-full">
              Tampilan Display
            </Button>
            <div className="flex justify-center gap-4 mt-4 text-xs text-white/80">
              <Link to="/privacy" className="hover:underline">Kebijakan Privasi</Link>
              <span>•</span>
              <Link to="/terms" className="hover:underline">Syarat & Ketentuan</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
