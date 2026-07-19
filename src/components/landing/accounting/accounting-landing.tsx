import { FaqAccordion } from "@/components/landing/faq-accordion";
import {
  FinalCta,
  LandingShell,
  SectionHeading,
} from "@/components/landing/shared/landing-shell";
import { getLandingSeo } from "@/lib/landing/vertical-content";
import { VERTICAL_MAP } from "@/lib/verticals";

function LedgerFlowSvg() {
  return (
    <svg
      className="ledger-flow-svg"
      viewBox="0 0 780 360"
      role="img"
      aria-labelledby="ledger-title ledger-desc"
    >
      <title id="ledger-title">
        Aliran transaksi ke buku besar dan laporan
      </title>
      <desc id="ledger-desc">
        Kas, piutang, hutang, stok, dan payroll mengalir ke jurnal dan buku
        besar sebelum rekonsiliasi serta laporan keuangan.
      </desc>
      <g className="ledger-source">
        <rect x="35" y="34" width="140" height="48" rx="14" />
        <text x="105" y="64" textAnchor="middle">
          Penjualan
        </text>
        <rect x="35" y="108" width="140" height="48" rx="14" />
        <text x="105" y="138" textAnchor="middle">
          Pembelian
        </text>
        <rect x="35" y="182" width="140" height="48" rx="14" />
        <text x="105" y="212" textAnchor="middle">
          Kas &amp; bank
        </text>
        <rect x="35" y="256" width="140" height="48" rx="14" />
        <text x="105" y="286" textAnchor="middle">
          Persediaan
        </text>
      </g>
      <path
        d="M176 58h112m-112 74h112m-112 74h112m-112 74h112"
        stroke="#6ee7b7"
        strokeWidth="4"
        strokeDasharray="7 8"
      />
      <g className="ledger-journal">
        <rect x="289" y="90" width="172" height="160" rx="24" />
        <text x="375" y="123" textAnchor="middle">
          JURNAL
        </text>
        <path d="M320 150h110m-110 28h110m-110 28h110m-110 28h82" />
      </g>
      <path d="M462 170h94" stroke="#047857" strokeWidth="6" />
      <g className="ledger-gl">
        <rect x="557" y="66" width="188" height="208" rx="26" />
        <text x="651" y="103" textAnchor="middle">
          GENERAL LEDGER
        </text>
        <path d="M584 132h134m-134 31h134m-134 31h134m-134 31h98" />
        <circle cx="692" cy="231" r="18" />
      </g>
      <path d="M651 275v40" stroke="#047857" strokeWidth="5" />
      <g className="ledger-report">
        <rect x="559" y="315" width="92" height="30" rx="9" />
        <rect x="666" y="315" width="80" height="30" rx="9" />
      </g>
    </svg>
  );
}

