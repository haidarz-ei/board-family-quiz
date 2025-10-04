import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
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
              Syarat & Ketentuan Layanan
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Penerimaan Syarat</h2>
              <p className="text-muted-foreground">
                Dengan mengakses dan menggunakan aplikasi Family 100 ini, Anda menerima dan setuju 
                untuk terikat oleh syarat dan ketentuan layanan ini.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Penggunaan Layanan</h2>
              <p className="text-muted-foreground">
                Layanan ini disediakan untuk:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Bermain game Family 100 secara online</li>
                <li>Mengelola sesi permainan melalui Admin Panel</li>
                <li>Menampilkan permainan ke layar eksternal</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Akun Pengguna</h2>
              <p className="text-muted-foreground">
                Untuk menggunakan fitur tertentu, Anda harus membuat akun. Anda bertanggung jawab untuk:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Menjaga kerahasiaan kata sandi Anda</li>
                <li>Semua aktivitas yang terjadi di akun Anda</li>
                <li>Memberikan informasi yang akurat dan terkini</li>
                <li>Memberi tahu kami segera jika ada penggunaan tidak sah</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Tingkat Langganan</h2>
              <p className="text-muted-foreground">
                Layanan kami menawarkan berbagai tingkat langganan:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li><strong>Free:</strong> Akses terbatas tanpa login</li>
                <li><strong>Login:</strong> Akses dasar dengan 1 perangkat</li>
                <li><strong>Paid:</strong> Akses penuh dengan beberapa perangkat</li>
                <li><strong>Premium:</strong> Akses unlimited dengan fitur tambahan</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Konten Pengguna</h2>
              <p className="text-muted-foreground">
                Anda bertanggung jawab atas konten yang Anda buat, unggah, atau bagikan melalui layanan. 
                Anda setuju untuk tidak:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Mengunggah konten yang melanggar hukum atau hak pihak ketiga</li>
                <li>Menggunakan layanan untuk tujuan yang melanggar hukum</li>
                <li>Mengganggu atau merusak layanan</li>
                <li>Mencoba mengakses akun pengguna lain tanpa izin</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Pembayaran dan Pengembalian Dana</h2>
              <p className="text-muted-foreground">
                Untuk langganan berbayar:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Pembayaran diproses melalui gateway pembayaran yang aman</li>
                <li>Langganan diperpanjang otomatis kecuali dibatalkan</li>
                <li>Pengembalian dana dapat diminta dalam 7 hari pertama</li>
                <li>Pembatalan dapat dilakukan kapan saja tanpa biaya tambahan</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Hak Kekayaan Intelektual</h2>
              <p className="text-muted-foreground">
                Semua konten, fitur, dan fungsi layanan ini dilindungi oleh hak cipta, merek dagang, 
                dan hak kekayaan intelektual lainnya.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Pembatasan Tanggung Jawab</h2>
              <p className="text-muted-foreground">
                Layanan disediakan "sebagaimana adanya" tanpa jaminan apa pun. Kami tidak bertanggung 
                jawab atas kerugian yang timbul dari penggunaan layanan.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Penangguhan dan Penghentian</h2>
              <p className="text-muted-foreground">
                Kami berhak untuk menangguhkan atau menghentikan akses Anda ke layanan jika Anda 
                melanggar syarat dan ketentuan ini.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Perubahan Syarat</h2>
              <p className="text-muted-foreground">
                Kami dapat merevisi syarat ini dari waktu ke waktu. Penggunaan berkelanjutan Anda 
                atas layanan setelah perubahan berarti Anda menerima syarat yang direvisi.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Hukum yang Berlaku</h2>
              <p className="text-muted-foreground">
                Syarat ini diatur oleh dan ditafsirkan sesuai dengan hukum yang berlaku di Indonesia.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Hubungi Kami</h2>
              <p className="text-muted-foreground">
                Jika Anda memiliki pertanyaan tentang Syarat & Ketentuan ini, silakan hubungi kami 
                melalui halaman kontak.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;