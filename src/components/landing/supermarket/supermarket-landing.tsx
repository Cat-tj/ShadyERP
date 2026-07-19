import { FaqAccordion } from "@/components/landing/faq-accordion";
import {
  FinalCta,
  LandingShell,
  SectionHeading,
} from "@/components/landing/shared/landing-shell";
import { getLandingSeo } from "@/lib/landing/vertical-content";
import { VERTICAL_MAP } from "@/lib/verticals";

function SupermarketLanesSvg() {
  return (
    <svg
      className="market-lanes-svg"
      viewBox="0 0 760 330"
      role="img"
      aria-labelledby="market-title market-desc"
    >
      <title id="market-title">Multi-lane supermarket control</title>
      <desc id="market-desc">
        Barang diterima, melewati quality check dan expiry check sebelum masuk
        gudang dan kasir.
      </desc>
      <defs>
        <linearGradient id="lane" x1="0" x2="1">
          <stop stopColor="#a5b4fc" />
          <stop offset="1" stopColor="#3730a3" />
        </linearGradient>
      </defs>
      {[78, 146, 214].map((y, i) => (
        <g key={y}>
          <path
            d={`M45 ${y}H702`}
            stroke="#e0e7ff"
            strokeWidth="28"
            strokeLinecap="round"
          />
          <path
            d={`M45 ${y}H702`}
            stroke="url(#lane)"
            strokeWidth="4"
            strokeDasharray="12 12"
          />
          <rect
            x={130 + i * 85}
            y={y - 18}
            width="44"
            height="36"
            rx="8"
            fill="#fff"
            stroke="#818cf8"
          />
          <rect
            x={350 + i * 60}
            y={y - 18}
            width="44"
            height="36"
            rx="8"
            fill="#fff"
            stroke="#818cf8"
          />
          <circle
            cx={610 - i * 35}
            cy={y}
            r="18"
            fill={i === 1 ? "#fee2e2" : "#e0e7ff"}
          />
        </g>
      ))}
      <g className="market-label">
        <rect x="40" y="262" width="115" height="40" rx="12" />
        <text x="97" y="287" textAnchor="middle">
          Receiving
        </text>
        <rect x="270" y="262" width="115" height="40" rx="12" />
        <text x="327" y="287" textAnchor="middle">
          QC &amp; expiry
        </text>
        <rect x="535" y="262" width="130" height="40" rx="12" />
        <text x="600" y="287" textAnchor="middle">
          Store &amp; lane
        </text>
      </g>
    </svg>
  );
}
export function SupermarketLanding() {
  const vertical = VERTICAL_MAP.supermarket;
  const faqs = getLandingSeo(vertical).faqs;
  return (
    <LandingShell vertical={vertical}>
      <section className="market-hero">
        <div className="vertical-wrap market-hero-grid">
          <div>
            <span className="vertical-kicker">ALTORA SUPERMARKET · PILOT</span>
            <h1>
              Ribuan SKU butuh jalur kontrol, bukan daftar stok yang makin
              panjang.
            </h1>
            <p>
              Hubungkan receiving, quality check, expiry, gudang, lane kasir,
              dan cash office agar exception tidak terkubur di laporan akhir
              hari.
            </p>
            <div className="vertical-cta-row">
              <a
                className="vertical-button vertical-button-primary"
                href="/register"
              >
                Rancang alur supermarket
              </a>
              <a className="vertical-text-link" href="#market-flow">
                Lihat control flow
              </a>
            </div>
          </div>
          <div className="market-hero-visual">
            <SupermarketLanesSvg />
            <aside>
              <b>Batch YG260701A</b>
              <span>Near expiry · 6 hari</span>
              <em>Masuk markdown queue</em>
            </aside>
          </div>
        </div>
      </section>
      <section className="market-queue">
        <div className="vertical-wrap">
          <span>Queue prioritas</span>
          <b>12 batch near expiry</b>
          <b>7 exception QC</b>
          <b>4 PO menunggu penerimaan</b>
          <a href="#market-proof">Buka exception board →</a>
        </div>
      </section>
      <section className="market-flow" id="fitur">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Control flow"
            title="Barang bergerak dari supplier sampai lane tanpa kehilangan konteks."
          />
          <div className="market-flow-grid">
            <article>
              <b>01</b>
              <h3>Purchase order</h3>
              <p>Supplier, harga, kuantitas, ETA.</p>
            </article>
            <article>
              <b>02</b>
              <h3>Receiving &amp; QC</h3>
              <p>Barang, batch, selisih, dan kondisi.</p>
            </article>
            <article>
              <b>03</b>
              <h3>Expiry &amp; lokasi</h3>
              <p>Aturan FEFO dan penyimpanan.</p>
            </article>
            <article>
              <b>04</b>
              <h3>Lane &amp; cash office</h3>
              <p>Penjualan dan settlement bergulir.</p>
            </article>
          </div>
        </div>
      </section>
      <section className="market-pain">
        <div className="vertical-wrap market-pain-layout">
          <div>
            <SectionHeading
              eyebrow="Ketika exception tidak terlihat"
              title="Barang sudah diterima, tapi masalahnya baru muncul saat rak kosong atau markdown terlambat."
            />
            <p>
              Tim receiving tahu batch yang bermasalah, gudang menyimpan
              informasi lain, dan store baru tahu setelah pelanggan menemukan
              harga atau kondisi yang tidak cocok.
            </p>
          </div>
          <div className="market-exception-lane">
            <header>
              <b>Exception lane</b>
              <span>Hari ini</span>
            </header>
            <p>
              <i /> QC: Minyak 1L · selisih 12 pcs
            </p>
            <p>
              <i /> Expiry: Yogurt 200ml · 6 hari
            </p>
            <p>
              <i /> Lokasi: SKU 00191 · rack mismatch
            </p>
            <strong>3 exception belum ditugaskan</strong>
          </div>
        </div>
      </section>
      <section className="market-proof" id="market-proof">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Product proof"
            title="Prioritas bukan sekadar warna di dashboard."
          />
          <div className="market-board">
            <article>
              <span>NEAR EXPIRY</span>
              <h3>Yogurt 200ml · Batch YG260701A</h3>
              <p>Stok 48 · expired 6 hari · rekomendasi markdown</p>
              <button type="button">Buat tindakan markdown</button>
            </article>
            <article>
              <span>RECEIVING</span>
              <h3>PO #482 · PT Sinar Jaya</h3>
              <p>120 item · 1 selisih · QC perlu review</p>
              <button type="button">Buka penerimaan</button>
            </article>
            <article>
              <span>CASH OFFICE</span>
              <h3>Lane 03 · settlement menunggu</h3>
              <p>Kas fisik dan digital perlu dicocokkan</p>
              <button type="button">Tinjau settlement</button>
            </article>
          </div>
        </div>
      </section>
      <section className="market-before">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Sebelum dan sesudah"
            title="Dari lane yang bekerja sendiri menjadi jaringan toko yang bisa diawasi."
          />
          <div className="market-compare">
            <article>
              <span>Sebelum</span>
              <h3>Exception tertinggal di tiap meja</h3>
              <p>
                Receiving, gudang, kasir, dan store menyimpan informasi yang
                tidak bergerak bersama.
              </p>
            </article>
            <article>
              <span>Sesudah</span>
              <h3>Exception punya pemilik dan langkah berikutnya</h3>
              <p>
                Tim melihat batch, lokasi, harga, dan settlement dalam alur yang
                dapat ditindak.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="market-outcome">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Peran &amp; perangkat"
            title="Tiap orang melihat pekerjaan yang memang perlu diselesaikan."
          />
          <div>
            <p>
              <b>Mobile store lead</b> · exception yang perlu ditindak di lantai
              toko.
            </p>
            <p>
              <b>Tablet receiving</b> · QC, batch, dan lokasi barang datang.
            </p>
            <p>
              <b>Laptop control room</b> · PO, expiry, cash office, dan
              exception lintas lane.
            </p>
          </div>
        </div>
      </section>
      <section className="vertical-faq" id="faq">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Pertanyaan umum"
            title="Kesiapan Altora Supermarket"
          />
          <FaqAccordion items={faqs} />
        </div>
      </section>
      <FinalCta
        title="Bangun jalur kontrol sebelum menambah kompleksitas operasional."
        body="Mulai dari receiving, batch/expiry, atau cash office yang paling sering menciptakan exception."
        action="Konsultasi supermarket"
      />
    </LandingShell>
  );
}