export function AccountingLanding() {
  const vertical = VERTICAL_MAP.accounting;
  const faqs = getLandingSeo(vertical).faqs;
  return (
    <LandingShell vertical={vertical}>
      <section className="accounting-hero">
        <div className="vertical-wrap accounting-hero-grid">
          <div>
            <span className="vertical-kicker">ALTORA ACCOUNTING · BETA</span>
            <h1>
              Transaksi tidak seharusnya diketik ulang hanya untuk membuat
              laporan bisa dipercaya.
            </h1>
            <p>
              Bangun jejak dari aktivitas operasional ke jurnal, buku besar,
              rekonsiliasi, dan period close. Terapkan bertahap sesuai
              accounting mode dan kesiapan tim keuangan.
            </p>
            <div className="vertical-cta-row">
              <a
                className="vertical-button vertical-button-primary"
                href="/register"
              >
                Tinjau kesiapan pembukuan
              </a>
              <a className="vertical-text-link" href="#ledger-flow">
                Lihat ledger flow
              </a>
            </div>
          </div>
          <div className="accounting-hero-visual">
            <LedgerFlowSvg />
            <aside>
              <b>Rekonsiliasi bank</b>
              <span>Selisih Rp1.250.000 perlu ditelusuri</span>
              <em>2 transaksi belum cocok</em>
            </aside>
          </div>
        </div>
      </section>
      <section className="accounting-flow" id="fitur">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Dari transaksi ke laporan"
            title="Setiap angka punya jalur yang bisa diperiksa."
          />
          <div className="accounting-flow-steps">
            <span>Transaksi</span>
            <i>→</i>
            <span>Subledger</span>
            <i>→</i>
            <span>Jurnal</span>
            <i>→</i>
            <span>General ledger</span>
            <i>→</i>
            <span>Rekonsiliasi</span>
            <i>→</i>
            <span>Laporan</span>
          </div>
        </div>
      </section>
      <section className="accounting-pain">
        <div className="vertical-wrap accounting-pain-grid">
          <div className="accounting-sheets">
            <i>Kas_final_v7.xlsx</i>
            <i>Utang supplier terbaru.xlsx</i>
            <i>Jurnal Q2 revisi.xlsx</i>
            <b>3 versi angka, 1 keputusan tertunda</b>
          </div>
          <div>
            <span>Masalah sebelum close</span>
            <h2>
              Waktu habis mencari angka mana yang benar, bukan memahami apa yang
              harus dilakukan.
            </h2>
            <p>
              Kas, piutang, hutang, persediaan, dan pembayaran tercatat di
              tempat berbeda. Selisih baru muncul ketika laporan perlu ditutup.
            </p>
          </div>
        </div>
      </section>
      <section className="accounting-proof">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Close cockpit"
            title="Mulai close dari exception yang benar-benar membutuhkan keputusan."
          />
          <div className="accounting-cockpit">
            <header>
              <b>Juli 2026 · Draft close</b>
              <span>Data contoh</span>
            </header>
            <div>
              <article>
                <small>REKONSILIASI</small>
                <h3>2 transaksi belum cocok</h3>
                <p>Bank BCA · selisih Rp1.250.000</p>
                <button type="button">Tinjau selisih</button>
              </article>
              <article>
                <small>HUTANG</small>
                <h3>4 tagihan mendekati jatuh tempo</h3>
                <p>Supplier bahan baku · 7 hari</p>
                <button type="button">Buka hutang</button>
              </article>
              <article>
                <small>JURNAL</small>
                <h3>1 jurnal menunggu review</h3>
                <p>Penyesuaian persediaan · Cabang BSD</p>
                <button type="button">Tinjau jurnal</button>
              </article>
            </div>
          </div>
        </div>
      </section>
      <section className="accounting-before-after">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Sebelum dan sesudah"
            title="Dari sheet yang tersebar menuju ledger yang seimbang."
          />
          <div className="accounting-balance">
            <article>
              <span>Sebelum</span>
              <h3>Transaksi diinput ulang</h3>
              <p>
                Tim memperbaiki laporan dengan salinan file, lalu mencari
                penyebab selisih setelah period hampir berakhir.
              </p>
            </article>
            <div className="accounting-equals" aria-hidden="true">
              =
            </div>
            <article>
              <span>Dengan alur accounting</span>
              <h3>Jejak transaksi bisa ditelusuri</h3>
              <p>
                Exception, approval, dan reconciliation menjadi bagian dari
                proses close, bukan pekerjaan tambahan di akhir bulan.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="accounting-role-showcase">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Peran dan perangkat"
            title="Owner membaca risiko, finance mengendalikan close."
          />
          <div>
            <article>
              <span>Mobile</span>
              <h3>Finance exception</h3>
              <p>Approval dan notifikasi yang butuh keputusan.</p>
            </article>
            <article>
              <span>Tablet</span>
              <h3>Journal review</h3>
              <p>Review biaya dan bukti saat berada di lapangan.</p>
            </article>
            <article>
              <span>Laptop</span>
              <h3>Close cockpit</h3>
              <p>Ledger, rekonsiliasi, AP/AR, dan laporan.</p>
            </article>
          </div>
        </div>
      </section>
      <section className="vertical-faq" id="faq">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Pertanyaan umum"
            title="Kesiapan Altora Accounting"
          />
          <FaqAccordion items={faqs} />
        </div>
      </section>
      <FinalCta
        title="Rapikan jalur angka sebelum mengejar laporan yang lebih kompleks."
        body="Mulai dari transaksi yang sudah ada, exception yang nyata, dan kontrol yang memang digunakan tim keuangan."
        action="Konsultasi accounting"
      />
    </LandingShell>
  );
}
