import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Users, Crown, FileText, AlertCircle, CreditCard, BookOpen, Shield, XCircle, Scale, Phone } from "lucide-react";

const Section = ({ icon, title, children, delay = 0 }: { icon: React.ReactNode; title: string; children: React.ReactNode; delay?: number }) => (
  <div
    className="bg-slate-950/65 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden animate-fade-up"
    style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}
  >
    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
    <h2 className="flex items-center gap-3 text-base font-black text-white uppercase tracking-wider mb-3">
      <span className="p-2 rounded-xl bg-white/10 text-purple-300 shrink-0">{icon}</span>
      {title}
    </h2>
    <div className="text-white/70 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative font-sans text-white">

      {/* Fixed Background */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none hidden md:block"
        style={{ backgroundImage: "url(/img/bgDekstop.webp)" }}
      />
      <div
        className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none block md:hidden"
        style={{ backgroundImage: "url(/img/bgMobile.webp)" }}
      />
      <div className="fixed inset-0 bg-slate-950/70 z-0 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between animate-fade-up">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-bold text-sm tracking-wider uppercase group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali
          </button>
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white drop-shadow">
              Syarat &amp; Ketentuan
            </h1>
            <p className="text-xs text-white/50 mt-0.5 font-semibold">
              Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
            </p>
          </div>
          <div className="w-20" />
        </div>

        {/* Sections */}
        <Section icon={<CheckCircle className="w-5 h-5" />} title="1. Penerimaan Syarat" delay={0.05}>
          <p>
            Dengan mengakses dan menggunakan aplikasi Family Fun Time ini, Anda menerima dan setuju
            untuk terikat oleh syarat dan ketentuan layanan ini.
          </p>
        </Section>

        <Section icon={<FileText className="w-5 h-5" />} title="2. Penggunaan Layanan" delay={0.1}>
          <p>Layanan ini disediakan untuk:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Bermain game Family Fun Time secara online</li>
            <li>Mengelola sesi permainan melalui Admin Panel</li>
            <li>Menampilkan permainan ke layar eksternal</li>
          </ul>
        </Section>

        <Section icon={<Users className="w-5 h-5" />} title="3. Akun Pengguna" delay={0.15}>
          <p>Untuk menggunakan fitur tertentu, Anda harus membuat akun. Anda bertanggung jawab untuk:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Menjaga kerahasiaan kata sandi Anda</li>
            <li>Semua aktivitas yang terjadi di akun Anda</li>
            <li>Memberikan informasi yang akurat dan terkini</li>
            <li>Memberi tahu kami segera jika ada penggunaan tidak sah</li>
          </ul>
        </Section>

        <Section icon={<Crown className="w-5 h-5" />} title="4. Tingkat Langganan" delay={0.2}>
          <p>Layanan kami menawarkan berbagai tingkat langganan:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><b className="text-white">Free:</b> Akses terbatas tanpa login</li>
            <li><b className="text-white">Login:</b> Akses dasar dengan 1 perangkat</li>
            <li><b className="text-white">Paid:</b> Akses penuh dengan beberapa perangkat</li>
            <li><b className="text-white">Premium:</b> Akses unlimited dengan fitur tambahan</li>
          </ul>
        </Section>

        <Section icon={<BookOpen className="w-5 h-5" />} title="5. Konten Pengguna" delay={0.25}>
          <p>Anda bertanggung jawab atas konten yang Anda buat, unggah, atau bagikan melalui layanan. Anda setuju untuk tidak:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Mengunggah konten yang melanggar hukum atau hak pihak ketiga</li>
            <li>Menggunakan layanan untuk tujuan yang melanggar hukum</li>
            <li>Mengganggu atau merusak layanan</li>
            <li>Mencoba mengakses akun pengguna lain tanpa izin</li>
          </ul>
        </Section>

        <Section icon={<CreditCard className="w-5 h-5" />} title="6. Pembayaran dan Pengembalian Dana" delay={0.3}>
          <p>Untuk langganan berbayar:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Pembayaran diproses melalui gateway pembayaran yang aman</li>
            <li>Langganan diperpanjang otomatis kecuali dibatalkan</li>
            <li>Pengembalian dana dapat diminta dalam 7 hari pertama</li>
            <li>Pembatalan dapat dilakukan kapan saja tanpa biaya tambahan</li>
          </ul>
        </Section>

        <Section icon={<Shield className="w-5 h-5" />} title="7. Hak Kekayaan Intelektual" delay={0.35}>
          <p>
            Semua konten, fitur, dan fungsi layanan ini dilindungi oleh hak cipta, merek dagang,
            dan hak kekayaan intelektual lainnya.
          </p>
        </Section>

        <Section icon={<AlertCircle className="w-5 h-5" />} title="8. Pembatasan Tanggung Jawab" delay={0.4}>
          <p>
            Layanan disediakan "sebagaimana adanya" tanpa jaminan apa pun. Kami tidak bertanggung
            jawab atas kerugian yang timbul dari penggunaan layanan.
          </p>
        </Section>

        <Section icon={<XCircle className="w-5 h-5" />} title="9. Penangguhan dan Penghentian" delay={0.45}>
          <p>
            Kami berhak untuk menangguhkan atau menghentikan akses Anda ke layanan jika Anda
            melanggar syarat dan ketentuan ini.
          </p>
        </Section>

        <Section icon={<Scale className="w-5 h-5" />} title="10. Hukum yang Berlaku" delay={0.5}>
          <p>
            Syarat ini diatur oleh dan ditafsirkan sesuai dengan hukum yang berlaku di Indonesia.
          </p>
        </Section>

        <Section icon={<Phone className="w-5 h-5" />} title="11. Hubungi Kami" delay={0.55}>
          <p>
            Jika Anda memiliki pertanyaan tentang Syarat &amp; Ketentuan ini, silakan hubungi kami
            melalui halaman kontak.
          </p>
        </Section>

        <div className="h-4" />
      </div>
    </div>
  );
};

export default Terms;