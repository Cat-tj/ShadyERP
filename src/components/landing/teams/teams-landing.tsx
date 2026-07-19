import { FaqAccordion } from "@/components/landing/faq-accordion";
import {
  FinalCta,
  LandingShell,
  SectionHeading,
} from "@/components/landing/shared/landing-shell";
import { getLandingSeo } from "@/lib/landing/vertical-content";
import { VERTICAL_MAP } from "@/lib/verticals";

function LifecycleSvg() {
  return (
    <svg
      className="teams-life-svg"
      viewBox="0 0 760 300"
      role="img"
      aria-labelledby="teams-svg-title teams-svg-desc"
    >
      <title id="teams-svg-title">
        Lifecycle karyawan dari onboarding sampai performance
      </title>
      <desc id="teams-svg-desc">
        Alur penerimaan, jadwal, absensi, cuti, payroll, dan performance
        karyawan.
      </desc>
      <path
        d="M70 150C170 35 270 35 380 150s210 115 310 0"
        fill="none"
        stroke="#bfdbfe"
        strokeWidth="22"
        strokeLinecap="round"
      />
      <path
        d="M70 150C170 35 270 35 380 150s210 115 310 0"
        fill="none"
        stroke="#2563eb"
        strokeWidth="4"
        strokeDasharray="10 12"
      />
      <g>
        {[
          [70, 150, "Onboard"],
          [195, 72, "Jadwal"],
          [380, 150, "Hadir"],
          [565, 228, "Approval"],
          [690, 150, "Kinerja"],
        ].map(([x, y, label]) => (
          <g key={String(label)}>
            <circle
              cx={Number(x)}
              cy={Number(y)}
              r="34"
              fill="#fff"
              stroke="#93c5fd"
              strokeWidth="3"
            />
            <text x={Number(x)} y={Number(y) + 5} textAnchor="middle">
              {String(label)}
            </text>
          </g>
        ))}
      </g>
      <g className="teams-life-person">
        <circle cx="380" cy="85" r="19" fill="#dbeafe" />
        <path d="M345 123c8-34 62-34 70 0" fill="#dbeafe" />
      </g>
    </svg>
  );
}

