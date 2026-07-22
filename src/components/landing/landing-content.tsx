import { Fragment } from "react";
import Image from "next/image";
import { VERTICALS, DEFAULT_THEME, type VerticalDef } from "@/lib/verticals";
import { HERO_MOCKS, DEFAULT_HERO_MOCK } from "@/lib/hero-mocks";
import { BusinessShowcase } from "./business-showcase/business-showcase";
import { MobileHighlight } from "./mobile-highlight";
import { LandingScripts } from "./landing-scripts";
import { SiteNav } from "./site-nav";
import { FaqAccordion } from "./faq-accordion";
import { ClockIcon } from "@/components/ui/icons";
import {
  ADDON_SERVICES,
  AUTOMATION_OUTPUTS,
  BENEFIT_BLOCKS,
  COMPARISON_GROUPS,
  PRODUCT_TOUR_TABS,
  TESTIMONIALS,
  type AddonService,
} from "@/lib/landing-data";
import type { FaqItem } from "@/lib/landing-data";

type SpotlightSlide = {
  label: string;
  title: string;
  body: string;
  points: Array<{
    title: string;
    body: string;
  }>;
  screen: "qr" | "finance" | "absen" | "inventory";
  flow?: string[];
};

const spotlightSlides: SpotlightSlide[] = [
  {
    label: "QR meja",
    title: "Pelanggan pesan sendiri, tim tinggal menyiapkan.",
    body:
      "Cetak satu kode QR per meja, tempel di meja fisik. Pelanggan buka menu di HP masing-masing, pilih produk, pesan langsung tanpa nunggu dipanggil pelayan — pesanan langsung masuk ke sistem tanpa dicatat ulang oleh kasir.",
    screen: "qr",
    flow: ["Pelanggan pesan", "Pesanan masuk", "Stok diperiksa", "Tim memproses", "Laporan diperbarui"],
    points: [
      {
        title: "Pesan berkali-kali, bayar sekali.",
        body: "Semua pesanan dari meja yang sama otomatis digabung jadi satu tagihan sampai pelanggan minta bayar.",
      },
      {
        title: "Dapur lihat pesanan real-time.",
        body: "Pesanan langsung muncul di layar kitchen display, kasir tinggal proses pembayaran saat selesai.",
      },
      {
        title: "Stok kepotong otomatis.",
        body: "Begitu pesanan masuk, stok langsung terkunci supaya stok antar meja tetap rapi.",
      },
    ],
  },
  {
    label: "Finance",
    title: "Uang masuk, keluar, dan laba harian kebaca jelas.",
    body:
      "Owner bisa lihat kas hari ini, pengeluaran, hutang supplier, metode bayar, dan ringkasan laba rugi tanpa buka spreadsheet terpisah.",
    screen: "finance",
    points: [
      {
        title: "Kas harian langsung cocok.",
        body: "Penjualan POS, cash, QRIS, dan transfer diringkas per metode bayar untuk bantu tutup kas.",
      },
      {
        title: "Pengeluaran tidak nyelip.",
        body: "Biaya bahan, operasional, gaji, dan kas kecil bisa dicatat dengan kategori sederhana.",
      },
      {
        title: "Laba rugi versi owner.",
        body: "Bukan akuntansi berat, tapi cukup jelas untuk tahu usaha sedang sehat atau bocor.",
      },
    ],
  },
  {
    label: "Absen",
    title: "Shift, absensi, dan telat karyawan masuk satu layar.",
    body:
      "Tim bisa clock-in, owner bisa lihat siapa hadir, telat, izin, atau belum absen tanpa tanya manual di grup chat.",
    screen: "absen",
    points: [
      {
        title: "Clock-in cepat dari HP.",
        body: "Karyawan masuk shift dengan catatan jam, outlet, dan status kehadiran.",
      },
      {
        title: "Ringkasan telat dan izin.",
        body: "Data telat, pulang cepat, izin, dan lembur bisa dilihat untuk evaluasi tim.",
      },
      {
        title: "Cocok untuk multi-outlet.",
        body: "Owner tetap bisa pantau kehadiran cabang tanpa harus ada di lokasi.",
      },
    ],
  },
  {
    label: "Inventory",
    title: "Stok bahan dan produk bergerak otomatis.",
    body:
      "Setiap penjualan, penerimaan stok, transfer antar outlet, dan stock opname masuk ke riwayat supaya stok tidak jadi tebak-tebakan.",
    screen: "inventory",
    points: [
      {
        title: "Stok menipis cepat ketahuan.",
        body: "Produk yang perlu restock naik ke permukaan sebelum benar-benar habis.",
      },
      {
        title: "Transfer antar outlet tercatat.",
        body: "Barang pindah cabang punya jejak, jadi stok pusat dan outlet tetap sinkron.",
      },
      {
        title: "Stock opname lebih ringan.",
        body: "Selisih fisik dan sistem bisa dicatat tanpa bongkar laporan manual.",
      },
    ],
  },
];

const spotlightPreviewByScreen: Record<
  SpotlightSlide["screen"],
  {
    src: string;
    alt: string;
  }
> = {
  qr: {
    src: "/landing-previews/qr-meja.png",
    alt: "Screenshot asli halaman pesan QR meja Altora",
  },
  finance: {
    src: "/landing-previews/finance.png",
    alt: "Screenshot asli halaman ringkasan finance Altora",
  },
  absen: {
    src: "/landing-previews/absen.png",
    alt: "Screenshot asli halaman absensi Altora",
  },
  inventory: {
    src: "/landing-previews/inventory.png",
    alt: "Screenshot asli halaman inventori Altora",
  },
};

