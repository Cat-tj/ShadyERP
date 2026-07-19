"use client";

import { useEffect, useRef, useState } from "react";
import { VERTICALS, type VerticalKey } from "@/lib/verticals";
import { HERO_MOCKS } from "@/lib/hero-mocks";

/** Baris "Aktivitas Penting" di layar laptop — 3 baris per vertikal, cuma ilustrasi. */
const SCREEN_FEED: Record<VerticalKey, string[]> = {
  cafe: ["Meja 04 pesan 2× Kopi Susu", "Meja 07 minta bill", "Stok Croissant tinggal 3"],
  toko: ["6 item stok menipis perlu dipesan", "2 PO menunggu penerimaan barang", "1 retur penjualan menunggu proses"],
  ecommerce: ["Pesanan #ON-318 masuk", "Katalog Rak Serbaguna diperbarui", "Stok Kotak Penyimpanan tinggal 6"],
  supermarket: ["PO #482 barang masuk", "Stock opname Gudang A selesai", "Supplier baru ditambahkan"],
  laundry: ["Order #128 siap diambil", "DP Rp20.000 diterima", "Cucian #131 mulai diproses"],
  counter: ["Servis HP #45 selesai", "Garansi aksesoris 30 hari aktif", "Stok casing tinggal 2"],
  jasa: ["Booking baru 14:00 masuk", "Staf Andi pegang 3 jadwal", "DP booking diterima"],
  pabrik: ["Bahan baku tepung terisi ulang", "Maintenance mesin #2 dijadwalkan", "Laporan pemakaian harian siap"],
  company: ["E-sign dokumen disetujui", "Login baru dari Cabang Bali", "Laporan gabungan 5 outlet siap"],
  teams: ["Dewi absen 08:14, telat 14 mnt", "Tukar shift disetujui", "Target tim naik ke 72%"],
  accounting: ["Jurnal otomatis dari transaksi", "Laba rugi bulan ini siap", "Kas kecil direkonsiliasi"],
};

type PanelRow = { t: string; s?: string; b?: string; warn?: boolean };

type VerticalDetail = {
  /** Nama tenant fiktif di mockup layar (bukan data asli). */
  tenant: string;
  /** 4 poin manfaat konkret di kolom copy kiri. */
  checks: [string, string, string, string];
  /** Item sidebar laptop — item pertama selalu jadi menu aktif. */
  nav: string[];
  /** Panel daftar kiri di laptop; juga dipakai layar HP ("Perlu Tindakan"). */
  panelA: { title: string; rows: PanelRow[] };
  /** Panel daftar kanan di laptop; juga dipakai layar tablet ("Ringkasan Cepat"). */
  panelB: { title: string; rows: PanelRow[] };
};

