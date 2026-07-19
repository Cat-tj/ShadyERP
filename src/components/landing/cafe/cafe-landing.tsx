import { FaqAccordion } from "@/components/landing/faq-accordion";
import {
  FinalCta,
  LandingShell,
  SectionHeading,
} from "@/components/landing/shared/landing-shell";
import { getLandingSeo } from "@/lib/landing/vertical-content";
import { VERTICAL_MAP } from "@/lib/verticals";
function CafeFlowSvg() {
  return (
    <svg
      className="cafe-flow-svg"
      viewBox="0 0 760 330"
      role="img"
      aria-labelledby="cafe-title cafe-desc"
    >
      <title id="cafe-title">Alur order meja sampai kitchen</title>
      <desc id="cafe-desc">
        Pelanggan memesan dari QR meja, pesanan masuk ke kitchen, lalu siap
        disajikan dan dibayar.
      </desc>
      <g>
        <rect
          x="36"
          y="80"
          width="170"
          height="150"
          rx="26"
          fill="#fff"
          stroke="#e879f9"
          strokeWidth="4"
        />
        <circle cx="121" cy="155" r="42" fill="#fae8ff" />
        <path
          d="M93 155h56M121 127v56"
          stroke="#a21caf"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <text x="121" y="260" textAnchor="middle">
          Meja 04 + QR
        </text>
      </g>
      <path
        d="M210 155h90"
        stroke="#c026d3"
        strokeWidth="5"
        strokeDasharray="8 9"
      />
      <g>
        <rect x="303" y="52" width="180" height="206" rx="26" fill="#701a75" />
        <text x="393" y="88" textAnchor="middle" fill="#fff">
          KITCHEN STATION
        </text>
        <rect x="330" y="113" width="126" height="42" rx="10" fill="#fdf4ff" />
        <rect x="330" y="169" width="98" height="42" rx="10" fill="#fdf4ff" />
      </g>
      <path
        d="M486 155h88"
        stroke="#c026d3"
        strokeWidth="5"
        strokeDasharray="8 9"
      />
      <g>
        <rect
          x="576"
          y="92"
          width="145"
          height="126"
          rx="22"
          fill="#fff"
          stroke="#e879f9"
          strokeWidth="3"
        />
        <path
          d="m615 150 23 23 43-52"
          fill="none"
          stroke="#16a34a"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x="648" y="246" textAnchor="middle">
          Siap &amp; bayar
        </text>
      </g>
    </svg>
  );
}
export function CafeLanding() {
  const vertical = VERTICAL_MAP.cafe;
  const faqs = getLandingSeo(vertical).faqs;
  return (
    <LandingShell vertical={vertical}>
      <section className="cafe-hero">
        <div className="vertical-wrap cafe-hero-grid">
          <div>
            <span className="vertical-kicker">ALTORA CAFE · TERSEDIA</span>
            <h1>Meja penuh tidak harus membuat dapur kehilangan ritme.</h1>
            <p>
              Pesanan dari meja, kasir, dan kitchen bergerak dalam alur yang
              sama. Tim tahu apa yang baru masuk, sedang dibuat, dan siap
              disajikan tanpa memanggil ulang dari depan.
            </p>
            <div className="vertical-cta-row">
              <a
                className="vertical-button vertical-button-primary"
                href="/register"
              >
                Atur alur cafe
              </a>
              <a className="vertical-text-link" href="#cafe-workflow">
                Lihat perjalanan order
              </a>
            </div>
          </div>
          <div className="cafe-hero-visual">
            <CafeFlowSvg />
            <aside>
              <b>Meja 04 · 3 item</b>
              <span>Masuk ke Kitchen Station Minuman</span>
              <em>Baru masuk · 1 menit</em>
            </aside>
          </div>
        </div>
      </section>
      <section className="cafe-workflow" id="fitur">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Perjalanan satu order"
            title="Dari pelanggan memilih sampai meja selesai."
          />
          <ol>
            <li>
              <b>Pesan</b>
              <span>QR meja atau kasir</span>
            </li>
            <li>
              <b>Masuk kitchen</b>
              <span>Station yang tepat</span>
            </li>
            <li>
              <b>Siap</b>
              <span>Tim tahu urutan saji</span>
            </li>
            <li>
              <b>Bayar</b>
              <span>Tagihan dan metode tercatat</span>
            </li>
            <li>
              <b>Stok</b>
              <span>Riwayat bahan ikut bergerak</span>
            </li>
          </ol>
        </div>
      </section>
      <section className="cafe-pain">
        <div className="vertical-wrap cafe-pain-grid">
          <div>
            <SectionHeading
              eyebrow="Jam ramai"
              title="Ketika order hanya hidup di suara dan chat, meja menunggu tanpa kepastian."
            />
            <p>
              Kasir mencatat, barista bertanya ulang, runner mencari nama meja,
              dan owner baru tahu antrean setelah pelanggan komplain.
            </p>
          </div>
          <div className="cafe-chaos">
            <i>Meja 04?</i>
            <i>2 es kopi!</i>
            <i>Sudah bayar?</i>
            <i>Tambah roti</i>
            <b>4 catatan, 1 order belum jelas</b>
          </div>
        </div>
      </section>
      <section className="cafe-proof">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Product proof"
            title="Kitchen melihat tindakan berikutnya, bukan daftar panjang yang sama rata."
          />
          <div className="cafe-kds">
            <header>
              <b>Kitchen Station · Minuman</b>
              <span>7 order aktif</span>
            </header>
            <article>
              <b>Meja 04</b>
              <p>2× Kopi Susu · 1× Croissant</p>
              <em>Baru masuk · 1 menit</em>
            </article>
            <article>
              <b>Meja 08</b>
              <p>1× Americano</p>
              <em>Sedang dibuat · 4 menit</em>
            </article>
            <article>
              <b>Takeaway</b>
              <p>2× Es Teh Manis</p>
              <em>Siap disajikan</em>
            </article>
          </div>
        </div>
      </section>
      <section className="cafe-before">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Sebelum dan sesudah"
            title="Dari meja yang memanggil ke order yang bergerak jelas."
          />
          <div>
            <article>
              <span>Sebelum</span>
              <p>
                Order pindah dari mulut ke kertas, lalu ke kitchen. Setiap
                tambahan pesanan membuat konteks semakin kabur.
              </p>
            </article>
            <article>
              <span>Dengan alur cafe</span>
              <p>
                Meja, station, status, dan pembayaran mempunyai jejak yang bisa
                dipakai tim saat itu juga.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="cafe-devices">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Peran dan perangkat"
            title="Satu alur, tiga cara bekerja."
          />
          <div>
            <p>
              <b>HP pelanggan</b> · pesan mandiri dari QR meja.
            </p>
            <p>
              <b>Tablet kitchen</b> · antrian produksi dan status.
            </p>
            <p>
              <b>Laptop owner</b> · meja aktif, stok bahan, dan ritme layanan.
            </p>
          </div>
        </div>
      </section>
      <section className="vertical-faq" id="faq">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Pertanyaan umum"
            title="Kesiapan Altora Cafe"
          />
          <FaqAccordion items={faqs} />
        </div>
      </section>
      <FinalCta
        title="Mulai dari meja dan station yang paling sering kewalahan."
        body="Buat alur order yang dipakai tim hari ini, kemudian sambungkan stok dan laporan sesuai kebutuhan cafe."
        action="Konsultasi cafe"
      />
    </LandingShell>
  );
}
