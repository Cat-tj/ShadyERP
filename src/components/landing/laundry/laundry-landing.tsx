import { FaqAccordion } from "@/components/landing/faq-accordion";
import {
  FinalCta,
  LandingShell,
  SectionHeading,
} from "@/components/landing/shared/landing-shell";
import { getLandingSeo } from "@/lib/landing/vertical-content";
import { VERTICAL_MAP } from "@/lib/verticals";

function LaundryTagFlowSvg() {
  return (
    <svg
      className="laundry-tag-svg"
      viewBox="0 0 760 520"
      role="img"
      aria-labelledby="laundry-flow-title laundry-flow-desc"
    >
      <title id="laundry-flow-title">
        Perjalanan order laundry dari timbang sampai siap diambil
      </title>
      <desc id="laundry-flow-desc">
        Lima tag order bergerak melalui tahap diterima, dicuci, dikeringkan,
        disetrika, dan siap diambil.
      </desc>
      <rect
        x="22"
        y="32"
        width="716"
        height="456"
        rx="30"
        fill="#ecfeff"
        stroke="#a5f3fc"
        strokeWidth="2"
      />
      <path
        d="M108 264h544"
        stroke="#67e8f9"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M130 264h470"
        stroke="#0891b2"
        strokeWidth="3"
        strokeDasharray="10 13"
      />
      {[
        [118, "Diterima", "12"],
        [248, "Dicuci", "9"],
        [378, "Kering", "5"],
        [508, "Setrika", "4"],
        [638, "Siap", "3"],
      ].map(([x, label, count]) => (
        <g key={label} transform={`translate(${x} 264)`}>
          <circle r="48" fill="#fff" stroke="#22d3ee" strokeWidth="3" />
          <text y="-5" textAnchor="middle">
            {label}
          </text>
          <text y="20" textAnchor="middle" className="laundry-count">
            {count}
          </text>
        </g>
      ))}
      <g transform="translate(210 82)">
        <path d="M0 0h185l28 28-28 28H0z" fill="#0e7490" />
        <text x="18" y="22" fill="#cffafe">
          #128 · Sinta
        </text>
        <text x="18" y="42" fill="#fff">
          6,4 kg · reguler
        </text>
      </g>
      <g transform="translate(390 376)">
        <path
          d="M0 0h205l28 28-28 28H0z"
          fill="#fff"
          stroke="#22d3ee"
          strokeWidth="2"
        />
        <text x="18" y="22">
          Target selesai
        </text>
        <text x="18" y="43">
          Hari ini · 17:30
        </text>
      </g>
    </svg>
  );
}

