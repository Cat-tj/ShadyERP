import { FaqAccordion } from "@/components/landing/faq-accordion";
import {
  FinalCta,
  LandingShell,
  SectionHeading,
} from "@/components/landing/shared/landing-shell";
import { getLandingSeo } from "@/lib/landing/vertical-content";
import { VERTICAL_MAP } from "@/lib/verticals";

function CapacityCalendarSvg() {
  return (
    <svg
      className="jasa-calendar-svg"
      viewBox="0 0 760 520"
      role="img"
      aria-labelledby="jasa-calendar-title jasa-calendar-desc"
    >
      <title id="jasa-calendar-title">
        Jadwal layanan berdasarkan waktu dan staf
      </title>
      <desc id="jasa-calendar-desc">
        Kalender operasional memperlihatkan booking untuk tiga staf, waktu
        kosong, dan konflik jadwal.
      </desc>
      <rect
        x="26"
        y="30"
        width="708"
        height="460"
        rx="26"
        fill="#fff"
        stroke="#fde68a"
        strokeWidth="2"
      />
      <rect x="26" y="30" width="708" height="72" rx="26" fill="#b45309" />
      <text x="58" y="74" fill="#fff">
        Jadwal · Sabtu, 18 Juli
      </text>
      {[
        ["09:00", 132],
        ["10:00", 218],
        ["11:00", 304],
        ["12:00", 390],
      ].map(([time, y]) => (
        <g key={time}>
          <text x="58" y={Number(y) + 24}>
            {time}
          </text>
          <path d={`M120 ${y}h570`} stroke="#fef3c7" />
        </g>
      ))}
      {[
        ["Raka", 145],
        ["Nina", 330],
        ["Dimas", 515],
      ].map(([name, x]) => (
        <text key={name} x={Number(x)} y="126">
          {name}
        </text>
      ))}
      <g>
        <rect x="130" y="148" width="170" height="62" rx="10" fill="#fef3c7" />
        <text x="146" y="174">
          Budi · Haircut
        </text>
        <text x="146" y="195">
          09:00–09:45
        </text>
      </g>
      <g>
        <rect
          x="315"
          y="232"
          width="170"
          height="62"
          rx="10"
          fill="#ffedd5"
          stroke="#f59e0b"
        />
        <text x="331" y="258">
          Maya · Coloring
        </text>
        <text x="331" y="279">
          10:00–11:30
        </text>
      </g>
      <g>
        <rect x="500" y="318" width="170" height="62" rx="10" fill="#fee2e2" />
        <text x="516" y="344">
          Konflik waktu
        </text>
        <text x="516" y="365">
          2 booking · Dimas
        </text>
      </g>
      <rect
        x="130"
        y="408"
        width="355"
        height="48"
        rx="10"
        fill="#f8fafc"
        stroke="#fde68a"
      />
      <text x="148" y="438">
        Slot tersedia · Nina · 12:00
      </text>
    </svg>
  );
}

