import { FaqAccordion } from "@/components/landing/faq-accordion";
import {
  FinalCta,
  LandingShell,
  SectionHeading,
} from "@/components/landing/shared/landing-shell";
import { getLandingSeo } from "@/lib/landing/vertical-content";
import { VERTICAL_MAP } from "@/lib/verticals";

function ProductionLineSvg() {
  return (
    <svg
      className="factory-line-svg"
      viewBox="0 0 760 380"
      role="img"
      aria-labelledby="factory-title factory-desc"
    >
      <title id="factory-title">
        Alur produksi dari material sampai quality check
      </title>
      <desc id="factory-desc">
        Material, work order, mesin, quality check, dan batch bergerak dalam
        satu jalur produksi.
      </desc>
      <defs>
        <linearGradient id="factory-fill" x1="0" x2="1">
          <stop stopColor="#fb923c" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <path
        d="M58 278H704"
        stroke="#cbd5e1"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <path
        d="M58 278H704"
        stroke="url(#factory-fill)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="18 14"
      />
      <g className="factory-node">
        <rect
          x="40"
          y="150"
          width="116"
          height="98"
          rx="18"
          fill="#fff7ed"
          stroke="#fdba74"
        />
        <path
          d="M72 202h52M82 183h32M82 221h32"
          stroke="#c2410c"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <text x="98" y="273" textAnchor="middle">
          Material
        </text>
      </g>
      <g className="factory-node">
        <rect
          x="205"
          y="110"
          width="138"
          height="138"
          rx="22"
          fill="#fff"
          stroke="#fed7aa"
        />
        <circle
          cx="274"
          cy="178"
          r="35"
          fill="#fff7ed"
          stroke="#ea580c"
          strokeWidth="7"
        />
        <path
          d="M274 143v70M239 178h70"
          stroke="#ea580c"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <text x="274" y="274" textAnchor="middle">
          Work order
        </text>
      </g>
      <g className="factory-node">
        <rect
          x="393"
          y="92"
          width="132"
          height="156"
          rx="22"
          fill="#fff"
          stroke="#fed7aa"
        />
        <rect x="420" y="125" width="78" height="60" rx="10" fill="#ffedd5" />
        <path
          d="M438 214h42M451 185v29M468 185v29"
          stroke="#c2410c"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <text x="459" y="274" textAnchor="middle">
          Mesin
        </text>
      </g>
      <g className="factory-node">
        <rect
          x="576"
          y="150"
          width="116"
          height="98"
          rx="18"
          fill="#fff7ed"
          stroke="#fdba74"
        />
        <path
          d="m608 197 16 16 35-43"
          fill="none"
          stroke="#16a34a"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x="634" y="273" textAnchor="middle">
          QC &amp; batch
        </text>
      </g>
      <path
        d="M156 199h49m138-20h50m132 20h51"
        stroke="#f97316"
        strokeWidth="5"
        strokeDasharray="8 8"
      />
      <g className="factory-alert">
        <circle cx="459" cy="54" r="22" fill="#fee2e2" />
        <path
          d="M459 43v14m0 8v1"
          stroke="#dc2626"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function PabrikLanding() {
  const vertical = VERTICAL_MAP.pabrik;
  const faqs = getLandingSeo(vertical).faqs;
  return (
    <LandingShell vertical={vertical}>
      <section className="factory-hero">
        <div className="vertical-wrap factory-hero-grid">
          <div>
            <span className="vertical-kicker">ALTORA PABRIK · PILOT</span>
            <h1>
              Ketika material kurang, planner tahu sebelum lini ikut berhenti.
            </h1>
            <p>
              Catat work order, kebutuhan material, kondisi mesin, dan hasil QC
              dalam satu alur yang bisa ditindak. Bukan dashboard kasir yang
              dipaksa menjadi pabrik.
            </p>
            <div className="vertical-cta-row">
              <a
                className="vertical-button vertical-button-primary"
                href="/register"
              >
                Diskusikan alur produksi
              </a>
              <a className="vertical-text-link" href="#alur-produksi">
                Lihat alur produksi
              </a>
            </div>
          </div>
          <div className="factory-hero-visual">
            <ProductionLineSvg />
            <aside>
              <b>WO-204 tertahan</b>
              <span>Material gula putih kurang 200 kg</span>
              <em>Perlu tindakan planner</em>
            </aside>
          </div>
        </div>
      </section>
      <section className="factory-exceptions">
        <div className="vertical-wrap">
          <span>Exception hari ini</span>
          <b>1 material kurang</b>
          <b>2 mesin perlu cek</b>
          <b>1 batch menunggu QC</b>
          <a href="#proof">Buka control tower →</a>
        </div>
      </section>
      <section className="factory-workflow" id="fitur">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Alur kerja"
            title="Satu batch bergerak dengan jejak yang bisa dibaca."
            description="Planner melihat urutan kerja dan hambatan yang harus dibereskan, bukan menunggu rekap akhir shift."
          />
          <ol>
            <li>
              <b>01</b>
              <span>Rencana produksi</span>
              <small>Target, BOM, dan jadwal</small>
            </li>
            <li>
              <b>02</b>
              <span>Work order</span>
              <small>Kebutuhan material terkunci</small>
            </li>
            <li>
              <b>03</b>
              <span>Eksekusi lini</span>
              <small>Output dan downtime dicatat</small>
            </li>
            <li>
              <b>04</b>
              <span>QC &amp; batch</span>
              <small>Hasil lulus atau hold</small>
            </li>
            <li>
              <b>05</b>
              <span>Barang jadi</span>
              <small>Stok dan biaya diperbarui</small>
            </li>
          </ol>
        </div>
      </section>
      <section className="factory-pain">
        <div className="vertical-wrap factory-pain-grid">
          <div>
            <span>Ketika masih pakai papan dan chat</span>
            <h2>
              Material bisa habis di tengah proses, sementara masalahnya baru
              terlihat setelah target meleset.
            </h2>
            <p>
              Operator menyampaikan di grup, planner belum melihat dampaknya ke
              work order berikutnya, dan owner baru tahu dari selisih hasil
              produksi.
            </p>
          </div>
          <div
            className="factory-board"
            aria-label="Contoh papan produksi manual yang tidak terhubung"
          >
            <i>WO 204</i>
            <i>Gula -200kg</i>
            <i>Mesin 03 ?</i>
            <i>QC menunggu</i>
            <strong>Informasi tersebar di tiga tempat</strong>
          </div>
        </div>
      </section>
      <section className="factory-proof" id="proof">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Control tower"
            title="Tindakan lebih dulu, laporan menyusul."
          />
          <div className="factory-control-grid">
            <article>
              <span>WORK ORDER</span>
              <h3>WO-204 · Minuman rasa leci</h3>
              <p>Target 9.600 botol · berjalan 64%</p>
              <div className="factory-meter">
                <i style={{ width: "64%" }} />
              </div>
              <em>Material shortage</em>
            </article>
            <article>
              <span>MESIN</span>
              <h3>Mixer M-03</h3>
              <p>Downtime 42 menit hari ini</p>
              <button type="button">Jadwalkan pemeriksaan</button>
            </article>
            <article>
              <span>QUALITY</span>
              <h3>Batch LY-260715-A</h3>
              <p>Menunggu verifikasi warna</p>
              <button type="button">Buka catatan QC</button>
            </article>
          </div>
        </div>
      </section>
      <section className="factory-compare">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Sebelum dan sesudah"
            title="Dari whiteboard yang tertinggal menjadi lini yang bisa dipantau."
          />
          <div className="factory-compare-row">
            <article>
              <span>Sebelum</span>
              <h3>Informasi berhenti di shift</h3>
              <p>
                Target, bahan kurang, dan QC tersimpan di papan atau chat
                sehingga planner harus mengejar konteks dari awal.
              </p>
            </article>
            <div aria-hidden="true">→</div>
            <article>
              <span>Dengan alur Altora</span>
              <h3>Setiap hambatan menjadi tindakan</h3>
              <p>
                Work order menghubungkan material, mesin, QC, dan batch agar
                orang yang tepat menerima konteksnya.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="factory-outcomes">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Hasil yang dicari"
            title="Produksi tidak harus terasa seperti tebakan."
          />
          <div>
            <p>
              <b>Planner</b> melihat bahan kurang sebelum mengatur produksi
              berikutnya.
            </p>
            <p>
              <b>Supervisor</b> membaca output, downtime, dan QC per lini.
            </p>
            <p>
              <b>Owner</b> mendapat konteks batch, bukan hanya angka akhir
              bulan.
            </p>
          </div>
        </div>
      </section>
      <section className="vertical-faq" id="faq">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Pertanyaan umum"
            title="Kesiapan implementasi Pabrik"
          />
          <FaqAccordion items={faqs} />
        </div>
      </section>
      <FinalCta
        title="Bangun alur pabrik dari kondisi nyata di lantai produksi."
        body="Mulai dari proses yang sekarang paling sering menghambat: material, work order, mesin, atau QC."
        action="Konsultasi produksi"
      />
    </LandingShell>
  );
}
