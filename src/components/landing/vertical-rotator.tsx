"use client";

import { useEffect, useRef, useState } from "react";
import { VERTICALS, type VerticalKey } from "@/lib/verticals";

/** Data mockup layar HP per vertikal — cuma buat ilustrasi visual, bukan data asli. */
const SCREEN_TILES: Record<VerticalKey, [{ label: string; value: string }, { label: string; value: string }]> = {
  cafe: [{ label: "Omzet hari ini", value: "Rp3,4jt" }, { label: "Meja aktif", value: "5" }],
  toko: [{ label: "Stok terjual", value: "142 item" }, { label: "Produk laris", value: "Kopi susu" }],
  supermarket: [{ label: "SKU aktif", value: "1.240" }, { label: "Barang masuk", value: "18 PO" }],
  laundry: [{ label: "Cucian proses", value: "9 order" }, { label: "Siap diambil", value: "3" }],
  counter: [{ label: "Servis masuk", value: "4 unit" }, { label: "Garansi aktif", value: "27" }],
  jasa: [{ label: "Booking hari ini", value: "6 slot" }, { label: "Staf pegang", value: "3 org" }],
  pabrik: [{ label: "Bahan baku aman", value: "92%" }, { label: "Maintenance", value: "1 alat" }],
  company: [{ label: "Cabang terpantau", value: "12" }, { label: "Approval jalan", value: "3 e-sign" }],
  teams: [{ label: "Hadir hari ini", value: "18/20" }, { label: "Target tim", value: "72%" }],
  accounting: [{ label: "Kas hari ini", value: "Rp8,1jt" }, { label: "Laba bulan ini", value: "+14%" }],
};

/** Baris aktivitas mockup layar HP — 3 baris per vertikal, cuma ilustrasi. */
const SCREEN_FEED: Record<VerticalKey, string[]> = {
  cafe: ["Meja 04 pesan 2× Kopi Susu", "Meja 07 minta bill", "Stok Croissant tinggal 3"],
  toko: ["Scan barcode: Indomie Goreng", "Transfer stok ke Cabang 2", "Produk terlaris: Aqua 600ml"],
  supermarket: ["PO #482 barang masuk", "Stock opname Gudang A selesai", "Supplier baru ditambahkan"],
  laundry: ["Order #128 siap diambil", "DP Rp20.000 diterima", "Cucian #131 mulai diproses"],
  counter: ["Servis HP #45 selesai", "Garansi aksesoris 30 hari aktif", "Stok casing tinggal 2"],
  jasa: ["Booking baru 14:00 masuk", "Staf Andi pegang 3 jadwal", "DP booking diterima"],
  pabrik: ["Bahan baku tepung terisi ulang", "Maintenance mesin #2 dijadwalkan", "Laporan pemakaian harian siap"],
  company: ["E-sign dokumen disetujui", "Login baru dari Cabang Bali", "Laporan gabungan 5 outlet siap"],
  teams: ["Dewi absen 08:14, telat 14 mnt", "Tukar shift disetujui", "Target tim naik ke 72%"],
  accounting: ["Jurnal otomatis dari transaksi", "Laba rugi bulan ini siap", "Kas kecil direkonsiliasi"],
};

const ROTATE_MS = 4200;

export function VerticalRotator() {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);
  const active = VERTICALS[index];
  const tiles = SCREEN_TILES[active.key];
  const feed = SCREEN_FEED[active.key];

  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const timer = setInterval(() => {
      if (pausedRef.current) return;
      setIndex((i) => (i + 1) % VERTICALS.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, []);

  const themeVars = {
    "--primary": active.theme.primary,
    "--primary-dark": active.theme.deep,
    "--primary-bright": active.theme.accent,
    "--v-soft": active.theme.soft,
    "--v-bg": active.theme.background,
  } as React.CSSProperties;

  const ribbonStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(135deg, ${active.theme.ribbon.start} 0%, ${active.theme.ribbon.middle} 50%, ${active.theme.ribbon.end} 100%)`,
  };

  return (
    <section
      id="ekosistem"
      className="vshow reveal"
      style={themeVars}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div className="vshow-wash" aria-hidden="true" />
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Satu platform, banyak wajah</span>
          <h2>Satu Altora, warna beda tiap usaha.</h2>
          <p className="lede">
            Cafe, toko, laundry, sampai tim internal perusahaan — tiap jenis usaha dapat tampilan dan sorotan fitur sendiri, tapi tetap satu aplikasi yang sama.
          </p>
        </div>

        <div className="vshow-body">
          <div className="vshow-copy">
            <span className="vshow-pill">
              <img src={`/brand/${active.key}-symbol.svg`} alt="" />
              {active.label}
            </span>
            <h3>{active.caseTitle}</h3>
            <p>{active.caseDescription}</p>

            <div className="vshow-dots" role="tablist" aria-label="Pilih vertikal Altora">
              {VERTICALS.map((v, i) => (
                <button
                  key={v.key}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  className={`vshow-dot ${i === index ? "is-active" : ""}`}
                  onClick={() => setIndex(i)}
                >
                  {v.label.replace("Altora ", "")}
                </button>
              ))}
            </div>
          </div>

          <div className="vshow-visual">
            <div className="vshow-glow" aria-hidden="true" />
            <div className="vshow-phone" role="img" aria-label={`Mockup aplikasi ${active.label}`}>
              <div className="vshow-screen">
                <div className="vshow-screen-head">
                  <img src={`/brand/${active.key}-symbol-onlight.svg`} alt="" />
                  <b>{active.label}</b>
                </div>
                <div className="vshow-tiles">
                  {tiles.map((tile) => (
                    <div className="vshow-tile" key={tile.label}>
                      <span>{tile.label}</span>
                      <b>{tile.value}</b>
                    </div>
                  ))}
                </div>
                <div key={active.key} className="vshow-feed">
                  {feed.map((line, i) => (
                    <div className="vshow-feed-row" key={line} style={{ "--reveal-delay": `${i * 0.06}s` } as React.CSSProperties}>
                      <span className="vshow-feed-dot" />
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
                <div className="vshow-sync">
                  <span className="vshow-sync-dot" />
                  Tersinkron otomatis
                </div>
                <div key={`${active.key}-ribbon`} className="vshow-ribbon" style={ribbonStyle} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