export function TeamsLanding() {
  const vertical = VERTICAL_MAP.teams;
  const faqs = getLandingSeo(vertical).faqs;
  return (
    <LandingShell vertical={vertical}>
      <section className="teams-hero">
        <div className="vertical-wrap teams-hero-grid">
          <div>
            <span className="vertical-kicker">ALTORA TEAMS · BETA</span>
            <h1>
              Kondisi tim hari ini seharusnya terlihat sebelum rekap akhir
              bulan.
            </h1>
            <p>
              Absensi, perubahan shift, cuti, dan target punya konteks yang sama
              untuk karyawan, supervisor, dan owner. Mulai dari pencatatan yang
              memang dipakai tim hari ini.
            </p>
            <div className="vertical-cta-row">
              <a
                className="vertical-button vertical-button-primary"
                href="/register"
              >
                Atur tim pertama
              </a>
              <a className="vertical-text-link" href="#lifecycle">
                Lihat employee lifecycle
              </a>
            </div>
          </div>
          <div className="teams-hero-visual">
            <LifecycleSvg />
            <div className="teams-checkin">
              <b>Dewi K. · masuk 08:14</b>
              <span>Shift pagi · Cabang BSD</span>
              <em>Perlu cek: lokasi belum valid</em>
            </div>
          </div>
        </div>
      </section>
      <section className="teams-lifecycle" id="fitur">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Employee lifecycle"
            title="Satu perubahan shift tidak perlu berakhir di chat yang hilang."
          />
          <div className="teams-life-grid">
            <article>
              <b>Hire</b>
              <span>Data personel dan peran</span>
            </article>
            <article>
              <b>Schedule</b>
              <span>Shift per cabang</span>
            </article>
            <article>
              <b>Attend</b>
              <span>Bukti hadir dan pengecualian</span>
            </article>
            <article>
              <b>Approve</b>
              <span>Cuti, tukar shift, lembur</span>
            </article>
            <article>
              <b>Review</b>
              <span>Target dan kinerja</span>
            </article>
          </div>
        </div>
      </section>
      <section className="teams-pain">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Masalah yang terasa tiap hari"
            title="Owner tahu siapa telat, tetapi tidak tahu apa yang perlu dilakukan."
          />
          <div className="teams-pain-wall">
            <article>
              <strong>08:14</strong>
              <h3>Absensi manual tidak punya bukti yang cukup</h3>
              <p>
                Karyawan mengirim chat atau foto tanpa konteks, supervisor harus
                mengecek ulang ketika ada kejanggalan.
              </p>
            </article>
            <article>
              <strong>09:12</strong>
              <h3>Tukar shift masuk ke percakapan pribadi</h3>
              <p>
                Jadwal resmi tidak berubah, staf datang dengan asumsi yang
                berbeda, dan manager jadi penghubung manual.
              </p>
            </article>
            <article>
              <strong>17:00</strong>
              <h3>Target baru direkap setelah kesempatan lewat</h3>
              <p>
                Angka penjualan dan kehadiran tersebar sehingga coaching baru
                terjadi setelah periode selesai.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="teams-proof">
        <div className="vertical-wrap teams-proof-grid">
          <div>
            <SectionHeading
              eyebrow="Supervisor workspace"
              title="Supervisor tidak perlu membuka lima spreadsheet untuk satu shift."
            />
            <p>
              Gunakan tampilan ringkas untuk melihat siapa sudah hadir,
              exception yang perlu ditindak, dan pekerjaan yang memerlukan
              approval.
            </p>
            <a className="vertical-text-link" href="#outcome">
              Lihat dampaknya →
            </a>
          </div>
          <div className="teams-supervisor">
            <header>
              <b>Shift Pagi · Cabang BSD</b>
              <span>12 Jul · 5 staf</span>
            </header>
            <div>
              <span className="ok">Sinta A. · 07:52 · Tepat waktu</span>
              <span className="ok">Bagus R. · 07:58 · Tepat waktu</span>
              <span className="warn">Dewi K. · 08:14 · Perlu cek</span>
              <span className="muted">1 staf belum check-in</span>
            </div>
            <footer>
              <b>2 approval menunggu</b>
              <button type="button">Buka tindakan</button>
            </footer>
          </div>
        </div>
      </section>
      <section className="teams-before-after">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Sebelum dan sesudah"
            title="Dari file karyawan yang tersebar ke lifecycle yang bisa dilacak."
          />
          <div className="teams-compare-strip">
            <div>
              <span>Sebelum</span>
              <p>
                Form kertas, grup chat, dan spreadsheet menyimpan versi
                informasi yang berbeda.
              </p>
            </div>
            <i aria-hidden="true">→</i>
            <div>
              <span>Dengan alur Teams</span>
              <p>
                Perubahan jadwal dan exception berada di alur yang sama, dengan
                konteks untuk peran yang tepat.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="teams-roles">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Perangkat sesuai peran"
            title="Karyawan bertindak, supervisor mengawasi, owner membaca pola."
          />
          <div className="teams-role-grid">
            <article>
              <span>Mobile</span>
              <h3>Employee self-service</h3>
              <p>Check-in, jadwal, dan pengajuan singkat.</p>
            </article>
            <article>
              <span>Tablet</span>
              <h3>Supervisor attendance</h3>
              <p>Daftar hadir dan exception untuk satu lokasi.</p>
            </article>
            <article>
              <span>Laptop</span>
              <h3>HR command center</h3>
              <p>Pola kehadiran, approval, dan evaluasi tim.</p>
            </article>
          </div>
        </div>
      </section>
      <section className="vertical-faq" id="faq">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Pertanyaan umum"
            title="Kesiapan Altora Teams"
          />
          <FaqAccordion items={faqs} />
        </div>
      </section>
      <FinalCta
        title="Mulai dari shift yang paling sulit dikelola."
        body="Buat jadwal, bukti kehadiran, dan alur approval yang jelas dulu. Integrasi lain dapat menyusul ketika alur inti sudah dipakai tim."
        action="Konsultasi HR"
      />
    </LandingShell>
  );
}