function SpotlightPhone({ screen }: { screen: SpotlightSlide["screen"] }) {
  const preview = spotlightPreviewByScreen[screen];

  return (
    <div className={`phone-stage phone-stage-${screen}`} role="img" aria-label={`Mockup iPhone 3D fitur ${screen} Altora`}>
      <div className="phone-shadow" aria-hidden="true"></div>
      {screen === "qr" ? (
        <div className="qr-float-card" aria-hidden="true">
          <span className="qr-label">QR Meja 04</span>
          <span className="qr-box">
            <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
          </span>
        </div>
      ) : (
        <div className="feature-float-card" aria-hidden="true">
          <span className="qr-label">{screen === "finance" ? "Kas hari ini" : screen === "absen" ? "Shift pagi" : "Stok aman"}</span>
          <span className="feature-float-value">
            {screen === "finance" ? "Rp3,4jt" : screen === "absen" ? "12 hadir" : "3 tipis"}
          </span>
          <span className="feature-float-bars">
            <i></i><i></i><i></i>
          </span>
        </div>
      )}
      <div className="order-float-card" aria-hidden="true">
        <span className="order-float-title">
          {screen === "qr" ? "Masuk ke dapur" : screen === "finance" ? "Tutup kas" : screen === "absen" ? "Hadir" : "Restock"}
        </span>
        <span className="order-float-row">
          <b>{screen === "qr" ? "Meja 04" : screen === "finance" ? "Rp3,4jt" : screen === "absen" ? "12/14" : "3 item"}</b>
          <span>{screen === "qr" ? "2 item" : screen === "finance" ? "cocok" : screen === "absen" ? "masuk" : "tipis"}</span>
        </span>
      </div>
      <div className="phone">
        <div className="phone-island"></div>
        <div className="phone-screen phone-screen-preview">
          <div className="phone-preview-clip">
            <Image className="phone-preview-image" src={preview.src} alt={preview.alt} fill sizes="274px" />
          </div>
        </div>
      </div>
    </div>
  );
}

const HERO_OUTPUT_CHIPS = [
  { label: "Stok diperbarui", icon: "box" },
  { label: "Laba tercatat", icon: "chart" },
  { label: "Pelanggan tersimpan", icon: "user" },
  { label: "Laporan siap", icon: "doc" },
] as const;

