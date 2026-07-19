import { FaqAccordion } from "@/components/landing/faq-accordion";
import {
  FinalCta,
  LandingShell,
  SectionHeading,
} from "@/components/landing/shared/landing-shell";
import { getLandingSeo } from "@/lib/landing/vertical-content";
import { VERTICAL_MAP } from "@/lib/verticals";

function BranchNetworkSvg() {
  return (
    <svg
      className="branch-network-svg"
      viewBox="0 0 760 350"
      role="img"
      aria-labelledby="branch-title branch-desc"
    >
      <title id="branch-title">Jaringan cabang dan approval</title>
      <desc id="branch-desc">
        Empat cabang mengirim informasi operasional menuju pusat, lalu approval
        kembali ke cabang terkait.
      </desc>
      <path
        d="M380 175 130 72M380 175 630 72M380 175 130 278M380 175 630 278"
        stroke="#c4b5fd"
        strokeWidth="5"
        strokeDasharray="9 10"
      />
      <circle cx="380" cy="175" r="72" fill="#5b21b6" />
      <text x="380" y="170" textAnchor="middle">
        ALTORA
      </text>
      <text x="380" y="194" textAnchor="middle">
        CORE
      </text>
      {[
        [130, 72, "Jakarta"],
        [630, 72, "Bandung"],
        [130, 278, "Makassar"],
        [630, 278, "Surabaya"],
      ].map(([x, y, label]) => (
        <g key={String(label)}>
          <rect
            x={Number(x) - 62}
            y={Number(y) - 32}
            width="124"
            height="64"
            rx="18"
            fill="#fff"
            stroke="#c4b5fd"
            strokeWidth="3"
          />
          <text x={Number(x)} y={Number(y) + 5} textAnchor="middle">
            {String(label)}
          </text>
        </g>
      ))}
    </svg>
  );
}
export function CompanyLanding() {
  const vertical = VERTICAL_MAP.company;
  const faqs = getLandingSeo(vertical).faqs;
  return (
    <LandingShell vertical={vertical}>
      <section className="company-hero">
        <div className="vertical-wrap company-hero-grid">
          <div>
            <span className="vertical-kicker">ALTORA COMPANY · PILOT</span>
            <h1>
              Cabang bisa bergerak cepat tanpa membuat pusat kehilangan kendali.
            </h1>
            <p>
              Satukan performance cabang, kas, approval, dan risiko operasional
              ke dalam satu jaringan peran yang jelas. Bukan sekadar dashboard
              agregat.
            </p>
            <div className="vertical-cta-row">
              <a
                className="vertical-button vertical-button-primary"
                href="/register"
              >
                Rancang control center
              </a>
              <a className="vertical-text-link" href="#company-network">
                Lihat jaringan cabang
              </a>
            </div>
          </div>
          <div className="company-hero-visual">
            <BranchNetworkSvg />
            <aside>
              <b>Approval #APR-118</b>
              <span>Transfer stok Cabang Bandung</span>
              <em>Menunggu manager area</em>
            </aside>
          </div>
        </div>
      </section>
      <section className="company-network" id="fitur">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Satu pusat, banyak konteks"
            title="Pusat membaca sinyal. Cabang tetap menjalankan pekerjaannya."
          />
          <div className="company-network-grid">
            <article>
              <b>Cabang</b>
              <p>Transaksi, stok, kas, dan tindakan lokal.</p>
            </article>
            <article>
              <b>Manager area</b>
              <p>Exception serta approval yang perlu keputusan.</p>
            </article>
            <article>
              <b>Kantor pusat</b>
              <p>Performa, risiko, policy, dan audit trail.</p>
            </article>
          </div>
        </div>
      </section>
      <section className="company-pain">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Masalah multi-cabang"
            title="Laporan gabungan bisa terlihat sehat, sementara satu cabang sudah membawa risiko yang tidak terbaca."
          />
          <div className="company-islands">
            <article>
              <strong>Cabang Jakarta</strong>
              <span>Kas sesuai</span>
            </article>
            <article>
              <strong>Cabang Bandung</strong>
              <span>Transfer belum diapprove</span>
            </article>
            <article>
              <strong>Cabang Makassar</strong>
              <span>Stok kritis</span>
            </article>
            <article>
              <strong>Cabang Surabaya</strong>
              <span>Target turun 9%</span>
            </article>
            <i>Data baru bertemu saat rekap</i>
          </div>
        </div>
      </section>
      <section className="company-proof">
        <div className="vertical-wrap company-proof-grid">
          <div>
            <SectionHeading
              eyebrow="Command center"
              title="Buka cabang yang perlu perhatian, bukan semua angka sekaligus."
            />
            <p>
              Owner dan manager area melihat exception berdasarkan urgensi dan
              peran. Audit trail menjaga keputusan tetap bisa dilacak.
            </p>
          </div>
          <div className="company-command">
            <header>
              <b>Risiko hari ini</b>
              <span>4 cabang</span>
            </header>
            <p>
              <i /> Cabang Bandung · approval transfer menunggu 4 jam
            </p>
            <p>
              <i /> Cabang Makassar · 6 SKU di bawah minimum
            </p>
            <p>
              <i /> Cabang Surabaya · refund perlu review
            </p>
            <footer>
              <b>3 tindakan perlu pemilik</b>
              <button type="button">Buka approval</button>
            </footer>
          </div>
        </div>
      </section>
      <section className="company-approval">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Approval yang kontekstual"
            title="Bukan tanda tangan di chat, tetapi keputusan dengan dampak yang jelas."
          />
          <ol>
            <li>
              <b>Permintaan</b>
              <span>Cabang mengirim alasan dan bukti.</span>
            </li>
            <li>
              <b>Review</b>
              <span>Manager melihat nilai, risiko, dan dampak.</span>
            </li>
            <li>
              <b>Keputusan</b>
              <span>Approve atau tolak dengan catatan.</span>
            </li>
            <li>
              <b>Audit trail</b>
              <span>Semua aksi dapat ditelusuri kembali.</span>
            </li>
          </ol>
        </div>
      </section>
      <section className="company-before">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Sebelum dan sesudah"
            title="Dari pulau cabang menuju jaringan yang punya bahasa operasional sama."
          />
          <div>
            <article>
              <span>Sebelum</span>
              <p>
                Owner menunggu rekap, manager mengejar update di chat, dan
                cabang bekerja dengan versi informasi berbeda.
              </p>
            </article>
            <article>
              <span>Dengan Altora</span>
              <p>
                Data tetap berada pada cabang, tetapi signal dan keputusan
                bergerak ke orang yang tepat.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="vertical-faq" id="faq">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Pertanyaan umum"
            title="Kesiapan Altora Company"
          />
          <FaqAccordion items={faqs} />
        </div>
      </section>
      <FinalCta
        title="Mulai dari satu alur lintas cabang yang paling sering tersendat."
        body="Approval, transfer stok, atau pemantauan risiko dapat menjadi titik awal tanpa memaksa semua cabang berubah sekaligus."
        action="Konsultasi multi-cabang"
      />
    </LandingShell>
  );
}
