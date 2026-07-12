"use client";

import { useEffect, useRef, useState } from "react";
import { VERTICALS, type VerticalKey } from "@/lib/verticals";
import { HERO_MOCKS } from "@/lib/hero-mocks";

/** Data mockup layar HP per vertikal — cuma buat ilustrasi visual, bukan data asli. */
const SCREEN_TILES: Record<VerticalKey, [{ label: string; value: string }, { label: string; value: string }]> = {
  cafe: [{ label: "Omzet hari ini", value: "Rp3,4jt" }, { label: "Meja aktif", value: "5" }],
  toko: [{ label: "Stok terjual", value: "142" }, { label: "Produk laris", value: "Indomie" }],
  supermarket: [{ label: "SKU aktif", value: "1.240" }, { label: "Barang masuk", value: "18" }],
  laundry: [{ label: "Cucian proses", value: "9" }, { label: "Siap diambil", value: "3" }],
  counter: [{ label: "Servis masuk", value: "4" }, { label: "Garansi aktif", value: "27" }],
  jasa: [{ label: "Booking hari ini", value: "6" }, { label: "Staf pegang", value: "3" }],
  pabrik: [{ label: "Bahan baku aman", value: "92%" }, { label: "Maintenance", value: "1" }],
  company: [{ label: "Cabang aktif", value: "12" }, { label: "Approval jalan", value: "3" }],
  teams: [{ label: "Hadir hari ini", value: "18/20" }, { label: "Target tim", value: "72%" }],
  accounting: [{ label: "Kas hari ini", value: "Rp8,1jt" }, { label: "Laba bulan", value: "+14%" }],
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
  const mock = HERO_MOCKS[active.key];

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
            <div
              className="vshow-stage"
              role="img"
              aria-label={`Mockup aplikasi ${active.label} di laptop, tablet, dan HP — data yang sama, tersinkron di semua perangkat`}
            >
              {/* Laptop — dashboard penuh */}
              <div className="vshow-laptop" aria-hidden="true">
                <div className="vshow-laptop-screen">
                  <div className="vshow-lap-inner">
                    <div className="vshow-chrome">
                      <span className="vshow-cdot" /><span className="vshow-cdot" /><span className="vshow-cdot" />
                      <span className="vshow-curl mono">{active.subdomain}.altora.my.id / dashboard</span>
                    </div>
                    <div className="vshow-lap-body">
                      <div className="vshow-lap-title">
                        <b>{active.label.replace("Altora ", "")} · Hari ini</b>
                        <span className="vshow-live"><i />Live</span>
                      </div>
                      <div className="vshow-lap-tabs">
                        {mock.dashTabs.map((tab, i) => (
                          <span key={tab} className={`vshow-lap-tab ${i === 0 ? "is-on" : ""}`}>{tab}</span>
                        ))}
                      </div>
                      <div className="vshow-lap-tiles">
                        {mock.dashTiles.slice(0, 3).map((tile) => (
                          <div className="vshow-tile" key={tile.label}>
                            <span>{tile.label}</span>
                            <b>{tile.value}</b>
                            <small className={tile.warn ? "warn" : ""}>{tile.delta}</small>
                          </div>
                        ))}
                      </div>
                      <div className="vshow-lap-live">
                        <div>
                          <b>{mock.liveTitle}</b>
                          <span>{mock.liveDetail}</span>
                        </div>
                        <span className="vshow-lap-live-badge">{mock.liveStatus}</span>
                      </div>
                      <div className="vshow-lap-chart">
                        <span className="mono">{mock.chartLabel}</span>
                        <svg viewBox="0 0 300 52" width="100%" height="44" preserveAspectRatio="none">
                          <polyline
                            points="0,40 24,36 48,38 72,29 96,31 120,24 144,26 168,19 192,21 216,14 240,16 264,9 300,5"
                            fill="none" stroke="var(--primary)" strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round"
                            style={{ transition: "stroke 0.6s ease" }}
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="vshow-laptop-base" />
              </div>

              {/* Tablet — ringkasan laporan/nota */}
              <div className="vshow-tablet" aria-hidden="true">
                <div className="vshow-tablet-screen">
                  <span className="vshow-tab-kicker">Ringkasan</span>
                  <p className="vshow-tab-title">{mock.receiptBrandSub}</p>
                  {mock.receiptItems.map(([label, value]) => (
                    <div className="vshow-tab-row" key={label}><span>{label}</span><b>{value}</b></div>
                  ))}
                  <div className="vshow-tab-row"><span>{mock.receiptHighlight[0]}</span><b>{mock.receiptHighlight[1]}</b></div>
                  <div className="vshow-tab-total"><span>TOTAL</span><b>{mock.receiptTotal}</b></div>
                </div>
              </div>

              {/* iPhone — ringkas + feed aktivitas */}
              <div className="vshow-phone" aria-hidden="true">
                <span className="vshow-island" />
                <div className="vshow-screen">
                  <div className="vshow-screen-head">
                    <img src={`/brand/${active.key}-symbol-onlight.svg`} alt="" />
                    <b>{active.label}</b>
                  </div>
                  <div className="vshow-ph-tiles">
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
      </div>
    </section>
  );
}