export function JasaLanding() {
  const vertical = VERTICAL_MAP.jasa;
  const faqs = getLandingSeo(vertical).faqs;

  return (
    <LandingShell vertical={vertical}>
      <section className="jasa-hero">
        <div className="vertical-wrap jasa-hero-grid">
          <div>
            <span className="vertical-kicker">ALTORA JASA · TERSEDIA</span>
            <h1>
              Jadwal harus menunjukkan kapasitas, bukan sekadar nama pelanggan.
            </h1>
            <p>
              Booking dikaitkan ke layanan, durasi, staf, ruang, DP, dan status
              kedatangan. Tim tahu siapa mengerjakan apa tanpa menyusun ulang
              chat setiap pagi.
            </p>
            <div className="vertical-cta-row">
              <a
                className="vertical-button vertical-button-primary"
                href="/register"
              >
                Atur jadwal layanan
              </a>
              <a className="vertical-text-link" href="#fitur">
                Lihat alur booking
              </a>
            </div>
          </div>
          <div className="jasa-hero-visual">
            <CapacityCalendarSvg />
            <aside>
              <b>Slot bentrok</b>
              <span>Dimas · 11:00</span>
              <em>Pilih staf atau waktu lain</em>
            </aside>
          </div>
        </div>
      </section>

      <section className="jasa-flow" id="fitur">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Perjalanan booking"
            title="Janji pelanggan berubah menjadi pekerjaan yang terjadwal."
          />
          <ol>
            <li>
              <b>Pilih layanan</b>
              <span>Durasi dan harga dasar</span>
            </li>
            <li>
              <b>Cari kapasitas</b>
              <span>Staf, ruang, dan waktu</span>
            </li>
            <li>
              <b>Konfirmasi</b>
              <span>DP dan pengingat</span>
            </li>
            <li>
              <b>Kerjakan</b>
              <span>Status dan catatan layanan</span>
            </li>
            <li>
              <b>Selesaikan</b>
              <span>Pelunasan dan kunjungan berikutnya</span>
            </li>
          </ol>
        </div>
      </section>

      <section className="jasa-pain">
        <div className="vertical-wrap jasa-pain-grid">
          <div>
            <SectionHeading
              eyebrow="Ketika jadwal hidup di chat"
              title="Slot terlihat kosong, tetapi staf atau ruangnya ternyata sudah dipakai."
            />
            <p>
              Nama pelanggan tanpa durasi, staf, dan kebutuhan sumber daya
              membuat bentrok baru terlihat ketika pelanggan datang.
            </p>
          </div>
          <div className="jasa-chat">
            <i>“Besok jam 10 bisa?”</i>
            <i>“Sama Raka ya”</i>
            <i>“Mundur 30 menit”</i>
            <i>“Sudah DP”</i>
            <b>Satu booking tersebar di empat pesan.</b>
          </div>
        </div>
      </section>

      <section className="jasa-proof">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Product proof"
            title="Papan hari ini memperlihatkan waktu, tanggung jawab, dan uang yang belum beres."
          />
          <div className="jasa-day-board">
            <header>
              <b>Hari ini · 24 booking</b>
              <span>6 staf tersedia</span>
            </header>
            <article>
              <time>09:00</time>
              <div>
                <b>Rani Handayani</b>
                <span>Haircut · Raka · 45 menit</span>
              </div>
              <em>DP lunas</em>
            </article>
            <article>
              <time>10:00</time>
              <div>
                <b>PT Sukses Jaya</b>
                <span>Maintenance · Oka · 90 menit</span>
              </div>
              <em>Berjalan</em>
            </article>
            <article>
              <time>11:30</time>
              <div>
                <b>Dewi Lestari</b>
                <span>Follow up · Nina · 30 menit</span>
              </div>
              <em>Belum konfirmasi</em>
            </article>
          </div>
        </div>
      </section>

      <section className="jasa-before">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Sebelum dan sesudah"
            title="Dari janji di chat ke kapasitas yang bisa direncanakan."
          />
          <div>
            <article>
              <span>Sebelum</span>
              <p>
                Manager menggabungkan chat, kalender pribadi, dan ingatan staf.
              </p>
            </article>
            <article>
              <span>Dengan alur jasa</span>
              <p>
                Booking memesan waktu dan sumber daya, lalu mengikuti status
                sampai lunas.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="jasa-roles">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Peran dan perangkat"
            title="Pelanggan mudah pesan, tim mudah menjaga jadwal."
          />
          <div>
            <p>
              <b>HP pelanggan</b> · pilih slot dan lihat konfirmasi.
            </p>
            <p>
              <b>Tablet front desk</b> · check-in, ubah staf, dan pembayaran.
            </p>
            <p>
              <b>Laptop manager</b> · kapasitas, utilisasi, dan follow up.
            </p>
          </div>
        </div>
      </section>
      <section className="vertical-faq" id="faq">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Pertanyaan umum"
            title="Kesiapan Altora Jasa"
          />
          <FaqAccordion items={faqs} />
        </div>
      </section>
      <FinalCta
        title="Mulai dari jadwal yang paling sering bentrok."
        body="Atur layanan, durasi, staf, sumber daya, dan aturan pembayaran sesuai operasionalmu."
        action="Konsultasi usaha jasa"
      />
    </LandingShell>
  );
}
