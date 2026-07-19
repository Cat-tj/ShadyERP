import { FaqAccordion } from "@/components/landing/faq-accordion";
import {
  FinalCta,
  SectionHeading,
} from "@/components/landing/shared/landing-shell";
import { SiteNav } from "@/components/landing/site-nav";
import { getLandingSeo } from "@/lib/landing/vertical-content";

const solutionGroups = [
  { label: "Retail & POS", items: ["Cafe", "Toko", "Supermarket"] },
  { label: "Service", items: ["Laundry", "Counter", "Jasa"] },
  { label: "Manufacturing", items: ["Pabrik"] },
  { label: "People & Finance", items: ["Teams", "Accounting"] },
  { label: "Multi-branch", items: ["Company"] },
];

function EcosystemMapSvg() {
  return (
    <svg
      className="root-ecosystem-svg"
      viewBox="0 0 820 560"
      role="img"
      aria-labelledby="ecosystem-title ecosystem-desc"
    >
      <title id="ecosystem-title">Peta ekosistem operasional Altora</title>
      <desc id="ecosystem-desc">
        Data dari kasir, stok, tim, dan layanan mengalir ke pusat tindakan yang
        sama.
      </desc>
      <rect
        x="20"
        y="24"
        width="780"
        height="512"
        rx="34"
        fill="#fbfaff"
        stroke="#ddd6fe"
        strokeWidth="2"
      />
      <g className="root-source">
        <rect x="62" y="84" width="176" height="76" rx="14" />
        <text x="88" y="115">
          Kasir & order
        </text>
        <text x="88" y="140">
          Transaksi lapangan
        </text>
      </g>
      <g className="root-source">
        <rect x="62" y="192" width="176" height="76" rx="14" />
        <text x="88" y="223">
          Stok & pembelian
        </text>
        <text x="88" y="248">
          Barang bergerak
        </text>
      </g>
      <g className="root-source">
        <rect x="62" y="300" width="176" height="76" rx="14" />
        <text x="88" y="331">
          Tim & layanan
        </text>
        <text x="88" y="356">
          Pekerjaan berjalan
        </text>
      </g>
      <g className="root-source">
        <rect x="62" y="408" width="176" height="76" rx="14" />
        <text x="88" y="439">
          Uang & dokumen
        </text>
        <text x="88" y="464">
          Jejak keputusan
        </text>
      </g>
      <path
        d="M238 122h92M238 230h92M238 338h92M238 446h92"
        stroke="#c4b5fd"
        strokeWidth="3"
      />
      <path d="M330 122v324" stroke="#c4b5fd" strokeWidth="3" />
      <g className="root-core">
        <rect x="330" y="168" width="220" height="232" rx="28" />
        <text x="440" y="236" textAnchor="middle">
          ALTORA
        </text>
        <text x="440" y="270" textAnchor="middle">
          Satu sumber data
        </text>
        <path
          d="M382 314h116"
          stroke="#fff"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <circle cx="404" cy="314" r="13" fill="#e879f9" />
        <circle cx="440" cy="314" r="13" fill="#67e8f9" />
        <circle cx="476" cy="314" r="13" fill="#5eead4" />
        <text x="440" y="360" textAnchor="middle">
          Catat → Otomatisasi → Tindakan
        </text>
      </g>
      <path
        d="M550 218h66M550 284h66M550 350h66"
        stroke="#c4b5fd"
        strokeWidth="3"
      />
      <g className="root-output">
        <rect x="616" y="178" width="142" height="80" rx="14" />
        <text x="638" y="211">
          Perlu tindakan
        </text>
        <text x="638" y="237">
          Bukan data mentah
        </text>
      </g>
      <g className="root-output">
        <rect x="616" y="270" width="142" height="80" rx="14" />
        <text x="638" y="303">
          Laporan siap
        </text>
        <text x="638" y="329">
          Sesuai peran
        </text>
      </g>
      <g className="root-output">
        <rect x="616" y="362" width="142" height="80" rx="14" />
        <text x="638" y="395">
          Jejak audit
        </text>
        <text x="638" y="421">
          Bisa ditelusuri
        </text>
      </g>
    </svg>
  );
}

