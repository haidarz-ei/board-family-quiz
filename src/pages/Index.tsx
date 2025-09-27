import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-game flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-primary mb-4">
            FAMILY 100
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
          <p className="text-sm text-muted-foreground text-center mt-4">
            Admin Panel untuk mengatur game, Display untuk menampilkan ke layar
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