export function LaundryLanding() {
  const vertical = VERTICAL_MAP.laundry;
  const faqs = getLandingSeo(vertical).faqs;

  return (
    <LandingShell vertical={vertical}>
      <section className="laundry-hero">
        <div className="vertical-wrap laundry-hero-grid">
          <div>
            <span className="vertical-kicker">ALTORA LAUNDRY · TERSEDIA</span>
            <h1>
              Setiap cucian punya tag, tenggat, dan jejak sampai kembali ke
              pemiliknya.
            </h1>
            <p>
              Order kiloan atau satuan bergerak tahap demi tahap. Tim melihat
              beban proses, pelanggan mendapat status yang jelas, dan tagihan
              tidak hilang saat cucian berpindah tangan.
            </p>
            <div className="vertical-cta-row">
              <a
                className="vertical-button vertical-button-primary"
                href="/register"
              >
                Atur alur laundry
              </a>
              <a className="vertical-text-link" href="#fitur">
                Lihat perjalanan order
              </a>
            </div>
          </div>
          <div className="laundry-hero-visual">
            <LaundryTagFlowSvg />
            <aside>
              <b>#128 · Sinta</b>
              <span>Cuci reguler · 6,4 kg</span>
              <em>Lewat estimasi 25 menit</em>
            </aside>
          </div>
        </div>
      </section>

      <section className="laundry-flow" id="fitur">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Alur yang bisa diikuti"
            title="Satu order berpindah tahap, bukan berpindah ingatan."
          />
          <div className="laundry-stage-line">
            <article>
              <b>Terima</b>
              <span>Timbang, layanan, parfum, catatan noda.</span>
            </article>
            <article>
              <b>Proses</b>
              <span>Cuci, kering, setrika sesuai antrean.</span>
            </article>
            <article>
              <b>Periksa</b>
              <span>Jumlah dan kondisi sebelum dikemas.</span>
            </article>
            <article>
              <b>Tagih</b>
              <span>DP, sisa bayar, dan metode pembayaran.</span>
            </article>
            <article>
              <b>Ambil</b>
              <span>Serah terima tercatat ke pelanggan.</span>
            </article>
          </div>
        </div>
      </section>

      <section className="laundry-pain">
        <div className="vertical-wrap laundry-pain-grid">
          <div
            className="laundry-tag-pile"
            aria-label="Contoh tag cucian yang tercecer"
          >
            <i>#118 · tanpa nomor HP</i>
            <i>#122 · sudah dicuci?</i>
            <i>#126 · belum lunas</i>
            <b>Tag kertas tidak menunjukkan kapasitas hari ini.</b>
          </div>
          <div>
            <SectionHeading
              eyebrow="Masalah di meja sortir"
              title="Nota ada, tetapi posisi cucian dan janji selesainya tetap harus ditanyakan."
            />
            <p>
              Ketika status hanya ditulis di kertas atau chat, tim sulit
              membedakan cucian yang terlambat, belum lunas, atau menunggu
              tindakan tertentu.
            </p>
          </div>
        </div>
      </section>

      <section className="laundry-proof">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Product proof"
            title="Supervisor melihat antrean yang perlu tindakan, bukan hanya total order."
          />
          <div className="laundry-board">
            <header>
              <b>Operasional hari ini</b>
              <span>128 order masuk</span>
            </header>
            <div>
              <article>
                <span>TERLAMBAT</span>
                <b>#128 · Sinta</b>
                <p>Lewat estimasi 25 menit</p>
              </article>
              <article>
                <span>SIAP DIAMBIL</span>
                <b>42 order</b>
                <p>3 pelanggan belum dikabari</p>
              </article>
              <article>
                <span>BELUM LUNAS</span>
                <b>Rp1.280.000</b>
                <p>5 order siap serah terima</p>
              </article>
            </div>
            <footer>
              <b>Kapasitas cuci 78%</b>
              <span>Data supervisor tersinkron</span>
            </footer>
          </div>
        </div>
      </section>

      <section className="laundry-before">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Sebelum dan sesudah"
            title="Dari tumpukan nota ke antrean yang punya urutan."
          />
          <div>
            <article>
              <span>Sebelum</span>
              <p>
                Pelanggan menelepon, staf mencari nota, lalu mengecek rak satu
                per satu.
              </p>
            </article>
            <article>
              <span>Dengan alur laundry</span>
              <p>
                Status, estimasi, pembayaran, dan serah terima mengikuti nomor
                order yang sama.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="laundry-roles">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Perangkat sesuai tugas"
            title="Meja terima cepat, area proses tetap sederhana."
          />
          <div>
            <p>
              <b>HP penerima</b> · tambah order dan foto kondisi.
            </p>
            <p>
              <b>Tablet proses</b> · pindahkan status per antrean.
            </p>
            <p>
              <b>Laptop owner</b> · kapasitas, tagihan, dan performa outlet.
            </p>
          </div>
        </div>
      </section>
      <section className="vertical-faq" id="faq">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Pertanyaan umum"
            title="Kesiapan Altora Laundry"
          />
          <FaqAccordion items={faqs} />
        </div>
      </section>
      <FinalCta
        title="Mulai dari perjalanan satu cucian sampai kembali ke pelanggan."
        body="Atur layanan, tahapan, estimasi, dan pembayaran sesuai cara kerja laundry hari ini."
        action="Konsultasi laundry"
      />
    </LandingShell>
  );
}
