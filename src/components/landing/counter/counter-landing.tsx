import { FaqAccordion } from "@/components/landing/faq-accordion";
import {
  FinalCta,
  LandingShell,
  SectionHeading,
} from "@/components/landing/shared/landing-shell";
import { getLandingSeo } from "@/lib/landing/vertical-content";
import { VERTICAL_MAP } from "@/lib/verticals";

function RepairFlowSvg() {
  return (
    <svg
      className="repair-flow-svg"
      viewBox="0 0 760 330"
      role="img"
      aria-labelledby="repair-title repair-desc"
    >
      <title id="repair-title">Lifecycle servis perangkat</title>
      <desc id="repair-desc">
        Perangkat masuk, didiagnosis, menunggu approval, dikerjakan, diuji, lalu
        siap diambil.
      </desc>
      <path
        d="M82 166H684"
        stroke="#ffe4e6"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {[
        [88, "Masuk"],
        [200, "Diagnosa"],
        [322, "Approval"],
        [444, "Perbaikan"],
        [566, "QC"],
        [684, "Ambil"],
      ].map(([x, label], i) => (
        <g key={String(label)}>
          <circle
            cx={Number(x)}
            cy="166"
            r="35"
            fill={i === 2 ? "#e11d48" : "#fff"}
            stroke="#fb7185"
            strokeWidth="3"
          />
          <text
            x={Number(x)}
            y="171"
            textAnchor="middle"
            fill={i === 2 ? "#fff" : "#be123c"}
          >
            {String(label)}
          </text>
          {i < 5 ? (
            <path
              d={`M${Number(x) + 36} 166h48`}
              stroke="#fb7185"
              strokeWidth="4"
              strokeDasharray="6 7"
            />
          ) : null}
        </g>
      ))}
      <g className="repair-phone">
        <rect
          x="274"
          y="35"
          width="100"
          height="80"
          rx="16"
          fill="#fff1f2"
          stroke="#fb7185"
          strokeWidth="3"
        />
        <rect x="304" y="48" width="40" height="56" rx="7" fill="#fff" />
        <circle cx="324" cy="94" r="4" fill="#e11d48" />
      </g>
    </svg>
  );
}
export function CounterLanding() {
  const vertical = VERTICAL_MAP.counter;
  const faqs = getLandingSeo(vertical).faqs;
  return (
    <LandingShell vertical={vertical}>
      <section className="counter-hero">
        <div className="vertical-wrap counter-hero-grid">
          <div>
            <span className="vertical-kicker">ALTORA COUNTER · PILOT</span>
            <h1>
              Jualan aksesoris tetap jalan, servis perangkat tidak boleh hilang
              jejaknya.
            </h1>
            <p>
              Catat perangkat, keluhan, diagnosis, spare part, persetujuan
              estimasi, dan status pengambilan dalam satu lifecycle yang mudah
              dijelaskan ke pelanggan.
            </p>
            <div className="vertical-cta-row">
              <a
                className="vertical-button vertical-button-primary"
                href="/register"
              >
                Rancang alur servis
              </a>
              <a className="vertical-text-link" href="#repair-flow">
                Lihat lifecycle perangkat
              </a>
            </div>
          </div>
          <div className="counter-hero-visual">
            <RepairFlowSvg />
            <aside>
              <b>Servis #45 · iPhone 11</b>
              <span>Estimasi Rp350.000 belum disetujui</span>
              <em>Menunggu pelanggan</em>
            </aside>
          </div>
        </div>
      </section>
      <section className="counter-flow" id="fitur">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Device lifecycle"
            title="Pelanggan dan teknisi melihat status yang sama, tanpa mencari nota kertas."
          />
          <div>
            <article>
              <b>Terima</b>
              <span>IMEI, kondisi, keluhan</span>
            </article>
            <article>
              <b>Diagnosa</b>
              <span>Temuan dan estimasi</span>
            </article>
            <article>
              <b>Setujui</b>
              <span>Konfirmasi pelanggan</span>
            </article>
            <article>
              <b>Kerjakan</b>
              <span>Teknisi dan spare part</span>
            </article>
            <article>
              <b>Serah terima</b>
              <span>QC, pembayaran, garansi</span>
            </article>
          </div>
        </div>
      </section>
      <section className="counter-pain">
        <div className="vertical-wrap counter-pain-grid">
          <div className="counter-ticket-stack">
            <i>
              Nota #45
              <br />
              iPhone 11
              <br />
              Ganti baterai?
            </i>
            <i>
              Chat pelanggan
              <br />
              &quot;Jadi berapa ya?&quot;
            </i>
            <i>
              Part masuk
              <br />
              tidak ada tiket
            </i>
            <b>Perangkat, keputusan, dan spare part mudah lepas konteks.</b>
          </div>
          <div>
            <SectionHeading
              eyebrow="Masalah yang mahal"
              title="Satu tiket hilang artinya pelanggan menunggu jawaban, teknisi menunggu keputusan, dan toko menanggung risiko."
            />
            <p>
              Ketika status servis hanya ada di nota dan chat, tim sulit
              menjelaskan apa yang sudah dilakukan dan apa yang masih menunggu.
            </p>
          </div>
        </div>
      </section>
      <section className="counter-proof">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Product proof"
            title="Tiket servis menyimpan keputusan, bukan hanya nama perangkat."
          />
          <div className="counter-ticket">
            <header>
              <b>#45 · iPhone 11</b>
              <span>Masuk 10:42</span>
            </header>
            <div>
              <section>
                <small>KELUHAN</small>
                <p>Baterai cepat habis, perangkat panas.</p>
              </section>
              <section>
                <small>DIAGNOSA</small>
                <p>Battery health 72%. Ganti baterai disarankan.</p>
              </section>
              <section>
                <small>PERSETUJUAN</small>
                <p>Estimasi Rp350.000 · menunggu pelanggan.</p>
              </section>
            </div>
            <footer>
              <span>Spare part: Battery iPhone 11 · 1 tersedia</span>
              <button type="button">Kirim estimasi</button>
            </footer>
          </div>
        </div>
      </section>
      <section className="counter-before">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Sebelum dan sesudah"
            title="Dari nota yang hilang menjadi perangkat dengan riwayat yang bisa dijelaskan."
          />
          <div>
            <article>
              <span>Sebelum</span>
              <h3>Teknisi mengingat status sendiri</h3>
              <p>
                Catatan kondisi, estimasi, dan part tersebar di kertas atau
                chat.
              </p>
            </article>
            <article>
              <span>Dengan lifecycle</span>
              <h3>Setiap status punya bukti dan pemilik</h3>
              <p>
                Tim mengetahui siapa menunggu siapa, apa yang disetujui, dan
                kapan perangkat siap diambil.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="counter-roles">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Peran dan perangkat"
            title="Kasir menjual, teknisi memperbaiki, owner membaca prioritas."
          />
          <div>
            <p>
              <b>Mobile teknisi</b> · update diagnosis dan tindakan.
            </p>
            <p>
              <b>Tablet counter</b> · penerimaan perangkat dan komunikasi
              status.
            </p>
            <p>
              <b>Laptop owner</b> · tiket, part, garansi, dan exception.
            </p>
          </div>
        </div>
      </section>
      <section className="vertical-faq" id="faq">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Pertanyaan umum"
            title="Kesiapan Altora Counter"
          />
          <FaqAccordion items={faqs} />
        </div>
      </section>
      <FinalCta
        title="Mulai dari tiket servis yang paling sering membuat pelanggan menunggu."
        body="Rancang penerimaan, diagnosis, persetujuan estimasi, dan serah terima dengan bahasa yang bisa dipakai semua orang."
        action="Konsultasi counter"
      />
    </LandingShell>
  );
}