/** Konten detail mockup per vertikal — melengkapi HERO_MOCKS, cuma ilustrasi visual. */
const VSHOW_DETAIL: Record<VerticalKey, VerticalDetail> = {
  cafe: {
    tenant: "Kopi Nusantara",
    checks: [
      "Pesanan meja masuk sendiri dari QR",
      "Dapur lihat antrian tanpa teriak",
      "Stok bahan berkurang sesuai resep",
      "Omzet harian kelihatan real-time",
    ],
    nav: ["Ringkasan", "Kasir", "Pesanan Meja", "Dapur", "Stok Bahan", "Laporan", "Pengaturan"],
    panelA: {
      title: "Pesanan Meja",
      rows: [
        { t: "Meja 04", s: "2× Kopi Susu · 1× Croissant", b: "Baru" },
        { t: "Meja 07", s: "Minta bill · Rp86.000", b: "Bayar", warn: true },
        { t: "Meja 02", s: "3× Es Teh Lemon", b: "Saji" },
      ],
    },
    panelB: {
      title: "Stok Bahan Menipis",
      rows: [
        { t: "Susu UHT", s: "Sisa 4 L", b: "Restock", warn: true },
        { t: "Croissant", s: "Sisa 3 pcs", b: "Restock", warn: true },
        { t: "Biji Kopi Blend", s: "Sisa 1,2 kg" },
      ],
    },
  },
  toko: {
    tenant: "Toko Berkah",
    checks: [
      "Stok menipis langsung terlihat",
      "Barang masuk & PO dalam kontrol",
      "Penjualan harian seluruh cabang",
      "Laporan siap pakai setiap saat",
    ],
    nav: ["Ringkasan", "Penjualan", "Stok", "Pembelian", "Barang Masuk", "Laporan", "Pengaturan"],
    panelA: {
      title: "Stok Menipis",
      rows: [
        { t: "Aqua 600ml", s: "Sisa 8 · Min 12", b: "Restock", warn: true },
        { t: "Indomie Goreng", s: "Sisa 14 · Min 20", b: "Restock", warn: true },
        { t: "Gula Pasir 1kg", s: "Sisa 5 · Min 10", b: "Restock", warn: true },
      ],
    },
    panelB: {
      title: "Barang Masuk Terbaru",
      rows: [
        { t: "PO #482 · Sinar Jaya", s: "120 item · Hari ini", b: "Masuk" },
        { t: "PO #481 · CV Makmur", s: "80 item · Kemarin" },
        { t: "PO #479 · UD Sejahtera", s: "60 item · 2 hari lalu" },
      ],
    },
  },
  ecommerce: {
    tenant: "Ruang Rapi Online",
    checks: [
      "Satu katalog untuk stok dan pesanan",
      "Pesanan baru langsung masuk antrian",
      "Stok siap kirim tetap terjaga",
      "Laporan penjualan tetap satu sumber data",
    ],
    nav: ["Ringkasan", "Pesanan", "Katalog", "Stok", "Pelanggan", "Laporan", "Pengaturan"],
    panelA: {
      title: "Pesanan Baru",
      rows: [
        { t: "ON-318 · Rak Serbaguna", s: "2 barang · siap diproses", b: "Baru" },
        { t: "ON-316 · Kotak Penyimpanan", s: "Sudah dibayar", b: "Kirim" },
        { t: "ON-314 · Lampu Meja", s: "Menunggu konfirmasi", b: "Cek", warn: true },
      ],
    },
    panelB: {
      title: "Katalog & Stok",
      rows: [
        { t: "Kotak Penyimpanan", s: "Sisa 6 · min 10", b: "Restock", warn: true },
        { t: "Rak Serbaguna", s: "Sisa 14 · siap kirim", b: "Aman" },
        { t: "Lampu Meja", s: "2 varian aktif", b: "Aktif" },
      ],
    },
  },
  supermarket: {
    tenant: "Sentosa Mart",
    checks: [
      "Ribuan SKU terpantau satu layar",
      "Harga grosir bertingkat per qty",
      "Barang masuk lewat PO & QC",
      "Stock opname tanpa tutup toko",
    ],
    nav: ["Ringkasan", "Kasir", "Stok", "Purchase Order", "Supplier", "Laporan", "Pengaturan"],
    panelA: {
      title: "PO Berjalan",
      rows: [
        { t: "PO #512 · Beras 40 sak", s: "Menunggu QC", b: "QC", warn: true },
        { t: "PO #509 · Minyak 60 dus", s: "Dikirim supplier", b: "Kirim" },
        { t: "PO #505 · Gula 25 sak", s: "Diterima penuh", b: "Selesai" },
      ],
    },
    panelB: {
      title: "Stock Opname",
      rows: [
        { t: "Gudang A", s: "Selesai · 0 selisih", b: "Cocok" },
        { t: "Gudang B", s: "Berjalan · rak 12/30" },
        { t: "Toko Depan", s: "Dijadwalkan besok" },
      ],
    },
  },
  laundry: {
    tenant: "Laundry Kilat",
    checks: [
      "Status cucian jelas sampai diambil",
      "Pelanggan cek status sendiri via link",
      "DP & cicilan tercatat otomatis",
      "Omzet harian langsung kelihatan",
    ],
    nav: ["Ringkasan", "Order", "Status Cucian", "Pelanggan", "Kas", "Laporan", "Pengaturan"],
    panelA: {
      title: "Order Aktif",
      rows: [
        { t: "Order #128", s: "5 kg · cuci + setrika", b: "Siap" },
        { t: "Order #131", s: "3 kg · express", b: "Dicuci" },
        { t: "Order #132", s: "Bed cover · 1 pcs", b: "Antri", warn: true },
      ],
    },
    panelB: {
      title: "Perlu Ditagih",
      rows: [
        { t: "Order #120", s: "Sisa Rp15.000", b: "Tagih", warn: true },
        { t: "Order #117", s: "Sisa Rp22.000", b: "Tagih", warn: true },
        { t: "Order #113", s: "Lunas kemarin", b: "Lunas" },
      ],
    },
  },
  counter: {
    tenant: "Konter Jaya",
    checks: [
      "Servis & garansi tercatat rapi",
      "Jual aksesoris dari kasir yang sama",
      "Status perbaikan jelas per unit",
      "Stok aksesoris terpantau",
    ],
    nav: ["Ringkasan", "Kasir", "Servis", "Garansi", "Stok", "Laporan", "Pengaturan"],
    panelA: {
      title: "Servis Berjalan",
      rows: [
        { t: "iPhone 11", s: "Ganti baterai", b: "Selesai" },
        { t: "Redmi Note 12", s: "Ganti LCD", b: "Proses" },
        { t: "Vivo Y17", s: "Cek mati total", b: "Antri", warn: true },
      ],
    },
    panelB: {
      title: "Garansi Aktif",
      rows: [
        { t: "Servis #45", s: "Sisa 28 hari", b: "Aktif" },
        { t: "Servis #42", s: "Sisa 21 hari", b: "Aktif" },
        { t: "Servis #38", s: "Sisa 2 hari", b: "Habis", warn: true },
      ],
    },
  },
  jasa: {
    tenant: "Barbershop Utama",
    checks: [
      "Jadwal booking rapi tanpa bentrok",
      "Staf yang pegang jelas dari awal",
      "DP & pelunasan tercatat otomatis",
      "Komisi staf dihitung sendiri",
    ],
    nav: ["Ringkasan", "Booking", "Jadwal Staf", "Kasir", "Komisi", "Laporan", "Pengaturan"],
    panelA: {
      title: "Booking Hari Ini",
      rows: [
        { t: "14:00 · Potong rambut", s: "Staf Andi", b: "Fix" },
        { t: "15:30 · Creambath", s: "Staf Sari · DP masuk", b: "DP" },
        { t: "17:00 · Cukur + vitamin", s: "Belum pilih staf", b: "Baru", warn: true },
      ],
    },
    panelB: {
      title: "Komisi Staf",
      rows: [
        { t: "Andi", s: "12 booking minggu ini", b: "Rp340rb" },
        { t: "Sari", s: "9 booking minggu ini", b: "Rp260rb" },
        { t: "Bayu", s: "7 booking minggu ini", b: "Rp190rb" },
      ],
    },
  },
  pabrik: {
    tenant: "Roti Makmur",
    checks: [
      "Stok bahan baku terpantau harian",
      "Maintenance mesin terjadwal",
      "Pemakaian bahan tercatat otomatis",
      "Hasil produksi kelihatan per hari",
    ],
    nav: ["Ringkasan", "Bahan Baku", "Produksi", "Maintenance", "Aset", "Laporan", "Pengaturan"],
    panelA: {
      title: "Bahan Baku",
      rows: [
        { t: "Tepung terigu", s: "Stok 92% · aman", b: "Aman" },
        { t: "Ragi instan", s: "Stok 61% · aman", b: "Aman" },
        { t: "Mentega", s: "Stok 18% · menipis", b: "Restock", warn: true },
      ],
    },
    panelB: {
      title: "Jadwal Maintenance",
      rows: [
        { t: "Mesin oven #2", s: "Servis rutin", b: "Besok", warn: true },
        { t: "Mixer besar", s: "12 hari lagi" },
        { t: "Conveyor", s: "30 hari lagi" },
      ],
    },
  },
  company: {
    tenant: "Berkah Group",
    checks: [
      "Semua cabang dalam satu dashboard",
      "Dokumen & e-sign berurutan",
      "Audit log tiap aksi penting",
      "Laporan gabungan otomatis",
    ],
    nav: ["Ringkasan", "Cabang", "Approval", "Dokumen", "Audit Log", "Laporan", "Pengaturan"],
    panelA: {
      title: "Approval Menunggu",
      rows: [
        { t: "Budget Cabang Bali", s: "2 dari 3 tanda tangan", b: "E-sign", warn: true },
        { t: "PO Pusat #88", s: "Menunggu direktur", b: "E-sign", warn: true },
        { t: "Izin manajer BSD", s: "Disetujui pagi ini", b: "OK" },
      ],
    },
    panelB: {
      title: "Ringkasan Cabang",
      rows: [
        { t: "Jakarta", s: "Omzet Rp12,4jt", b: "+6%" },
        { t: "Bali", s: "Omzet Rp8,9jt", b: "+11%" },
        { t: "Surabaya", s: "Omzet Rp7,2jt", b: "-2%", warn: true },
      ],
    },
  },
  teams: {
    tenant: "Tim Cabang BSD",
    checks: [
      "Absen dari HP pakai foto + lokasi",
      "Jadwal shift + approval manajer",
      "Telat & izin langsung kelihatan",
      "Target tim terisi dari transaksi",
    ],
    nav: ["Ringkasan", "Absensi", "Jadwal", "Target", "Izin & Cuti", "Laporan", "Pengaturan"],
    panelA: {
      title: "Absensi Hari Ini",
      rows: [
        { t: "Dewi K.", s: "08:14 · shift pagi", b: "Telat", warn: true },
        { t: "Raka P.", s: "07:55 · shift pagi", b: "Hadir" },
        { t: "Sinta A.", s: "Izin sakit · 1 hari", b: "Izin" },
      ],
    },
    panelB: {
      title: "Jadwal Shift",
      rows: [
        { t: "Shift pagi", s: "8 orang · penuh", b: "OK" },
        { t: "Shift sore", s: "6 orang · 1 kosong", b: "Isi", warn: true },
        { t: "Tukar shift", s: "1 menunggu approval" },
      ],
    },
  },
  accounting: {
    tenant: "Berkah Group",
    checks: [
      "Jurnal otomatis dari tiap transaksi",
      "Laba rugi tanpa input dobel",
      "Rekonsiliasi kas lebih cepat",
      "Export siap dikirim ke akuntan",
    ],
    nav: ["Ringkasan", "Jurnal", "Buku Besar", "Laba Rugi", "Kas & Bank", "Laporan", "Pengaturan"],
    panelA: {
      title: "Jurnal Terbaru",
      rows: [
        { t: "#9021 · Penjualan kasir", s: "Rp1,2jt · otomatis", b: "Auto" },
        { t: "#9020 · Beban listrik", s: "Rp420rb · manual" },
        { t: "#9019 · Pembelian stok", s: "Rp2,1jt · otomatis", b: "Auto" },
      ],
    },
    panelB: {
      title: "Rekonsiliasi",
      rows: [
        { t: "Kas kecil", s: "0 selisih", b: "Cocok" },
        { t: "Bank BCA", s: "1 transaksi selisih", b: "Cek", warn: true },
        { t: "Kas kasir", s: "0 selisih", b: "Cocok" },
      ],
    },
  },
};

