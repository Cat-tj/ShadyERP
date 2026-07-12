import Image from "next/image";
import Link from "next/link";
import {
  IconArrowRight,
  IconBrandWhatsapp,
  IconBuildingStore,
  IconCalendarCheck,
  IconCamera,
  IconChartBar,
  IconCheck,
  IconChevronRight,
  IconClock,
  IconFileDescription,
  IconMail,
  IconMapPin,
  IconMessages,
  IconRefresh,
  IconShieldCheck,
  IconTarget,
  IconUsersGroup,
} from "@tabler/icons-react";
import { PageEffects } from "./effects";

const WA_LINK =
  "https://wa.me/6285190911170?text=Halo%20Altora%2C%20saya%20mau%20tanya%20soal%20Altora%20Teams%20(absensi%20%26%20jadwal%20tim)";

const painPoints = [
  {
    title: "Absensi masih manual, rawan tidak akurat",
    body: "Karyawan absen di kertas atau grup chat — tidak ada foto, tidak ada titik lokasi, sulit dicek kalau ada yang janggal.",
    icon: IconCamera,
  },
  {
    title: "Jadwal shift bolak-balik di chat",
    body: "Tukar shift dan pengajuan cuti keluar masuk di WhatsApp, manajer harus mengingat sendiri semua perubahan.",
    icon: IconMessages,
  },
  {
    title: "Target tim dihitung ulang manual",
    body: "Rekap penjualan atau produksi disalin ulang ke Excel tiap akhir bulan cuma buat lihat progres target tim.",
    icon: IconChartBar,
  },
  {
    title: "Owner tidak tahu kondisi tim hari ini",
    body: "Siapa yang sudah masuk, siapa telat, target sudah sampai mana — semua baru ketahuan pas rekap akhir bulan.",
    icon: IconUsersGroup,
  },
];

const steps = [
  {
    no: "01",
    title: "Undang tim",
    body: "Karyawan cukup buka dari HP masing-masing — tanpa mesin fingerprint, tanpa alat tambahan.",
  },
  {
    no: "02",
    title: "Atur jadwal & aturan absen",
    body: "Manajer susun jadwal shift per cabang dan tentukan jam masuk. Karyawan langsung lihat jadwalnya sendiri.",
  },
  {
    no: "03",
    title: "Pantau jalan sendiri",
    body: "Absensi masuk real-time dengan foto+lokasi, target tim terisi otomatis dari data transaksi. Tanpa rekap manual.",
  },
];

const features = [
  {
    id: "absensi",
    kicker: "Absensi",
    title: "Foto + titik lokasi, sekali pencet dari HP",
    body: "Tiap clock-in/out otomatis menyimpan foto dan lokasi karyawan. Telat atau absen dari luar area langsung kelihatan — tanpa mesin fingerprint.",
    icon: IconCamera,
  },
  {
    id: "jadwal",
    kicker: "Jadwal shift",
    title: "Satu kalender tim, bukan seratus chat",
    body: "Manajer atur shift per cabang, karyawan cek jadwal dari HP. Tukar shift dan izin lewat approval yang tercatat rapi.",
    icon: IconCalendarCheck,
  },
  {
    id: "target",
    kicker: "Target tim",
    title: "Progres target terisi otomatis dari transaksi",
    body: "Target penjualan bulanan tim langsung terhitung dari data kasir hari itu juga — tanpa salin-tempel ke Excel tiap akhir bulan.",
    icon: IconTarget,
  },
  {
    id: "laporan",
    kicker: "Laporan",
    title: "Rekap kehadiran & kinerja siap dibaca",
    body: "Kehadiran, keterlambatan, dan progres target jadi laporan yang bisa langsung dikirim — bukan tumpukan catatan yang harus diolah dulu.",
    icon: IconFileDescription,
  },
];

const attendanceFeed = [
  { name: "Sinta A.", initial: "SA", time: "07:52", note: "±30 m dari toko", status: "Tepat waktu", late: false },
  { name: "Bagus R.", initial: "BR", time: "07:58", note: "±12 m dari toko", status: "Tepat waktu", late: false },
  { name: "Dewi K.", initial: "DK", time: "08:14", note: "±25 m dari toko", status: "Telat 14 mnt", late: true },
];

