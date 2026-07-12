import Image from "next/image";
import Link from "next/link";
import {
  IconArrowRight,
  IconBriefcase2,
  IconCalendarCheck,
  IconChartHistogram,
  IconChevronRight,
  IconFileDescription,
  IconLayoutKanban,
  IconMessages,
  IconRefresh,
  IconShieldCheck,
  IconUsersGroup,
} from "@tabler/icons-react";

const painPoints = [
  {
    title: "Absensi masih manual, rawan tidak akurat",
    body: "Karyawan absen di kertas atau grup chat — tidak ada foto, tidak ada titik lokasi, sulit dicek kalau ada yang janggal.",
    icon: IconUsersGroup,
  },
  {
    title: "Jadwal shift bolak-balik di chat",
    body: "Tukar shift dan pengajuan cuti keluar masuk di WhatsApp, manajer harus mengingat sendiri semua perubahan.",
    icon: IconMessages,
  },
  {
    title: "Target tim dihitung ulang manual",
    body: "Rekap penjualan atau produksi disalin ulang ke Excel tiap akhir bulan cuma buat lihat progres target tim.",
    icon: IconChartHistogram,
  },
  {
    title: "Proses HR terasa berat untuk tim kecil",
    body: "Sistem yang terlalu besar membuat implementasi berhenti sebelum tim mendapatkan manfaatnya.",
    icon: IconBriefcase2,
  },
];