export function RootLanding() {
  const faqs = getLandingSeo().faqs;

  return (
    <div className="altora-landing vertical-landing vertical-root">
      <SiteNav />
      <main id="top">
        <section className="root-hero">
          <div className="vertical-wrap root-hero-grid">
            <div>
              <span className="vertical-kicker">
                SATU FONDASI · BANYAK CARA KERJA
              </span>
              <h1>
                Catat fakta lapangan sekali. Altora menyiapkan tindakan
                berikutnya.
              </h1>
              <p>
                Dari transaksi, barang masuk, pekerjaan tim, sampai uang yang
                berpindah: setiap kejadian membentuk satu jejak operasional yang
                bisa dipakai orang berikutnya.
              </p>
              <div className="vertical-cta-row">
                <a
                  className="vertical-button vertical-button-primary"
                  href="/register"
                >
                  Mulai atur usahamu
                </a>
                <a className="vertical-text-link" href="#solusi">
                  Lihat pilihan solusi
                </a>
              </div>
            </div>
            <div className="root-hero-visual">
              <EcosystemMapSvg />
              <aside>
                <b>3 tindakan baru</b>
                <span>Stok menipis · pembayaran belum cocok</span>
                <em>Data datang dari pekerjaan nyata</em>
              </aside>
            </div>
          </div>
        </section>

        <section className="root-solutions" id="solusi">
          <div className="vertical-wrap">
            <SectionHeading
              eyebrow="Cocok untuk cara kerjamu"
              title="Pilih alur usaha, bukan tumpukan modul."
              description="Semua solusi berdiri di fondasi data yang sama. Yang terlihat hanya pekerjaan yang relevan untuk timmu."
            />
            <div className="root-solution-groups">
              {solutionGroups.map((group) => (
                <article key={group.label}>
                  <b>{group.label}</b>
                  <div>
                    {group.items.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="root-method" id="fitur">
          <div className="vertical-wrap root-method-grid">
            <div>
              <SectionHeading
                eyebrow="Cara kerja Altora"
                title="Lebih sedikit input ulang. Lebih banyak tindakan yang jelas."
              />
              <p>
                Sistem tidak meminta tim memelihara dashboard. Tim cukup
                mencatat pekerjaan yang memang terjadi di lapangan.
              </p>
            </div>
            <ol>
              <li>
                <b>1 · Catat</b>
                <span>Scan, terima, bayar, absen, atau ubah status.</span>
              </li>
              <li>
                <b>2 · Hubungkan</b>
                <span>
                  Stok, uang, dokumen, dan orang memakai kejadian yang sama.
                </span>
              </li>
              <li>
                <b>3 · Tindak</b>
                <span>Owner melihat pengecualian yang perlu keputusan.</span>
              </li>
            </ol>
          </div>
        </section>

        <section className="root-proof">
          <div className="vertical-wrap">
            <SectionHeading
              eyebrow="Product proof"
              title="Satu kejadian, tiga tampilan sesuai tanggung jawab."
            />
            <div className="root-role-proof">
              <article>
                <span>KASIR · HP</span>
                <b>Transaksi selesai</b>
                <p>Metode bayar dan item tercatat.</p>
              </article>
              <article>
                <span>SUPERVISOR · TABLET</span>
                <b>Stok gula di bawah minimum</b>
                <p>Buat restock atau transfer cabang.</p>
              </article>
              <article>
                <span>OWNER · LAPTOP</span>
                <b>Selisih kas menunggu review</b>
                <p>Tutup hari dengan konteks lengkap.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="root-pain">
          <div className="vertical-wrap root-pain-grid">
            <div className="root-fragments">
              <i>WA: barang datang 12 dus</i>
              <i>Excel: omzet cabang</i>
              <i>Kertas: jadwal shift</i>
              <i>Nota: belum lunas</i>
              <b>Empat tempat menyimpan satu cerita usaha.</b>
            </div>
            <div>
              <SectionHeading
                eyebrow="Masalah yang diselesaikan"
                title="Bisnis tidak kekurangan data. Data itu hanya terpisah dari keputusan."
              />
              <p>
                Altora menyatukan kejadian lapangan agar owner tidak menjadi
                satu-satunya orang yang bisa menghubungkan chat, kertas,
                spreadsheet, dan ingatan.
              </p>
            </div>
          </div>
        </section>

        <section className="root-pricing" id="harga">
          <div className="vertical-wrap">
            <SectionHeading
              eyebrow="Mulai sesuai kebutuhan"
              title="Aktifkan alur yang dipakai sekarang. Tambah saat operasi bertumbuh."
            />
            <div>
              <article>
                <span>RINGKAS</span>
                <h3>Operasional inti</h3>
                <p>Kasir, produk, stok, uang harian, dan data dasar.</p>
                <a href="/register">Mulai gratis</a>
              </article>
              <article>
                <span>OPERASIONAL</span>
                <h3>Tim dan cabang</h3>
                <p>Alur kerja khusus, approval, pelaporan, dan multi-outlet.</p>
                <a
                  href="https://wa.me/6285190911170"
                  target="_blank"
                  rel="noopener"
                >
                  Bahas kebutuhan
                </a>
              </article>
              <article>
                <span>COMPANY</span>
                <h3>Kontrol menyeluruh</h3>
                <p>
                  Peran kompleks, audit, integrasi, dan pendampingan
                  implementasi.
                </p>
                <a
                  href="https://wa.me/6285190911170"
                  target="_blank"
                  rel="noopener"
                >
                  Konsultasi
                </a>
              </article>
            </div>
          </div>
        </section>

        <section className="vertical-faq" id="faq">
          <div className="vertical-wrap">
            <SectionHeading
              eyebrow="Pertanyaan umum"
              title="Sebelum mulai memakai Altora"
            />
            <FaqAccordion items={faqs} />
          </div>
        </section>
        <FinalCta
          title="Mulai dari satu alur yang paling sering membuat tim berhenti dan bertanya."
          body="Kami bantu memetakan cara kerja usahamu ke fondasi Altora tanpa memenuhi layar dengan fitur yang belum dibutuhkan."
          action="Konsultasi alur usaha"
        />
      </main>
      <footer className="vertical-footer" id="kontak">
        <div className="vertical-wrap vertical-footer-grid">
          <div>
            <strong>ALTORA</strong>
            <p>Satu fondasi operasional untuk banyak cara kerja.</p>
          </div>
          <div>
            <span>Butuh bantuan memilih solusi?</span>
            <a
              href="https://wa.me/6285190911170"
              target="_blank"
              rel="noopener"
            >
              Hubungi tim Altora
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