const ecosystem = [
  { label: "Altora Kasir", href: "https://altora.my.id" },
  { label: "Altora Cafe", href: "https://cafe.altora.my.id" },
  { label: "Altora Toko", href: "https://toko.altora.my.id" },
  { label: "Altora Laundry", href: "https://laundry.altora.my.id" },
];

const marqueeItems = [
  "Absensi foto + lokasi",
  "Jadwal shift per cabang",
  "Approval tukar shift & cuti",
  "Target terisi otomatis dari transaksi",
  "Laporan kehadiran & kinerja",
  "Multi-cabang, satu pantauan",
];

export default function Home() {
  return (
    <main className="overflow-x-clip bg-[var(--paper)] text-[var(--ink)]">
      <PageEffects />

      {/* ===== Header ===== */}
      <div className="site-header">
        <header className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="#top" className="flex items-center gap-2.5" aria-label="Altora Teams — kembali ke atas">
            <Image src="/altora-teams-logo.svg" alt="" width={36} height={36} className="h-9 w-9 object-contain" priority />
            <span className="text-[15px] font-bold tracking-[-0.03em]">Altora <span className="text-[var(--blue)]">Teams</span></span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--muted)] lg:flex" aria-label="Navigasi utama">
            <Link href="#masalah" className="transition-colors hover:text-[var(--blue)]">Masalah</Link>
            <Link href="#cara-kerja" className="transition-colors hover:text-[var(--blue)]">Cara kerja</Link>
            <Link href="#fitur" className="transition-colors hover:text-[var(--blue)]">Fitur</Link>
            <Link href="#perbandingan" className="transition-colors hover:text-[var(--blue)]">Perbandingan</Link>
          </nav>
          <div className="flex items-center gap-2.5">
            <a href="https://altora.my.id/login" className="hidden rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--blue)] hover:text-[var(--blue)] sm:inline-flex">
              Masuk
            </a>
            <a href={WA_LINK} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0">
              <IconBrandWhatsapp size={17} stroke={2} /> Hubungi kami
            </a>
          </div>
        </header>
      </div>

      {/* ===== Hero ===== */}
      <section id="top" className="relative">
        <div className="hero-bg" aria-hidden="true"><span className="hero-glow-left" /></div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 lg:min-h-[calc(100dvh-70px)] lg:grid-cols-[1.02fr_.98fr] lg:pb-20 lg:pt-8">
          <div className="relative z-10 max-w-2xl animate-rise">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/80 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--blue)]">
              <span className="dot-live inline-block h-1.5 w-1.5 rounded-full bg-[var(--mint)] text-[var(--mint)]" aria-hidden="true" />
              Absensi · Jadwal · Target Tim
            </p>
            <h1 className="max-w-[15ch] text-5xl font-bold leading-[1.02] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
              Absensi, jadwal, sampai target tim, <span className="text-gradient">beres.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--muted)]">
              Karyawan absen dari HP dengan foto+lokasi, jadwal shift diatur manajer, target tim otomatis terisi dari data transaksi — tanpa Excel.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href={WA_LINK} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-[var(--blue)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(30,100,255,.28)] transition-transform hover:-translate-y-0.5 active:translate-y-0">
                <IconBrandWhatsapp size={18} stroke={2} /> Chat via WhatsApp
              </a>
              <Link href="#cara-kerja" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-6 py-3.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--blue)] hover:text-[var(--blue)]">
                Lihat cara kerja <IconArrowRight size={17} stroke={2} />
              </Link>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-[var(--line)] pt-7">
              <div>
                <dt className="text-xs font-medium text-[var(--muted)]">Setup absensi</dt>
                <dd className="mt-1 text-2xl font-bold tracking-[-0.04em]">± 3 <span className="text-base font-semibold text-[var(--muted)]">menit</span></dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[var(--muted)]">Bukti kehadiran</dt>
                <dd className="mt-1 text-2xl font-bold tracking-[-0.04em]">Foto<span className="text-base font-semibold text-[var(--muted)]">+lokasi</span></dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[var(--muted)]">Rekap manual</dt>
                <dd className="mt-1 text-2xl font-bold tracking-[-0.04em]">0 <span className="text-base font-semibold text-[var(--muted)]">Excel</span></dd>
              </div>
            </dl>
          </div>

          {/* Mockup dasbor tim + kartu absen HP */}
          <div className="relative animate-rise-2 lg:min-h-[600px]">
            <div className="absolute inset-x-[6%] top-[5%] h-[82%] rounded-[2.25rem] bg-[var(--blue-soft)]" aria-hidden="true" />
            <div className="relative mx-auto max-w-[560px] pt-6" role="img" aria-label="Contoh dasbor Altora Teams: absensi hari ini dengan foto dan lokasi, jadwal shift, dan progres target tim yang terisi otomatis dari transaksi">
              <div className="float-slower rounded-[1.75rem] border border-white/80 bg-white p-6 shadow-[0_30px_90px_rgba(14,38,82,.16)] sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">Tim · Hari ini</p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">Cabang BSD — Sabtu, 12 Jul</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f8f1] px-2.5 py-1 text-[11px] font-bold text-[#0a8f63]">
                    <span className="dot-live inline-block h-1.5 w-1.5 rounded-full bg-[#0a8f63] text-[#0a8f63]" aria-hidden="true" /> Live
                  </span>
                </div>

                <div className="mt-5 space-y-2.5">
                  {attendanceFeed.map((row) => (
                    <div key={row.name} className="flex items-center gap-3 rounded-2xl border border-[var(--line)] px-3.5 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--blue-soft)] text-xs font-bold text-[var(--blue-deep)]">{row.initial}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold">{row.name} <span className="font-medium text-[var(--muted)]">· masuk {row.time}</span></p>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--muted)]">
                          <IconCamera size={12} stroke={2} /> foto <span aria-hidden="true">·</span> <IconMapPin size={12} stroke={2} /> {row.note}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${row.late ? "bg-[#fdf1dc] text-[#a16207]" : "bg-[#e7f8f1] text-[#0a8f63]"}`}>{row.status}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-[var(--blue-softer)] p-4">
                  <div className="flex items-center justify-between text-[13px]">
                    <p className="font-bold">Target tim · Juli</p>
                    <p className="mono font-bold text-[var(--blue-deep)]">72%</p>
                  </div>
                  <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-white">
                    <div className="bar-anim h-full rounded-full bg-gradient-to-r from-[var(--blue)] to-[#6ea1ff]" style={{ "--bar-w": "72%" } as React.CSSProperties} />
                  </div>
                  <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                    <IconRefresh size={12} stroke={2} /> Terisi otomatis dari transaksi kasir — update terakhir 2 menit lalu
                  </p>
                </div>
              </div>

              {/* Kartu absen dari HP */}
              <div className="float-slow absolute -bottom-8 -left-2 w-[220px] rounded-[1.5rem] border border-white/80 bg-white p-4 shadow-[0_24px_60px_rgba(14,38,82,.18)] sm:-left-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Absen masuk</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ink)] text-sm font-bold text-white">BR</span>
                  <div>
                    <p className="text-sm font-bold">Bagus R.</p>
                    <p className="mono text-xs text-[var(--muted)]">07:58</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5 text-[11px] text-[var(--muted)]">
                  <p className="flex items-center gap-1.5"><IconCamera size={13} stroke={2} className="text-[var(--blue)]" /> Foto terverifikasi</p>
                  <p className="flex items-center gap-1.5"><IconMapPin size={13} stroke={2} className="text-[var(--blue)]" /> ±12 m dari toko</p>
                </div>
                <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#e7f8f1] px-2.5 py-1 text-[10px] font-bold text-[#0a8f63]">
                  <IconCheck size={12} stroke={2.5} /> Tercatat
                </p>
              </div>

              <div className="absolute -right-2 -top-1 hidden rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-[0_18px_44px_rgba(14,38,82,.14)] sm:block">
                <p className="flex items-center gap-1.5 text-[11px] font-bold"><IconCalendarCheck size={14} stroke={2} className="text-[var(--blue)]" /> Tukar shift disetujui</p>
                <p className="mt-0.5 text-[10px] text-[var(--muted)]">Dewi ↔ Sinta · Minggu pagi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Marquee ===== */}
      <div className="marquee border-y border-[var(--line)] bg-[var(--ink)] py-3.5" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center">
              {marqueeItems.map((item) => (
                <span key={`${dup}-${item}`} className="flex items-center gap-3 whitespace-nowrap px-5 text-[13px] font-semibold text-white/75">
                  <span className="h-1 w-1 rounded-full bg-[#6ea1ff]" /> {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ===== Masalah ===== */}
      <section id="masalah" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="max-w-2xl" data-reveal>
          <p className="text-sm font-semibold text-[var(--blue)]">Kenapa Altora Teams ada</p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.055em] sm:text-5xl">Masalah operasional tidak selalu terlihat seperti masalah HR.</h2>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">Biasanya ia muncul sebagai rekap yang dikerjakan ulang, chat yang harus discroll, dan angka yang baru ketahuan pas akhir bulan.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-[1.2fr_.8fr_.8fr]">
          {painPoints.map((item, index) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                data-reveal
                style={{ "--reveal-delay": `${index * 0.07}s` } as React.CSSProperties}
                className={`feature-card group rounded-[1.25rem] border border-[var(--line)] p-6 ${index === 0 ? "bg-[var(--blue-soft)] lg:row-span-2" : "bg-white"}`}
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${index === 0 ? "bg-[var(--blue)] text-white" : "bg-[var(--paper)] text-[var(--blue)]"}`}><Icon size={22} stroke={1.7} /></div>
                <h3 className="mt-12 text-xl font-bold tracking-[-0.035em]">{item.title}</h3>
                <p className="mt-3 leading-7 text-[var(--muted)]">{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ===== Cara kerja ===== */}
      <section id="cara-kerja" className="bg-[var(--ink)] py-20 text-white lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl" data-reveal>
            <p className="text-sm font-semibold text-[#94b8ff]">Cara kerja</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.055em] sm:text-5xl">Jalan di hari yang sama, bukan proyek berbulan-bulan.</h2>
            <p className="mt-5 text-lg leading-8 text-white/65">Tidak butuh mesin fingerprint, tidak butuh pelatihan panjang. Kalau tim kamu bisa pakai WhatsApp, tim kamu bisa pakai Altora Teams.</p>
          </div>
          <div className="mt-14 grid gap-10 lg:grid-cols-3 lg:gap-6">
            {steps.map((step, index) => (
              <article
                key={step.no}
                data-reveal
                style={{ "--reveal-delay": `${index * 0.1}s` } as React.CSSProperties}
                className={`relative ${index < steps.length - 1 ? "step-line" : "step-last"}`}
              >
                <span className="mono inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--blue)] text-sm font-bold">{step.no}</span>
                <h3 className="mt-6 text-2xl font-bold tracking-[-0.04em]">{step.title}</h3>
                <p className="mt-3 max-w-sm leading-7 text-white/65">{step.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-14 grid gap-4 rounded-[1.5rem] bg-white/6 p-6 sm:grid-cols-3 sm:p-8" data-reveal>
            {[
              { icon: IconShieldCheck, text: "Data tiap perusahaan terpisah dan aman — bagian dari platform Altora." },
              { icon: IconBuildingStore, text: "Multi-cabang dari awal: jadwal dan absensi per cabang, pantauan tetap satu." },
              { icon: IconClock, text: "Absen real-time — bukan disalin operator keesokan harinya." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <p key={item.text} className="flex items-start gap-3 text-sm leading-6 text-white/75">
                  <Icon size={20} stroke={1.8} className="mt-0.5 shrink-0 text-[#94b8ff]" /> {item.text}
                </p>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Fitur ===== */}
      <section id="fitur" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="max-w-2xl" data-reveal>
          <p className="text-sm font-semibold text-[var(--blue)]">Fitur inti</p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.055em] sm:text-5xl">Empat hal yang berhenti kamu kerjakan manual.</h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.id}
                data-reveal
                style={{ "--reveal-delay": `${(index % 2) * 0.08}s` } as React.CSSProperties}
                className="feature-card flex flex-col justify-between rounded-[1.5rem] border border-[var(--line)] bg-white p-7 sm:p-9"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[var(--blue-softer)] px-3 py-1 text-xs font-bold text-[var(--blue-deep)]">{feature.kicker}</span>
                    <Icon size={26} stroke={1.6} className="text-[var(--blue)]" />
                  </div>
                  <h3 className="mt-7 max-w-md text-2xl font-bold tracking-[-0.045em]">{feature.title}</h3>
                  <p className="mt-4 max-w-lg leading-7 text-[var(--muted)]">{feature.body}</p>
                </div>

                {feature.id === "absensi" && (
                  <div className="mt-8 space-y-2 rounded-2xl bg-[var(--paper)] p-4" aria-hidden="true">
                    <div className="flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5 text-xs">
                      <span className="flex items-center gap-2 font-semibold"><IconCamera size={14} className="text-[var(--blue)]" /> Foto pas absen</span>
                      <span className="font-bold text-[#0a8f63]">✓ otomatis</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5 text-xs">
                      <span className="flex items-center gap-2 font-semibold"><IconMapPin size={14} className="text-[var(--blue)]" /> Titik lokasi</span>
                      <span className="font-bold text-[#0a8f63]">✓ otomatis</span>
                    </div>
                  </div>
                )}
                {feature.id === "jadwal" && (
                  <div className="mt-8 rounded-2xl bg-[var(--paper)] p-4" aria-hidden="true">
                    <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-[var(--muted)]">
                      {["S", "S", "R", "K", "J", "S", "M"].map((d, i) => (
                        <span key={i} className={`rounded-lg py-2 ${i === 5 ? "bg-[var(--blue)] text-white" : "bg-white"}`}>{d}</span>
                      ))}
                    </div>
                    <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--muted)]">
                      <IconCheck size={13} className="text-[#0a8f63]" /> Tukar shift Dewi ↔ Sinta disetujui
                    </p>
                  </div>
                )}
                {feature.id === "target" && (
                  <div className="mt-8 space-y-3 rounded-2xl bg-[var(--paper)] p-4" aria-hidden="true">
                    {[
                      { label: "Cabang BSD", w: "84%" },
                      { label: "Cabang Serpong", w: "61%" },
                    ].map((bar) => (
                      <div key={bar.label}>
                        <div className="flex justify-between text-[11px] font-semibold"><span>{bar.label}</span><span className="mono text-[var(--blue-deep)]">{bar.w}</span></div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white">
                          <div className="bar-anim h-full rounded-full bg-gradient-to-r from-[var(--blue)] to-[#6ea1ff]" style={{ "--bar-w": bar.w } as React.CSSProperties} />
                        </div>
                      </div>
                    ))}
                    <p className="text-[10px] text-[var(--muted)]">Dari data transaksi kasir — bukan input manual</p>
                  </div>
                )}
                {feature.id === "laporan" && (
                  <div className="mt-8 rounded-2xl bg-[var(--paper)] p-4 text-[11px]" aria-hidden="true">
                    <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-[var(--line)] font-semibold">
                      <span className="bg-white px-3 py-2 text-[var(--muted)]">Nama</span>
                      <span className="bg-white px-3 py-2 text-[var(--muted)]">Hadir</span>
                      <span className="bg-white px-3 py-2 text-[var(--muted)]">Telat</span>
                      <span className="bg-white px-3 py-2 font-bold">Sinta A.</span>
                      <span className="mono bg-white px-3 py-2">26 hari</span>
                      <span className="mono bg-white px-3 py-2">1×</span>
                      <span className="bg-white px-3 py-2 font-bold">Bagus R.</span>
                      <span className="mono bg-white px-3 py-2">25 hari</span>
                      <span className="mono bg-white px-3 py-2">3×</span>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* ===== Cerita implementasi ===== */}
      <section id="cerita" className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:pb-28">
        <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-end" data-reveal>
          <div>
            <p className="text-sm font-semibold text-[var(--blue)]">Contoh implementasi</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.055em] sm:text-5xl">Satu masalah nyata, beberapa alur yang tersambung.</h2>
          </div>
          <p className="max-w-xl text-lg leading-8 text-[var(--muted)]">Skenario untuk perusahaan dengan beberapa cabang, yang sebelumnya rekap absensi dan target tim lewat WhatsApp dan Excel.</p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
          <article className="rounded-[1.5rem] bg-[var(--blue-soft)] p-7 sm:p-10" data-reveal>
            <p className="text-sm font-semibold text-[var(--blue)]">Kondisi awal</p>
            <h3 className="mt-5 max-w-xl text-3xl font-bold tracking-[-0.05em]">HR rekap absensi dari WhatsApp, lalu hitung target tim manual di Excel tiap akhir bulan.</h3>
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-5"><p className="text-sm font-bold">Yang ditata lebih dulu</p><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Data karyawan, jadwal shift per cabang, dan approval izin/cuti.</p></div>
              <div className="rounded-2xl bg-white p-5"><p className="text-sm font-bold">Yang menyusul</p><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Absensi foto+lokasi harian, lalu target tim otomatis dari data transaksi.</p></div>
            </div>
          </article>
          <article className="rounded-[1.5rem] bg-[var(--ink)] p-7 text-white sm:p-10" data-reveal style={{ "--reveal-delay": "0.1s" } as React.CSSProperties}>
            <p className="text-sm font-semibold text-[#94b8ff]">Cara Altora Teams membantu</p>
            <div className="mt-10 space-y-7">
              {["Absensi difoto dan titik lokasi otomatis tercatat tiap karyawan clock-in/out.", "Jadwal shift diatur manajer, karyawan tinggal cek dari HP masing-masing.", "Target tim otomatis terisi dari data transaksi harian — tanpa input dobel."].map((item) => (
                <div key={item} className="flex gap-4"><IconChevronRight size={21} className="mt-0.5 shrink-0 text-[#94b8ff]" /><p className="text-lg leading-7 text-white/80">{item}</p></div>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* ===== Perbandingan ===== */}
      <section id="perbandingan" className="bg-[#e9f1ff] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl" data-reveal>
            <h2 className="text-3xl font-bold tracking-[-0.055em] sm:text-5xl">Sebelum dan sesudah tim punya satu sistem kerja.</h2>
            <p className="mt-5 text-lg leading-8 text-[var(--muted)]">Perbedaannya bukan sekadar lebih digital. Tim mendapat konteks yang sama saat harus mengambil keputusan.</p>
          </div>
          <div className="mt-12 grid overflow-hidden rounded-[1.5rem] border border-[#c9dcff] bg-white shadow-[0_24px_70px_rgba(14,38,82,.08)] lg:grid-cols-2" data-reveal>
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
              <div className="mt-8 space-y-6 text-lg leading-7">
                {["Absensi foto+lokasi otomatis tercatat dari HP karyawan.", "Jadwal shift dan approval izin dalam satu kalender tim.", "Target tim otomatis terisi dari data transaksi harian.", "Owner pantau kehadiran dan progres tim kapan saja."].map((item) => (
                  <p key={item} className="flex gap-3 text-white/85"><IconCheck size={20} stroke={2.2} className="mt-1 shrink-0 text-[#7cf1c3]" /> {item}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA penutup ===== */}
      <section id="kontak" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[var(--blue-deep)] via-[var(--blue)] to-[#4b86ff] px-6 py-16 text-white sm:px-12 lg:px-16 lg:py-20" data-reveal>
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" aria-hidden="true" />
          <div className="absolute -bottom-32 right-24 h-72 w-72 rounded-full border-[22px] border-white/10" aria-hidden="true" />
          <div className="relative max-w-3xl">
            <p className="text-sm font-semibold text-white/75">Altora Teams</p>
            <h2 className="mt-4 max-w-[18ch] text-4xl font-bold tracking-[-0.055em] sm:text-6xl">Mari rapikan cara tim Anda bekerja.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/85">Ceritakan dulu kondisi tim kamu — berapa cabang, berapa orang, apa yang paling sering bikin repot. Kami bantu petakan mulainya dari mana.</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href={WA_LINK} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[var(--blue-deep)] transition-transform hover:-translate-y-0.5 active:translate-y-0">
                <IconBrandWhatsapp size={18} stroke={2} /> Chat via WhatsApp
              </a>
              <a href="mailto:admin@altora.my.id?subject=Tanya%20Altora%20Teams" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10">
                <IconMail size={18} stroke={2} /> Kirim email
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-[var(--line)] bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Image src="/altora-teams-logo.svg" alt="" width={30} height={30} className="h-7 w-7" />
              <span className="text-[15px] font-bold tracking-[-0.03em]">Altora <span className="text-[var(--blue)]">Teams</span></span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--muted)]">Absensi, jadwal, dan target tim perusahaan, dalam satu aplikasi. Bagian dari platform Altora untuk UMKM Indonesia.</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Ekosistem Altora</p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {ecosystem.map((item) => (
                <a key={item.label} href={item.href} className="rounded-full border border-[var(--line)] px-3.5 py-1.5 text-sm font-medium text-[var(--muted)] transition-colors hover:border-[var(--blue)] hover:text-[var(--blue)]">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--line)]">
          <p className="mx-auto max-w-7xl px-5 py-5 text-xs text-[var(--muted)] sm:px-8">© {new Date().getFullYear()} Altora — teams.altora.my.id</p>
        </div>
      </footer>
    </main>
  );
}