const modules = [
  { title: "Absensi foto + lokasi", body: "Karyawan absen dari HP, terverifikasi otomatis pakai foto dan titik lokasi — tanpa alat fingerprint.", icon: IconUsersGroup },
  { title: "Jadwal shift & approval", body: "Manajer atur jadwal shift, approval tukar shift dan cuti, semua kelihatan di satu kalender tim.", icon: IconCalendarCheck },
  { title: "Target tim otomatis", body: "Target penjualan atau produksi otomatis terisi dari data transaksi harian — tanpa rekap manual.", icon: IconChartHistogram },
  { title: "Laporan kehadiran & kinerja", body: "Rekap absensi, keterlambatan, dan progres target langsung jadi laporan yang siap dibaca.", icon: IconLayoutKanban },
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      <header className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="#top" className="flex items-center gap-2.5" aria-label="Altora Teams home">
          <Image src="/altora-teams-logo.svg" alt="Altora Teams" width={38} height={38} className="h-9 w-9 object-contain" priority />
          <span className="text-[15px] font-bold tracking-[-0.03em]">Altora Teams</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--muted)] md:flex" aria-label="Primary navigation">
          <Link href="#problems" className="transition-colors hover:text-[var(--blue)]">Masalah</Link>
          <Link href="#implementation" className="transition-colors hover:text-[var(--blue)]">Implementasi</Link>
          <Link href="#case-study" className="transition-colors hover:text-[var(--blue)]">Contoh</Link>
          <Link href="#comparison" className="transition-colors hover:text-[var(--blue)]">Perbandingan</Link>
        </nav>
        <Link href="#contact" className="rounded-full bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0">
          Mulai percakapan
        </Link>
      </header>

      <section id="top" className="hero-grid relative mx-auto grid min-h-[calc(100dvh-72px)] max-w-7xl items-center gap-10 px-5 pb-14 pt-12 sm:px-8 lg:grid-cols-[1.02fr_.98fr] lg:pt-16">
        <div className="relative z-10 max-w-2xl animate-rise">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.18em] text-[var(--blue)]">Absensi, Jadwal & Target Tim untuk Perusahaan</p>
          <h1 className="max-w-[14ch] text-5xl font-bold tracking-[-0.07em] text-[var(--ink)] sm:text-6xl lg:text-7xl lg:leading-[0.94]">
            Absensi, jadwal, sampai target tim, beres.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--muted)]">
            Karyawan absen dari HP dengan foto+lokasi, jadwal shift diatur manajer, target tim otomatis terisi dari data transaksi — tanpa Excel.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="#implementation" className="inline-flex items-center gap-2 rounded-full bg-[var(--blue)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(30,100,255,.22)] transition-transform hover:-translate-y-0.5 active:translate-y-0">
              Lihat cara kerja <IconArrowRight size={17} stroke={2} />
            </Link>
            <Link href="#comparison" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--blue)] hover:text-[var(--blue)]">
              Bandingkan kondisi
            </Link>
          </div>
        </div>

        <div className="relative animate-rise-delayed lg:min-h-[590px]">
          <div className="absolute inset-x-[11%] top-[7%] h-[78%] rounded-[2rem] bg-[var(--blue-soft)]" />
          <div className="absolute right-[9%] top-[2%] h-28 w-28 rounded-full border-[18px] border-[var(--blue)]/15" />
          <div className="relative mx-auto flex min-h-[500px] max-w-[530px] flex-col justify-between rounded-[2rem] border border-white/80 bg-white p-7 shadow-[0_28px_80px_rgba(24,48,82,.13)] sm:p-9">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-[var(--ink)]">Satu ritme untuk seluruh tim</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Dari data dasar sampai keputusan harian.</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ink)]">
                <Image src="/altora-teams-logo.svg" alt="" width={26} height={26} className="h-6 w-6 brightness-0 invert" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1.2fr_.8fr]">
              <article className="rounded-2xl bg-[var(--ink)] p-5 text-white">
                <p className="text-sm font-semibold">Lihat konteks sebelum meminta update.</p>
                <p className="mt-7 text-3xl font-bold tracking-[-0.06em]">Absensi, jadwal, target.</p>
                <div className="mt-6 h-px bg-white/20" />
                <p className="mt-4 text-sm leading-6 text-white/65">Semua orang tahu apa yang perlu dilakukan dan siapa yang memutuskan.</p>
              </article>
              <article className="rounded-2xl bg-[var(--blue)] p-5 text-white">
                <IconShieldCheck size={25} stroke={1.7} />
                <p className="mt-12 text-sm font-semibold leading-6">Absensi foto+lokasi membuat kehadiran bisa ditelusuri.</p>
              </article>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[var(--line)] px-4 py-4">
                <IconFileDescription size={20} className="text-[var(--blue)]" stroke={1.8} />
                <p className="mt-4 text-sm font-bold">Data karyawan</p>
              </div>
              <div className="rounded-2xl border border-[var(--line)] px-4 py-4">
                <IconRefresh size={20} className="text-[var(--blue)]" stroke={1.8} />
                <p className="mt-4 text-sm font-bold">Serah terima jelas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problems" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-[-0.055em] sm:text-5xl">Masalah operasional tidak selalu terlihat seperti masalah HR.</h2>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">Biasanya ia muncul sebagai pekerjaan berulang, informasi yang terlambat, dan keputusan yang harus dicari kembali.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-[1.2fr_.8fr_.8fr]">
          {painPoints.map((item, index) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className={`group rounded-[1.25rem] border border-[var(--line)] p-6 transition-transform hover:-translate-y-1 ${index === 0 ? "bg-[var(--blue-soft)] lg:row-span-2" : "bg-white"}`}>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${index === 0 ? "bg-[var(--blue)] text-white" : "bg-[var(--paper)] text-[var(--blue)]"}`}><Icon size={22} stroke={1.7} /></div>
                <h3 className="mt-12 text-xl font-bold tracking-[-0.035em]">{item.title}</h3>
                <p className="mt-3 leading-7 text-[var(--muted)]">{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="implementation" className="bg-[var(--ink)] py-20 text-white lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[#94b8ff]">Implementasi yang realistis</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.055em] sm:text-5xl">Tidak perlu memindahkan semua proses dalam satu minggu.</h2>
            <p className="mt-5 text-lg leading-8 text-white/65">Kami mulai dari alur yang paling sering membuat tim berhenti, lalu membangun kebiasaan kerja yang bisa dipakai setiap hari.</p>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-[.8fr_1.2fr_1fr]">
            <article className="rounded-[1.25rem] bg-white/8 p-6">
              <p className="text-sm font-semibold text-[#94b8ff]">Pemetaan organisasi</p>
              <p className="mt-12 text-2xl font-bold tracking-[-0.04em]">Tetapkan data inti, peran, dan approval owner.</p>
            </article>
            <article className="rounded-[1.25rem] bg-[var(--blue)] p-6 sm:p-8">
              <IconLayoutKanban size={30} stroke={1.7} />
              <p className="mt-14 max-w-md text-3xl font-bold tracking-[-0.05em]">Konfigurasikan workflow sesuai cara kerja tim, bukan sebaliknya.</p>
            </article>
            <article className="rounded-[1.25rem] bg-white/8 p-6">
              <p className="text-sm font-semibold text-[#94b8ff]">Go live bertahap</p>
              <p className="mt-12 text-2xl font-bold tracking-[-0.04em]">Uji alur, kumpulkan masukan, lalu perluas ke modul berikutnya.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="case-study" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-[var(--blue)]">Contoh implementasi</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.055em] sm:text-5xl">Satu masalah nyata, beberapa alur yang tersambung.</h2>
          </div>
          <p className="max-w-xl text-lg leading-8 text-[var(--muted)]">Skenario untuk perusahaan dengan beberapa cabang, yang sebelumnya rekap absensi dan target tim lewat WhatsApp dan Excel.</p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
          <article className="rounded-[1.5rem] bg-[var(--blue-soft)] p-7 sm:p-10">
            <p className="text-sm font-semibold text-[var(--blue)]">Kondisi awal</p>
            <h3 className="mt-5 max-w-xl text-3xl font-bold tracking-[-0.05em]">HR rekap absensi dari WhatsApp, lalu hitung target tim manual di Excel tiap akhir bulan.</h3>
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-5"><p className="text-sm font-bold">Yang ditata lebih dulu</p><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Data karyawan, jadwal shift per cabang, dan approval izin/cuti.</p></div>
              <div className="rounded-2xl bg-white p-5"><p className="text-sm font-bold">Yang menyusul</p><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Absensi foto+lokasi harian, lalu target tim otomatis dari data transaksi.</p></div>
            </div>
          </article>
          <article className="rounded-[1.5rem] bg-[var(--ink)] p-7 text-white sm:p-10">
            <p className="text-sm font-semibold text-[#94b8ff]">Cara Altora Teams membantu</p>
            <div className="mt-10 space-y-7">
              {["Absensi difoto dan titik lokasi otomatis tercatat tiap karyawan clock-in/out.", "Jadwal shift diatur manajer, karyawan tinggal cek dari HP masing-masing.", "Target tim otomatis terisi dari data transaksi harian — tanpa input dobel."].map((item) => (
                <div key={item} className="flex gap-4"><IconChevronRight size={21} className="mt-0.5 shrink-0 text-[#94b8ff]" /><p className="text-lg leading-7 text-white/80">{item}</p></div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section id="comparison" className="bg-[#edf4ff] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-[-0.055em] sm:text-5xl">Sebelum dan sesudah tim punya satu sistem kerja.</h2>
            <p className="mt-5 text-lg leading-8 text-[var(--muted)]">Perbedaannya bukan sekadar lebih digital. Tim mendapat konteks yang sama saat harus mengambil keputusan.</p>
          </div>
          <div className="mt-12 grid overflow-hidden rounded-[1.5rem] border border-[#c9dcff] bg-white lg:grid-cols-2">
            <div className="p-7 sm:p-10">
              <p className="text-sm font-semibold text-[var(--muted)]">Sebelum Altora Teams</p>
              <div className="mt-8 space-y-6 text-lg leading-7 text-[var(--muted)]">
                <p>Absensi dicatat manual, rawan tidak akurat.</p>
                <p>Jadwal shift bolak-balik di grup chat.</p>
                <p>Target tim dihitung ulang manual tiap akhir bulan.</p>
                <p>Owner tidak tahu kondisi tim secara real-time.</p>
              </div>
            </div>
            <div className="bg-[var(--ink)] p-7 text-white sm:p-10">
              <p className="text-sm font-semibold text-[#94b8ff]">Dengan Altora Teams</p>
              <div className="mt-8 space-y-6 text-lg leading-7 text-white/80">
                <p>Absensi foto+lokasi otomatis tercatat dari HP karyawan.</p>
                <p>Jadwal shift dan approval izin dalam satu kalender tim.</p>
                <p>Target tim otomatis terisi dari data transaksi harian.</p>
                <p>Owner pantau kehadiran dan progres tim kapan saja.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div><h2 className="text-3xl font-bold tracking-[-0.055em] sm:text-5xl">Mulai dari kebutuhan tim hari ini.</h2><p className="mt-5 text-lg leading-8 text-[var(--muted)]">Altora Teams bisa mulai dari absensi harian, lalu tumbuh ke jadwal shift dan target tim otomatis.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {modules.map((module, index) => { const Icon = module.icon; return <article key={module.title} className={`rounded-[1.25rem] p-6 ${index === 0 ? "bg-[var(--blue)] text-white" : "border border-[var(--line)] bg-white"}`}><Icon size={24} stroke={1.7} className={index === 0 ? "text-white" : "text-[var(--blue)]"} /><h3 className="mt-10 text-xl font-bold tracking-[-0.03em]">{module.title}</h3><p className={`mt-3 text-sm leading-6 ${index === 0 ? "text-white/75" : "text-[var(--muted)]"}`}>{module.body}</p></article>; })}
          </div>
        </div>
      </section>

      <section id="contact" className="mx-5 mb-5 rounded-[1.75rem] bg-[var(--blue)] px-6 py-14 text-white sm:mx-8 sm:px-10 lg:mx-auto lg:max-w-7xl lg:px-16 lg:py-20">
        <div className="max-w-3xl"><p className="text-sm font-semibold text-white/70">Altora Teams</p><h2 className="mt-4 text-4xl font-bold tracking-[-0.06em] sm:text-6xl">Mari rapikan cara tim Anda bekerja.</h2><p className="mt-5 max-w-xl text-lg leading-8 text-white/80">Mulai dengan percakapan tentang workflow yang paling sering membuat pekerjaan berhenti.</p><Link href="mailto:hello@altora.my.id?subject=Altora%20Teams%20consultation" className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0">Hubungi Altora Teams <IconArrowRight size={17} stroke={2} /></Link></div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:px-8"><div className="flex items-center gap-2"><Image src="/altora-teams-logo.svg" alt="" width={22} height={22} className="h-5 w-5" /><span>Altora Teams</span></div><p>Absensi, jadwal, dan target tim perusahaan, dalam satu aplikasi.</p></footer>
    </main>
  );
}