/** Strip keunggulan statis di bawah section — sama untuk semua vertikal. */
const VSHOW_STRIP: { key: string; title: string; sub: string; icon: React.ReactNode }[] = [
  {
    key: "realtime",
    title: "Realtime & Akurat",
    sub: "Data selalu terbaru",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12h4l3-8 4 16 3-8h4" />
      </svg>
    ),
  },
  {
    key: "mudah",
    title: "Mudah Digunakan",
    sub: "Fokus pada tugas penting",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 4l7 16 2.2-6.8L21 11z" />
      </svg>
    ),
  },
  {
    key: "integrasi",
    title: "Terintegrasi Penuh",
    sub: "Stok, kas, laporan terhubung",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 15l6-6M10.5 6.5 12 5a4 4 0 0 1 5.66 5.66L16 12.5M13.5 17.5 12 19a4 4 0 0 1-5.66-5.66L8 11.5" />
      </svg>
    ),
  },
  {
    key: "aman",
    title: "Aman & Terpercaya",
    sub: "Backup & enkripsi data",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z" /><path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

const ROTATE_MS = 4200;

const CHART_POINTS = "0,46 24,42 48,44 72,34 96,36 120,28 144,30 168,22 192,24 216,16 240,18 264,10 300,6";

export function VerticalRotator() {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);
  const dotsRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const active = VERTICALS[index];
  const detail = VSHOW_DETAIL[active.key];
  const feed = SCREEN_FEED[active.key];
  const mock = HERO_MOCKS[active.key];
  const shortLabel = active.label.replace("Altora ", "");

  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const timer = setInterval(() => {
      if (pausedRef.current) return;
      setIndex((i) => (i + 1) % VERTICALS.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, []);

  // Pil geser (sliding tab indicator) di belakang tombol vertikal aktif —
  // ngukur posisi tombol asli, jadi otomatis benar walau baris terbungkus (wrap).
  useEffect(() => {
    const container = dotsRef.current;
    const activeBtn = container?.children[index] as HTMLElement | undefined;
    if (!container || !activeBtn) return;
    const update = () =>
      setPillStyle({
        width: activeBtn.offsetWidth,
        height: activeBtn.offsetHeight,
        transform: `translate(${activeBtn.offsetLeft}px, ${activeBtn.offsetTop}px)`,
        opacity: 1,
      });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [index]);

  const themeVars = {
    "--primary": active.theme.primary,
    "--primary-dark": active.theme.deep,
    "--primary-bright": active.theme.accent,
    "--v-soft": active.theme.soft,
    "--v-bg": active.theme.background,
  } as React.CSSProperties;

  return (
    <section
      id="ekosistem"
      className="vshow reveal"
      style={themeVars}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Cocok untuk usaha kamu</span>
          <h2>Satu fondasi, disesuaikan dengan cara kerja usahamu.</h2>
          <p className="lede">
            Catat fakta lapangan sekali saja, Altora mengurus stok, uang, tugas, dan tindakan lanjutannya secara otomatis.
          </p>
        </div>

        <div className="vshow-dots" role="tablist" aria-label="Pilih vertikal Altora" ref={dotsRef}>
          {VERTICALS.map((v, i) => (
            <button
              key={v.key}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={`vshow-dot ${i === index ? "is-active" : ""}`}
              onClick={() => setIndex(i)}
            >
              <img src={i === index ? `/brand/${v.key}-symbol.svg` : `/brand/${v.key}-symbol-onlight.svg`} alt="" />
              {v.label.replace("Altora ", "")}
            </button>
          ))}
          <span className="vshow-dot-pill" style={pillStyle} aria-hidden="true" />
        </div>

        <div className="vshow-body">
          <div className="vshow-copy">
            <span className="vshow-pill">{shortLabel}</span>
            <h3>{active.caseTitle}</h3>
            <p>{active.caseDescription}</p>

            <ul className="vshow-checks">
              {detail.checks.map((check) => (
                <li key={check}>
                  <span className="vshow-check-ic">
                    <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4" /></svg>
                  </span>
                  {check}
                </li>
              ))}
            </ul>

            <div className="vshow-integration">
              <span className="vshow-integration-ic">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 15l6-6M10.5 6.5 12 5a4 4 0 0 1 5.66 5.66L16 12.5M13.5 17.5 12 19a4 4 0 0 1-5.66-5.66L8 11.5" />
                </svg>
              </span>
              <div>
                <b>Terintegrasi penuh</b>
                <span>Stok, kas, dan laporan selalu sinkron otomatis.</span>
              </div>
            </div>

            <span className="vshow-devices"><i aria-hidden="true" />Tersinkron otomatis di semua perangkat</span>
          </div>

          <div className="vshow-visual">
            <div
              className="vshow-stage"
              role="img"
              aria-label={`Mockup aplikasi ${active.label} di laptop, tablet, dan HP — data yang sama, tersinkron di semua perangkat`}
            >
              {/* Laptop — dashboard penuh dengan sidebar */}
              <div className="vshow-laptop" aria-hidden="true">
                <div className="vshow-laptop-screen">
                  <div key={active.key} className="vshow-lap-inner vshow-panel-fade">
                    <div className="vshow-chrome">
                      <span className="vshow-cdot" /><span className="vshow-cdot" /><span className="vshow-cdot" />
                      <span className="vshow-curl mono">{active.subdomain}.altora.my.id/dashboard</span>
                    </div>
                    <div className="vshow-lap-app">
                      <aside className="vshow-side">
                        <div className="vshow-side-brand">
                          <img src={`/brand/${active.key}-symbol-onlight.svg`} alt="" />
                          <b>Altora</b>
                        </div>
                        <div className="vshow-side-tenant">
                          {detail.tenant}
                          <svg viewBox="0 0 16 16" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m4 6 4 4 4-4" /></svg>
                        </div>
                        <div className="vshow-side-nav">
                          {detail.nav.map((item, i) => (
                            <span key={item} className={i === 0 ? "is-on" : ""}>{item}</span>
                          ))}
                        </div>
                        <div className="vshow-side-user">
                          <i>BS</i>
                          <div><b>Budi Setiawan</b><span>Owner</span></div>
                        </div>
                      </aside>
                      <div className="vshow-main">
                        <div className="vshow-main-head">
                          <b>{detail.nav[0]} · {detail.tenant}</b>
                          <div className="vshow-main-chips">
                            <span className="vshow-chip">Hari ini ▾</span>
                            <span className="vshow-chip">Filter</span>
                          </div>
                        </div>
                        <div className="vshow-lap-tiles">
                          {mock.dashTiles.map((tile) => (
                            <div className="vshow-tile" key={tile.label}>
                              <span>{tile.label}</span>
                              <b>{tile.value}</b>
                              <small className={tile.warn ? "warn" : ""}>{tile.delta}</small>
                            </div>
                          ))}
                        </div>
                        <div className="vshow-lap-cols">
                          <div className="vshow-panel">
                            <div className="vshow-panel-head"><b>{detail.panelA.title}</b><span>Lihat semua</span></div>
                            {detail.panelA.rows.map((row) => (
                              <div className="vshow-prow" key={row.t}>
                                <div><b>{row.t}</b>{row.s && <small>{row.s}</small>}</div>
                                {row.b && <span className={`vshow-badge ${row.warn ? "warn" : ""}`}>{row.b}</span>}
                              </div>
                            ))}
                          </div>
                          <div className="vshow-panel">
                            <div className="vshow-panel-head"><b>{mock.chartLabel}</b><span>Lihat laporan</span></div>
                            <svg viewBox="0 0 300 60" width="100%" height="72" preserveAspectRatio="none">
                              <polygon
                                points={`0,60 ${CHART_POINTS} 300,60`}
                                fill="var(--v-soft)" style={{ transition: "fill 0.6s ease" }}
                              />
                              <polyline
                                points={CHART_POINTS}
                                fill="none" stroke="var(--primary)" strokeWidth="2.5"
                                strokeLinecap="round" strokeLinejoin="round"
                                style={{ transition: "stroke 0.6s ease" }}
                              />
                            </svg>
                          </div>
                          <div className="vshow-panel">
                            <div className="vshow-panel-head"><b>{detail.panelB.title}</b><span>Lihat semua</span></div>
                            {detail.panelB.rows.map((row) => (
                              <div className="vshow-prow" key={row.t}>
                                <div><b>{row.t}</b>{row.s && <small>{row.s}</small>}</div>
                                {row.b && <span className={`vshow-badge ${row.warn ? "warn" : ""}`}>{row.b}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="vshow-lap-acts">
                          <b>Aktivitas Penting</b>
                          {feed.map((line) => (
                            <span className="vshow-act" key={line}><i />{line}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="vshow-laptop-base" />
              </div>

              {/* Tablet — ringkasan cepat, portrait. Sengaja TANPA key+panel-fade:
                  remount beranimasi di layer yang ketimpa HP bikin Chromium kadang
                  gagal repaint background layar (kelihatan gelap). Konten cukup
                  di-update di tempat. */}
              <div className="vshow-tablet" aria-hidden="true">
                <div className="vshow-tablet-screen">
                  <div className="vshow-tab-head">
                    <img src={`/brand/${active.key}-symbol-onlight.svg`} alt="" />
                    <b>{detail.tenant}</b>
                    <span className="vshow-live"><i />Live</span>
                  </div>
                  <div className="vshow-mini-tiles">
                    {mock.dashTiles.map((tile) => (
                      <div className="vshow-tile" key={tile.label}>
                        <span>{tile.label}</span>
                        <b>{tile.value}</b>
                      </div>
                    ))}
                  </div>
                  <span className="vshow-mini-kicker">Ringkasan Cepat</span>
                  <div className="vshow-mini-rows">
                    {detail.panelB.rows.map((row) => (
                      <div className="vshow-prow" key={row.t}>
                        <div><b>{row.t}</b>{row.s && <small>{row.s}</small>}</div>
                        {row.b && <span className={`vshow-badge ${row.warn ? "warn" : ""}`}>{row.b}</span>}
                      </div>
                    ))}
                  </div>
                  <div className="vshow-spark">
                    <span>{mock.chartLabel}</span>
                    <svg viewBox="0 0 140 34" width="100%" height="30" preserveAspectRatio="none">
                      <polyline
                        points="0,26 14,23 28,25 42,19 56,21 70,15 84,17 98,12 112,13 126,8 140,5"
                        fill="none" stroke="var(--primary)" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"
                        style={{ transition: "stroke 0.6s ease" }}
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* iPhone — perlu tindakan + grafik */}
              <div className="vshow-phone" aria-hidden="true">
                <span className="vshow-island" />
                <div key={active.key} className="vshow-screen vshow-panel-fade">
                  <div className="vshow-screen-head">
                    <img src={`/brand/${active.key}-symbol-onlight.svg`} alt="" />
                    <b>{detail.tenant}</b>
                    <span className="vshow-live"><i />Live</span>
                  </div>
                  <div className="vshow-ph-tiles">
                    {mock.dashTiles.map((tile) => (
                      <div className="vshow-tile" key={tile.label}>
                        <span>{tile.label}</span>
                        <b>{tile.value}</b>
                      </div>
                    ))}
                  </div>
                  <span className="vshow-mini-kicker">Perlu Tindakan</span>
                  <div className="vshow-mini-rows">
                    {detail.panelA.rows.map((row) => (
                      <div className="vshow-prow" key={row.t}>
                        <div><b>{row.t}</b>{row.s && <small>{row.s}</small>}</div>
                        {row.b && <span className={`vshow-badge ${row.warn ? "warn" : ""}`}>{row.b}</span>}
                      </div>
                    ))}
                  </div>
                  <div className="vshow-spark">
                    <span>{mock.chartLabel}</span>
                    <svg viewBox="0 0 140 34" width="100%" height="28" preserveAspectRatio="none">
                      <polyline
                        points="0,26 14,23 28,25 42,19 56,21 70,15 84,17 98,12 112,13 126,8 140,5"
                        fill="none" stroke="var(--primary)" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"
                        style={{ transition: "stroke 0.6s ease" }}
                      />
                    </svg>
                  </div>
                  <div className="vshow-ph-nav">
                    {detail.nav.slice(0, 4).map((item, i) => (
                      <span key={item} className={i === 0 ? "is-on" : ""}><i />{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="vshow-strip">
          {VSHOW_STRIP.map((item) => (
            <div className="vshow-strip-item" key={item.key}>
              <span className="vshow-strip-ic">{item.icon}</span>
              <div>
                <b>{item.title}</b>
                <span>{item.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
