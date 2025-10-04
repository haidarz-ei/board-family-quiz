import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  const navigate = useNavigate();

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
            <CardTitle className="text-3xl font-bold text-primary">
              Kebijakan Privasi
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Informasi yang Kami Kumpulkan</h2>
              <p className="text-muted-foreground">
                Kami mengumpulkan informasi yang Anda berikan langsung kepada kami, termasuk:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Alamat email untuk autentikasi akun</li>
                <li>Data permainan dan skor</li>
                <li>Preferensi pengguna</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Penggunaan Informasi</h2>
              <p className="text-muted-foreground">
                Kami menggunakan informasi yang dikumpulkan untuk:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Menyediakan dan memelihara layanan kami</li>
                <li>Mengelola akun pengguna</li>
                <li>Menyimpan data permainan dan progres</li>
                <li>Meningkatkan pengalaman pengguna</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Keamanan Data</h2>
              <p className="text-muted-foreground">
                Kami menggunakan langkah-langkah keamanan yang wajar secara komersial untuk melindungi 
                informasi pribadi Anda dari akses, penggunaan, atau pengungkapan yang tidak sah.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Berbagi Informasi</h2>
              <p className="text-muted-foreground">
                Kami tidak menjual, memperdagangkan, atau mentransfer informasi pribadi Anda kepada 
                pihak luar tanpa persetujuan Anda, kecuali jika diwajibkan oleh hukum.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Hak Anda</h2>
              <p className="text-muted-foreground">
                Anda memiliki hak untuk:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Mengakses data pribadi Anda</li>
                <li>Memperbarui atau mengoreksi informasi Anda</li>
                <li>Menghapus akun Anda</li>
                <li>Menarik persetujuan untuk pemrosesan data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Cookies</h2>
              <p className="text-muted-foreground">
                Kami menggunakan cookies dan teknologi pelacakan serupa untuk melacak aktivitas 
                di layanan kami dan menyimpan informasi tertentu untuk meningkatkan pengalaman Anda.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Perubahan Kebijakan</h2>
              <p className="text-muted-foreground">
                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Kami akan memberi 
                tahu Anda tentang perubahan dengan memposting kebijakan baru di halaman ini.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Hubungi Kami</h2>
              <p className="text-muted-foreground">
                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami 
                melalui halaman kontak.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;