function OutputIcon({ name }: { name: "box" | "chart" | "user" | "doc" }) {
  const paths: Record<typeof name, React.ReactNode> = {
    box: <path d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5Zm0 0v9L12 21l9-4.5v-9M12 12v9" />,
    chart: <path d="M4 20V10m6 10V4m6 16v-7" />,
    user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />,
    doc: <path d="M6 3h9l4 4v14H6V3Zm9 0v4h4M9 12h6m-6 4h6" />,
  } as Record<"box" | "chart" | "user" | "doc", React.ReactNode>;
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function AddonIcon({ name }: { name: AddonService["icon"] }) {
  const paths: Record<AddonService["icon"], React.ReactNode> = {
    hardware: <path d="M14.7 6.3a3 3 0 0 0-4.2 4.2L3 18l3 3 7.5-7.5a3 3 0 0 0 4.2-4.2l-2.1 2.1-2-2 2.1-2.1Z" />,
    cctv: <path d="M3 8h11l4-3v10l-4-3H3V8Zm0 0v6M17 10.5a2.5 2.5 0 1 1 0 .01M6 17l-1.5 4M9 17l-.8 4" />,
    training: <path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Zm5.5 3v4.7c0 .9 1.6 2.3 3.5 2.3s3.5-1.4 3.5-2.3v-4.7M21 8.5v6" />,
    consulting: <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.4-4 8-9 8-1.4 0-2.7-.3-3.9-.8L3 20l1.1-3.9A7.9 7.9 0 0 1 3 12c0-4.4 4-8 9-8s9 3.6 9 8Z" />,
  };
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function ComparisonCell({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span className="cmp-check" aria-label="Tersedia">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4" /></svg>
      </span>
    );
  }
  if (value === false) {
    return <span className="cmp-dash" aria-label="Tidak tersedia">—</span>;
  }
  return <span className="cmp-value mono">{value}</span>;
}

export function LandingContent({ city, vertical, faqItems }: { city?: string; vertical?: VerticalDef; faqItems?: FaqItem[] }) {
  const displayCity = city ? decodeURIComponent(city).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : "";
  const theme = vertical ? vertical.theme : DEFAULT_THEME;
  const heroMock = vertical ? HERO_MOCKS[vertical.key] : DEFAULT_HERO_MOCK;
  const signupHref = vertical ? "/register" : "#tur-produk";
  const signupLabel = vertical ? "Mulai Gratis" : "Pilih produk";
  const themeVars = {
    "--primary": theme.primary,
    "--primary-dark": theme.deep,
    "--primary-bright": theme.accent,
    "--v-soft": theme.soft,
    "--v-bg": theme.background,
  } as React.CSSProperties;

  return (
    <div className="altora-landing" style={themeVars}>
      <LandingScripts />
      <SiteNav vertical={vertical} />

<main id="top">

  {/* HERO */}
  <section className="hero">
    <div className="hero-glow" aria-hidden="true"></div>
    <div className="hero-dot-grid" aria-hidden="true"></div>
    <div className="wrap hero-grid">
      <div className="hero-copy">
        <span className="eyebrow">
          {vertical ? vertical.eyebrow : `ERP ringan untuk bisnis modern ${displayCity ? `di ${displayCity}` : ""}`}
        </span>
        {vertical ? (
          <h1>
            <span className="sr-only">{vertical.headline}</span>
            <span aria-hidden="true">{vertical.headline}</span>
          </h1>
        ) : displayCity ? (
          <h1>
            <span className="sr-only">Aplikasi Kasir POS &amp; ERP Terbaik di {displayCity} — Altora</span>
            <span aria-hidden="true">
              POS &amp; ERP Terbaik<br />
              <span style={{ backgroundImage: "linear-gradient(135deg, var(--logo-c1), var(--logo-c4))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                di {displayCity}
              </span>
            </span>
          </h1>
        ) : (
          <h1>
            Satu transaksi.<br />
            <span className="hero-headline-accent">Stok, laba, dan laporan langsung beres.</span>
          </h1>
        )}
        <p className="lede">
          {vertical
            ? vertical.lede
            : "Altora menyatukan kasir, inventori, pelanggan, hutang-piutang, dan laporan bisnis tanpa input data berulang. Masukkan satu aktivitas, Altora yang mengurus dampaknya ke seluruh sistem."}
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary btn-lg btn-shimmer" href={signupHref}>
            {signupLabel}
          </a>
          <a className="btn btn-ghost btn-lg" href="#tur-produk">
            Lihat Demo
          </a>
        </div>
        <p className="hero-microcopy">Tanpa kartu kredit &middot; Bisa dari HP &amp; desktop &middot; Setup cepat</p>
      </div>

      <div className="hero-visual">
        <div className="hero-visual-inner">
          <span className="badge-float"><span className="badge-dot" aria-hidden="true"></span>Langsung</span>

          <div className="receipt-back" role="img" aria-label={`Contoh struk digital Altora untuk ${vertical ? vertical.label : "usaha kamu"}`}>
            <div className="r-brand">ALTORA POS</div>
            <div className="r-sub">{heroMock.receiptBrandSub}</div>
            <hr className="r-rule" />
            {heroMock.receiptItems.map(([label, price]) => (
              <div className="r-row" key={label}><span>{label}</span><span>{price}</span></div>
            ))}
            <hr className="r-rule" />
            <div className="r-row r-promo"><span>{heroMock.receiptHighlight[0]}</span><span>{heroMock.receiptHighlight[1]}</span></div>
            <div className="r-row r-total-row"><span>TOTAL</span><span>{heroMock.receiptTotal}</span></div>
          </div>

          <div className="dash-card" role="img" aria-label={`Contoh dashboard Altora untuk ${vertical ? vertical.label : "usaha kamu"} menampilkan ringkasan hari ini`}>
            <div className="dash-chrome">
              <span className="dash-dot"></span><span className="dash-dot"></span><span className="dash-dot"></span>
              <span className="dash-url mono">kasir.altora.id / dashboard</span>
            </div>
            <div className="dash-body">
              <div className="dash-title-row">
                <span className="dash-title">{vertical ? vertical.label.replace("Altora ", "") : "Kasir"} · Hari ini</span>
                <span className="dash-live"><span className="badge-dot" aria-hidden="true"></span>Tersinkron</span>
              </div>
              <div className="dash-app-tabs" aria-hidden="true">
                {heroMock.dashTabs.map((tab, i) => (
                  <span key={tab} className={`dash-app-tab ${i === 0 ? "dash-app-active" : ""}`}>{tab}</span>
                ))}
              </div>
              <div className="dash-grid">
                {heroMock.dashTiles.map((tile) => (
                  <div className="dash-tile" key={tile.label}>
                    <span className="dash-tile-label">{tile.label}</span>
                    <span className="dash-tile-value mono">{tile.value}</span>
                    <span className={`dash-tile-delta ${tile.warn ? "warn" : ""}`}>{tile.delta}</span>
                  </div>
                ))}
              </div>
              <div className="live-order">
                <div className="live-order-head">
                  <span>{heroMock.liveTitle}</span>
                  <span className="live-order-status">{heroMock.liveStatus}</span>
                </div>
                <div className="live-order-row">
                  <span>{heroMock.liveDetail}</span>
                  <span className="mono">{heroMock.liveValue}</span>
                </div>
                <div className="live-progress" aria-hidden="true"><span></span></div>
              </div>
              <div>
                <span className="dash-chart-label">{heroMock.chartLabel}</span>
                <svg viewBox="0 0 300 64" width="100%" height="56" preserveAspectRatio="none" aria-hidden="true">
                  <polyline className="dash-chart-path" points="0,48 22,44 44,46 66,36 88,38 110,30 132,32 154,24 176,26 198,18 220,20 242,12 264,14 300,6" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <ul className="hero-outputs" aria-label="Yang otomatis diperbarui tiap ada transaksi">
          {HERO_OUTPUT_CHIPS.map((chip, i) => (
            <li className="hero-output-chip" key={chip.label} style={{ "--chip-delay": `${0.9 + i * 0.1}s` } as React.CSSProperties}>
              <OutputIcon name={chip.icon} />
              {chip.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>

  <div className="trust">
    <div className="trust-track">
      <div className="trust-row">
        <span className="trust-item">Coffee Shop</span>
        <span className="trust-item">Restoran &amp; Warung</span>
        <span className="trust-item">Barbershop &amp; Salon</span>
        <span className="trust-item">Retail &amp; Toko Kelontong</span>
        <span className="trust-item">Laundry</span>
        <span className="trust-item">Bengkel</span>
        <span className="trust-item">Klinik &amp; Apotek</span>
        <span className="trust-item">Butik &amp; Fashion</span>
        <span className="trust-item">Percetakan &amp; ATK</span>
        <span className="trust-item">Multi-Outlet</span>
        <span className="trust-item">&amp; Semua Jenis UMKM Lainnya</span>
      </div>
      <div className="trust-row" aria-hidden="true">
        <span className="trust-item">Coffee Shop</span>
        <span className="trust-item">Restoran &amp; Warung</span>
        <span className="trust-item">Barbershop &amp; Salon</span>
        <span className="trust-item">Retail &amp; Toko Kelontong</span>
        <span className="trust-item">Laundry</span>
        <span className="trust-item">Bengkel</span>
        <span className="trust-item">Klinik &amp; Apotek</span>
        <span className="trust-item">Butik &amp; Fashion</span>
        <span className="trust-item">Percetakan &amp; ATK</span>
        <span className="trust-item">Multi-Outlet</span>
        <span className="trust-item">&amp; Semua Jenis UMKM Lainnya</span>
      </div>
    </div>
  </div>

  {/* SOCIAL PROOF */}
  {/* TODO(altora): ganti dengan statistik nyata (jumlah bisnis aktif, transaksi/hari, dll)
      begitu tersedia — sengaja tidak diisi angka karangan. */}
  <section id="dipercaya" className="social-proof">
    <div className="wrap reveal">
      <p className="social-proof-lede">Dipercaya berbagai jenis bisnis untuk mengelola operasional dalam satu sistem.</p>
      <div className="social-proof-badges">
        {VERTICALS.map((v) => (
          <span className="social-proof-badge" key={v.key}>
            <img src={`/brand/${v.key}-symbol-onlight.svg`} alt="" width={16} height={16} />
            {v.label.replace("Altora ", "")}
          </span>
        ))}
      </div>
    </div>
  </section>

  {/* SATU INPUT, BANYAK OUTPUT */}
  <section id="otomatis" className="automation">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow">Bagaimana Altora bekerja</span>
        <h2>Lebih sedikit input. Lebih banyak yang otomatis.</h2>
        <p className="lede">Masukkan aktivitas bisnis sekali. Altora mengurus dampaknya di seluruh sistem secara otomatis.</p>
      </div>
      <div className="automation-flow reveal">
        <div className="automation-center">
          <span className="automation-center-dot" aria-hidden="true"></span>
          Satu transaksi berhasil
        </div>
        <div className="automation-outputs">
          {AUTOMATION_OUTPUTS.map((output, i) => (
            <div className="automation-output" key={output.key} style={{ "--out-delay": `${i * 0.07}s` } as React.CSSProperties}>
              <span className="automation-output-label">{output.label}</span>
              <span className="automation-output-detail">{output.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>

  {!vertical && <MobileHighlight />}
  {!vertical && <BusinessShowcase />}

  {/* FEATURE SPOTLIGHT — Pelanggan pesan sendiri */}
  <section id="qr-meja" className="spotlight">
    <div className="wrap spotlight-wrap reveal">
      <div className="spotlight-control-row">
        <div>
          <span className="eyebrow">Fitur andalan</span>
        </div>
        <div className="spotlight-arrows" aria-label="Navigasi fitur andalan">
          <button className="spotlight-arrow spotlight-prev" type="button" aria-label="Fitur sebelumnya">‹</button>
          <button className="spotlight-arrow spotlight-next" type="button" aria-label="Fitur berikutnya">›</button>
        </div>
      </div>

      <div className="spotlight-slides">
        {spotlightSlides.map((slide, index) => (
          <article
            className={`spotlight-slide ${index === 0 ? "is-active" : ""}`}
            data-spotlight-slide
            hidden={index !== 0}
            key={slide.label}
          >
            <div className="spotlight-copy">
              <span className="spotlight-kicker">{slide.label}</span>
              <h2 className="gradient-text">{slide.title}</h2>
              <p className="lede">{slide.body}</p>
              <ul className="spotlight-points">
                {slide.points.map((point, pointIndex) => (
                  <li key={point.title}>
                    <span className="spotlight-point-mark">{String(pointIndex + 1).padStart(2, "0")}</span>
                    <div>
                      <b>{point.title}</b>
                      <p>{point.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
              {slide.flow && (
                <div className="spotlight-flow" aria-label="Alur pesanan">
                  {slide.flow.map((step, i) => (
                    <span className="spotlight-flow-step" key={step}>
                      {i > 0 && <span className="spotlight-flow-arrow" aria-hidden="true">→</span>}
                      {step}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="spotlight-visual">
              <SpotlightPhone screen={slide.screen} />
            </div>
          </article>
        ))}
      </div>

      <div className="spotlight-dots" aria-label="Pilih fitur andalan">
        {spotlightSlides.map((slide, index) => (
          <button
            className={`spotlight-dot ${index === 0 ? "is-active" : ""}`}
            type="button"
            data-spotlight-dot
            aria-label={`Tampilkan ${slide.label}`}
            aria-current={index === 0 ? "true" : undefined}
            key={slide.label}
          >
            <span>{slide.label}</span>
          </button>
        ))}
      </div>
    </div>
  </section>

  {/* PRODUCT TOUR */}
  <section id="tur-produk">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow">Lihat isi aplikasinya</span>
        <h2 className="gradient-text">Satu aplikasi, semua sisi usaha kamu.</h2>
        <p className="lede">Geser buat lihat layar yang tim kamu pakai tiap hari, dari kasir sampai laporan bulanan.</p>
      </div>
      <div className="tour-tabs reveal" role="tablist" aria-label="Bagian aplikasi">
        {PRODUCT_TOUR_TABS.map((tab, i) => (
          <button
            type="button"
            key={tab.key}
            className={`tour-tab ${i === 0 ? "is-active" : ""}`}
            data-tour-tab
            role="tab"
            aria-selected={i === 0}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="gallery-track reveal">
        <div className="gallery-card">
          <div className="dash-chrome">
            <span className="dash-dot"></span><span className="dash-dot"></span><span className="dash-dot"></span>
            <span className="dash-url mono">kasir.altora.id / kasir</span>
          </div>
          <div className="gal-shell">
            <div className="gal-sidebar">
              <span className="gal-nav-dot gal-nav-active"></span>
              <span className="gal-nav-dot"></span><span className="gal-nav-dot"></span>
              <span className="gal-nav-dot"></span><span className="gal-nav-dot"></span><span className="gal-nav-dot"></span>
            </div>
            <div className="gal-main">
              <div className="gal-main-head"><span className="gal-main-title">Kasir · Kopi Nusantara BSD</span><span className="gal-badge gal-badge-good">Shift aktif</span></div>
              <div className="gal-split">
                <div className="gal-split-main">
                  <div className="gal-row"><div><div className="gal-row-name">Kopi Susu</div><div className="gal-row-sub">Kopi · Rp18.000</div></div><span className="gal-row-value">2x</span></div>
                  <div className="gal-row"><div><div className="gal-row-name">Croissant Coklat</div><div className="gal-row-sub">Makanan · Rp28.000</div></div><span className="gal-row-value">1x</span></div>
                  <div className="gal-row"><div><div className="gal-row-name">Americano</div><div className="gal-row-sub">Kopi · Rp15.000</div></div><span className="gal-row-value">1x</span></div>
                </div>
                <div className="gal-split-side">
                  <div className="gal-cart">
                    <span className="gal-cart-title">Keranjang</span>
                    <div className="gal-cart-row"><span>3 item</span><span>64.000</span></div>
                    <div className="gal-cart-row"><span>Promo -10%</span><span>-6.400</span></div>
                    <div className="gal-cart-total"><span>TOTAL</span><span>57.600</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="gallery-card">
          <div className="dash-chrome">
            <span className="dash-dot"></span><span className="dash-dot"></span><span className="dash-dot"></span>
            <span className="dash-url mono">kasir.altora.id / laporan</span>
          </div>
          <div className="gal-shell">
            <div className="gal-sidebar">
              <span className="gal-nav-dot"></span>
              <span className="gal-nav-dot gal-nav-active"></span><span className="gal-nav-dot"></span>
              <span className="gal-nav-dot"></span><span className="gal-nav-dot"></span><span className="gal-nav-dot"></span>
            </div>
            <div className="gal-main">
              <div className="gal-main-head"><span className="gal-main-title">Laporan · Bulan ini</span><span className="gal-badge gal-badge-good">+14%</span></div>
              <div className="gal-tiles">
                <div className="gal-tile"><span className="gal-tile-label">Omzet</span><span className="gal-tile-value mono">Rp84,2jt</span><span className="gal-tile-delta">+14% vs lalu</span></div>
                <div className="gal-tile"><span className="gal-tile-label">Transaksi</span><span className="gal-tile-value mono">2.184</span><span className="gal-tile-delta">+8% vs lalu</span></div>
                <div className="gal-tile"><span className="gal-tile-label">Rata-rata</span><span className="gal-tile-value mono">Rp38,5rb</span><span className="gal-tile-delta">+5% vs lalu</span></div>
              </div>
              <svg viewBox="0 0 400 90" width="100%" height="90" preserveAspectRatio="none" aria-hidden="true">
                <polyline points="0,72 40,64 80,68 120,50 160,54 200,36 240,40 280,22 320,26 360,10 400,14" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className="gallery-card">
          <div className="dash-chrome">
            <span className="dash-dot"></span><span className="dash-dot"></span><span className="dash-dot"></span>
            <span className="dash-url mono">kasir.altora.id / produk</span>
          </div>
          <div className="gal-shell">
            <div className="gal-sidebar">
              <span className="gal-nav-dot"></span><span className="gal-nav-dot"></span>
              <span className="gal-nav-dot gal-nav-active"></span>
              <span className="gal-nav-dot"></span><span className="gal-nav-dot"></span><span className="gal-nav-dot"></span>
            </div>
            <div className="gal-main">
              <div className="gal-main-head"><span className="gal-main-title">Produk &amp; Stok</span><span className="gal-badge gal-badge-warn">1 menipis</span></div>
              <div className="gal-row"><div><div className="gal-row-name">Kopi Susu</div><div className="gal-row-sub">Kategori: Kopi</div></div><span className="gal-badge gal-badge-good">Stok 42</span></div>
              <div className="gal-row"><div><div className="gal-row-name">Croissant Coklat</div><div className="gal-row-sub">Kategori: Makanan</div></div><span className="gal-badge gal-badge-warn">Stok 3</span></div>
              <div className="gal-row"><div><div className="gal-row-name">Americano</div><div className="gal-row-sub">Kategori: Kopi</div></div><span className="gal-badge gal-badge-good">Stok 18</span></div>
              <div className="gal-row"><div><div className="gal-row-name">Roti Bakar</div><div className="gal-row-sub">Kategori: Makanan</div></div><span className="gal-badge gal-badge-good">Stok 25</span></div>
            </div>
          </div>
        </div>

        <div className="gallery-card">
          <div className="dash-chrome">
            <span className="dash-dot"></span><span className="dash-dot"></span><span className="dash-dot"></span>
            <span className="dash-url mono">kasir.altora.id / absensi</span>
          </div>
          <div className="gal-shell">
            <div className="gal-sidebar">
              <span className="gal-nav-dot"></span><span className="gal-nav-dot"></span><span className="gal-nav-dot"></span>
              <span className="gal-nav-dot gal-nav-active"></span>
              <span className="gal-nav-dot"></span><span className="gal-nav-dot"></span>
            </div>
            <div className="gal-main">
              <div className="gal-main-head"><span className="gal-main-title">Absensi · Hari ini</span><span className="gal-badge gal-badge-good">4/5 hadir</span></div>
              <div className="gal-row"><div><div className="gal-row-name">Rani — Kasir</div><div className="gal-row-sub">Masuk 08.02</div></div><span className="gal-badge gal-badge-good">Hadir</span></div>
              <div className="gal-row"><div><div className="gal-row-name">Dimas — Barista</div><div className="gal-row-sub">Masuk 08.15</div></div><span className="gal-badge gal-badge-good">Hadir</span></div>
              <div className="gal-row"><div><div className="gal-row-name">Sinta — Barista</div><div className="gal-row-sub">Belum absen</div></div><span className="gal-badge gal-badge-warn">Telat</span></div>
              <div className="gal-row"><div><div className="gal-row-name">Budi — Kasir</div><div className="gal-row-sub">Masuk 07.58</div></div><span className="gal-badge gal-badge-good">Hadir</span></div>
            </div>
          </div>
        </div>

        <div className="gallery-card">
          <div className="dash-chrome">
            <span className="dash-dot"></span><span className="dash-dot"></span><span className="dash-dot"></span>
            <span className="dash-url mono">kasir.altora.id / dapur</span>
          </div>
          <div className="gal-shell">
            <div className="gal-sidebar">
              <span className="gal-nav-dot"></span><span className="gal-nav-dot"></span><span className="gal-nav-dot"></span><span className="gal-nav-dot"></span>
              <span className="gal-nav-dot gal-nav-active"></span>
              <span className="gal-nav-dot"></span>
            </div>
            <div className="gal-main">
              <div className="gal-main-head"><span className="gal-main-title">Kitchen Display</span><span className="gal-badge gal-badge-warn">4 pesanan aktif</span></div>
              <div className="gal-tickets">
                <div className="gal-ticket">
                  <div className="gal-ticket-head"><span>Meja 04</span><span>2 mnt lalu</span></div>
                  <div className="gal-ticket-item">1x Kopi Susu · 1x Roti Bakar</div>
                </div>
                <div className="gal-ticket">
                  <div className="gal-ticket-head"><span>Meja 07</span><span>5 mnt lalu</span></div>
                  <div className="gal-ticket-item">2x Americano</div>
                </div>
                <div className="gal-ticket">
                  <div className="gal-ticket-head"><span>Meja 02</span><span>7 mnt lalu</span></div>
                  <div className="gal-ticket-item">1x Croissant Coklat</div>
                </div>
                <div className="gal-ticket">
                  <div className="gal-ticket-head"><span>Take away</span><span>1 mnt lalu</span></div>
                  <div className="gal-ticket-item">3x Kopi Susu</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="gallery-card">
          <div className="dash-chrome">
            <span className="dash-dot"></span><span className="dash-dot"></span><span className="dash-dot"></span>
            <span className="dash-url mono">kasir.altora.id / member</span>
          </div>
          <div className="gal-shell">
            <div className="gal-sidebar">
              <span className="gal-nav-dot"></span><span className="gal-nav-dot"></span><span className="gal-nav-dot"></span><span className="gal-nav-dot"></span><span className="gal-nav-dot"></span>
              <span className="gal-nav-dot gal-nav-active"></span>
            </div>
            <div className="gal-main">
              <div className="gal-main-head"><span className="gal-main-title">Member · Dewi A.</span><span className="gal-badge gal-badge-good">Member sejak 2023</span></div>
              <div className="gal-split">
                <div className="gal-split-side">
                  <div className="gal-loyalty">
                    <div className="gal-loyalty-top"><span>KARTU MEMBER</span><span>ALTORA</span></div>
                    <div>
                      <div className="gal-row-sub" style={{ color: "rgba(255,255,255,0.8)" }}>Poin terkumpul</div>
                      <div className="gal-loyalty-points">1.240 pts</div>
                    </div>
                  </div>
                </div>
                <div className="gal-split-main">
                  <div className="gal-row"><div><div className="gal-row-name">Transaksi terakhir</div><div className="gal-row-sub">3 hari lalu</div></div><span className="gal-row-value">Rp57.600</span></div>
                  <div className="gal-row"><div><div className="gal-row-name">Total kunjungan</div><div className="gal-row-sub">Sejak Jan 2023</div></div><span className="gal-row-value">86x</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="gallery-nav">
        <button type="button" className="gallery-nav-btn gallery-prev" aria-label="Sebelumnya">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <button type="button" className="gallery-nav-btn gallery-next" aria-label="Berikutnya">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>
    </div>
  </section>

  {/* BEFORE / AFTER */}
  <section id="kenapa">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow">Kenapa Altora</span>
        <h2>Dari data yang tercecer menjadi satu sumber informasi.</h2>
        <p className="lede">Nota kertas, WhatsApp grup karyawan, catatan stok di buku tulis — kerja, tapi capek. Altora gantikan itu semua tanpa harus belajar sistem yang rumit.</p>
      </div>
      <div className="transform reveal">
        <div className="transform-col transform-before">
          <span className="transform-label">Sebelum Altora</span>
          <ul>
            <li>Penjualan dicatat di aplikasi/nota terpisah-pisah</li>
            <li>Stok dihitung manual, sering meleset</li>
            <li>Laporan disusun ulang di Excel tiap bulan</li>
            <li>Data pelanggan tersebar, gampang hilang</li>
            <li>Sulit memantau cabang dari jauh</li>
          </ul>
        </div>
        <div className="transform-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </div>
        <div className="transform-col transform-after">
          <span className="transform-label">Dengan Altora</span>
          <ul>
            <li>Semua transaksi terhubung dalam satu sistem</li>
            <li>Stok diperbarui otomatis tiap transaksi</li>
            <li>Laporan tersedia real-time, kapan saja dibuka</li>
            <li>Riwayat &amp; poin pelanggan tersimpan otomatis</li>
            <li>Semua cabang dipantau dalam satu dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  {/* BENEFITS */}
  <section id="fitur">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow">Yang ada di dalam</span>
        <h2>Satu paket, isinya lengkap.</h2>
        <p className="lede">Bukan cuma kasir — semua yang dibutuhkan usaha harian sudah ada, tanpa beli modul tambahan.</p>
      </div>
      <div className="benefits reveal">
        {BENEFIT_BLOCKS.map((block) => (
          <div className="benefit-card" key={block.key}>
            <span className="benefit-eyebrow mono">{block.eyebrow}</span>
            <h3>{block.title}</h3>
            <p>{block.description}</p>
            <ul className="benefit-features">
              {block.features.map((f) => (
                <li key={f}>
                  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <a className="benefit-link" href={block.anchor}>
              Pelajari lebih lanjut
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
            </a>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* ADDON SERVICES — di luar software, dikerjakan tim Altora langsung */}
  <section id="layanan-tambahan">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow">Layanan tambahan</span>
        <h2>Butuh bantuan di luar aplikasi? Kami juga bisa.</h2>
        <p className="lede">Selain software, tim Altora juga bantu pasang perangkat, jaga keamanan toko, latih karyawan, sampai kasih masukan strategi bisnis.</p>
      </div>
      <div className="addon-services reveal">
        {ADDON_SERVICES.map((service) => (
          <div className="addon-card" key={service.key}>
            <span className="addon-icon"><AddonIcon name={service.icon} /></span>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
      <div className="addon-cta reveal">
        <a className="btn btn-primary" href="https://wa.me/6285190911170?text=Halo%20Altora%2C%20saya%20mau%20tanya%20layanan%20tambahan" target="_blank" rel="noopener">
          Tanya Layanan Tambahan
        </a>
        <span className="addon-cta-note">Dipesan terpisah dari paket software, harga disesuaikan kebutuhan.</span>
      </div>
    </div>
  </section>

  {/* HOW IT WORKS */}
  <section id="cara-kerja">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow">Cara kerja</span>
        <h2>Mulai menjalankan bisnis dengan Altora dalam tiga langkah.</h2>
        <p className="lede">Tiga langkah, tanpa training berhari-hari.</p>
      </div>
      <div className="steps reveal">
        <div className="step">
          <span className="step-num">01</span>
          <h3>Pilih jenis usahamu</h3>
          <p>Altora menyiapkan modul dan tampilan yang sesuai — cafe, toko, laundry, atau jenis usaha lainnya.</p>
        </div>
        <div className="step">
          <span className="step-num">02</span>
          <h3>Masukkan data awal</h3>
          <p>Tambahkan produk secara manual, atau impor dari file. Undang karyawan, cetak QR meja kalau perlu.</p>
        </div>
        <div className="step">
          <span className="step-num">03</span>
          <h3>Mulai transaksi</h3>
          <p>Kasir langsung bisa dipakai hari itu juga — stok, keuangan, pelanggan, dan laporan langsung ikut diperbarui.</p>
        </div>
      </div>
    </div>
  </section>

  {/* FEATURE COMPARISON */}
  <section id="perbandingan-fitur">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow">Detail per paket</span>
        <h2>Semua fitur, di semua paket.</h2>
        <p className="lede">Yang membedakan paket cuma batas jumlah outlet, karyawan, dan produk — bukan fitur yang dikunci.</p>
      </div>
      <div className="cmp-table-wrap reveal">
        <table className="cmp-table">
          <thead>
            <tr>
              <th scope="col" className="cmp-th-feature">Fitur</th>
              <th scope="col">Free</th>
              <th scope="col">Basic</th>
              <th scope="col">Pro</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_GROUPS.map((group) => (
              <Fragment key={group.category}>
                <tr className="cmp-group-row">
                  <th scope="colgroup" colSpan={4}>{group.category}</th>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row" className="cmp-th-feature">{row.label}</th>
                    <td><ComparisonCell value={row.free} /></td>
                    <td><ComparisonCell value={row.basic} /></td>
                    <td><ComparisonCell value={row.pro} /></td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>

  {/* PRICING */}
  <section id="harga">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow">Harga</span>
        <h2>Konsultasi dulu, baru tahu harganya.</h2>
        <p className="lede">Setiap usaha beda kebutuhan outlet, karyawan, dan produk. Chat tim kami langsung — nggak pakai form ribet.</p>
      </div>
      <div className="pricing-cta reveal">
        <span className="pricing-cta-badge"><ClockIcon aria-hidden="true" />Cuma 5 menit</span>
        <h3>Ngobrol langsung sama tim Altora.</h3>
        <p>Ceritain jenis usaha, jumlah outlet, dan kebutuhanmu — kami bantu carikan paket yang paling pas, tanpa basa-basi.</p>
        <a className="btn btn-primary btn-lg btn-shimmer" href="https://wa.me/6285190911170?text=Halo%20Altora%2C%20saya%20mau%20konsultasi%20paket%20yang%20pas%20untuk%20usaha%20saya" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 5L2 22l5.2-1.36a9.94 9.94 0 0 0 4.84 1.23h.01c5.5 0 9.96-4.46 9.96-9.96S17.55 2 12.04 2Zm5.87 14.24c-.25.7-1.45 1.34-2 1.43-.51.08-1.15.11-1.86-.12-.43-.13-.98-.32-1.69-.62-2.97-1.28-4.9-4.26-5.05-4.46-.15-.2-1.21-1.6-1.21-3.06 0-1.45.76-2.16 1.03-2.46.27-.3.6-.37.8-.37.2 0 .4 0 .58.01.18.01.44-.07.68.53.25.6.85 2.08.92 2.23.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.18-.31.4-.44.53-.15.15-.3.31-.13.6.17.3.76 1.28 1.64 2.08 1.13 1.03 2.08 1.35 2.38 1.5.3.15.47.13.65-.07.18-.2.75-.87.95-1.17.2-.3.4-.25.68-.15.28.1 1.76.85 2.06 1 .3.15.5.23.57.35.07.13.07.73-.18 1.43Z"/></svg>
          Konsultasi Sekarang
        </a>
        <a className="plan-more" href="#perbandingan-fitur">Lihat semua fitur</a>
      </div>
    </div>
  </section>

  {/* TESTIMONIALS */}
  <section id="testimoni">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow">Kata pengguna</span>
        <h2>Yang mereka rasakan setelah pakai Altora.</h2>
        <p className="lede">Testimoni asli dari pemilik usaha yang sudah pakai Altora sehari-hari.</p>
      </div>
      <div className="testimonials reveal">
        {TESTIMONIALS.map((t) => (
          <figure className={`testimonial-card ${t.isPlaceholder ? "is-placeholder" : ""}`} key={t.name}>
            {t.isPlaceholder && <span className="testimonial-flag">Contoh tampilan</span>}
            <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
            <figcaption>
              <b>{t.name}</b>
              <span>{t.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>

  {/* FAQ */}
  <section id="faq">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow">Pertanyaan umum</span>
        <h2>Masih ada yang mau ditanya?</h2>
      </div>
      <div className="reveal">
        <FaqAccordion items={faqItems} />
      </div>
    </div>
  </section>

  {/* CLOSING CTA */}
  <section className="closing" id="kontak">
    <div className="closing-glow" aria-hidden="true"></div>
    <div className="wrap">
      <span className="eyebrow">Siap mulai?</span>
      <h2 style={{ marginTop: "14px" }}>Siap menjalankan bisnis tanpa input berulang?</h2>
      <p className="lede">Mulai dari transaksi pertama dan biarkan Altora mengurus stok, keuangan, pelanggan, dan laporan secara otomatis.</p>
      <div className="closing-actions">
        <a className="btn btn-primary btn-lg" href={signupHref}>
          {signupLabel}
        </a>
        <a className="btn btn-ghost btn-lg" href="https://wa.me/6285190911170?text=Halo%20Altora%2C%20saya%20mau%20jadwalkan%20demo" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 5L2 22l5.2-1.36a9.94 9.94 0 0 0 4.84 1.23h.01c5.5 0 9.96-4.46 9.96-9.96S17.55 2 12.04 2Zm5.87 14.24c-.25.7-1.45 1.34-2 1.43-.51.08-1.15.11-1.86-.12-.43-.13-.98-.32-1.69-.62-2.97-1.28-4.9-4.26-5.05-4.46-.15-.2-1.21-1.6-1.21-3.06 0-1.45.76-2.16 1.03-2.46.27-.3.6-.37.8-.37.2 0 .4 0 .58.01.18.01.44-.07.68.53.25.6.85 2.08.92 2.23.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.18-.31.4-.44.53-.15.15-.3.31-.13.6.17.3.76 1.28 1.64 2.08 1.13 1.03 2.08 1.35 2.38 1.5.3.15.47.13.65-.07.18-.2.75-.87.95-1.17.2-.3.4-.25.68-.15.28.1 1.76.85 2.06 1 .3.15.5.23.57.35.07.13.07.73-.18 1.43Z"/></svg>
          Jadwalkan Demo
        </a>
      </div>
      <div className="closing-contact">
        <span>PT. ALTORA INTERNATIONAL TECHNOLOGY</span>
        <span>+62 851-9091-1170</span>
      </div>
    </div>
  </section>
</main>

<footer className="site">
  <div className="wrap">
    <div className="footer-grid">
      <div>
        <a className="brand" href="#top">
          <span className="brand-mark">
            <img src="/brand/altora-purple-symbol.svg" alt="" width={40} height={40} style={{ display: "block" }} />
          </span>
          <span className="brand-word">ALTORA</span>
        </a>
        <p className="footer-desc">ERP ringan untuk UMKM Indonesia — kasir, inventori, keuangan, dan laporan bisnis dalam satu layar, tanpa input data berulang.</p>
      </div>
      <div className="footer-col">
        <div className="footer-heading">Produk</div>
        <a href="#fitur">Kasir</a>
        <a href="#fitur">Inventori</a>
        <a href="#fitur">Keuangan</a>
        <a href="#fitur">Member &amp; CRM</a>
        <a href="#perbandingan-fitur">Laporan</a>
      </div>
      <div className="footer-col">
        <div className="footer-heading">Solusi</div>
        {VERTICALS.filter((v) => v.key !== "teams" && v.key !== "accounting").slice(0, 6).map((v) => (
          <a key={v.key} href={`https://${v.subdomain}.altora.my.id`}>{v.label.replace("Altora ", "")}</a>
        ))}
      </div>
      <div className="footer-col">
        <div className="footer-heading">Kontak</div>
        <p style={{ marginBottom: "6px" }}>PT. ALTORA INTERNATIONAL TECHNOLOGY</p>
        <a href="mailto:admin@altora.my.id">admin@altora.my.id</a>
        <a href="tel:+6285190911170">+62 851-9091-1170</a>
        <a href="#faq">Bantuan &amp; FAQ</a>
      </div>
    </div>
    <div className="footer-bottom">
      <span>© 2026 PT. ALTORA INTERNATIONAL TECHNOLOGY.</span>
      <span>Dibuat untuk UMKM Indonesia.</span>
    </div>
  </div>
</footer>
    </div>
  );
}
