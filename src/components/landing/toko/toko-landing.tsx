import { FaqAccordion } from "@/components/landing/faq-accordion";
import {
  FinalCta,
  LandingShell,
  SectionHeading,
} from "@/components/landing/shared/landing-shell";
import { getLandingSeo } from "@/lib/landing/vertical-content";
import { VERTICAL_MAP } from "@/lib/verticals";
function StoreScanSvg() {
  return (
    <svg
      className="store-scan-svg"
      viewBox="0 0 760 330"
      role="img"
      aria-labelledby="store-title store-desc"
    >
      <title id="store-title">Scan barcode ke stok dan reorder</title>
      <desc id="store-desc">
        Produk dari rak dipindai di kasir, stok berkurang, margin tercatat, dan
        restock muncul bila minimum terlewati.
      </desc>
      <rect
        x="48"
        y="52"
        width="164"
        height="210"
        rx="22"
        fill="#fff"
        stroke="#5eead4"
        strokeWidth="3"
      />
      {[88, 132, 176].map((y) => (
        <path
          key={y}
          d={`M75 ${y}h110`}
          stroke="#99f6e4"
          strokeWidth="13"
          strokeLinecap="round"
        />
      ))}
      <text x="130" y="294" textAnchor="middle">
        Rak &amp; produk
      </text>
      <path
        d="M214 157h95"
        stroke="#0f766e"
        strokeWidth="5"
        strokeDasharray="7 8"
      />
      <g>
        <rect x="311" y="84" width="160" height="145" rx="22" fill="#0f766e" />
        <path
          d="M345 126v58m12-58v58m14-58v58m16-58v58m14-58v58m16-58v58"
          stroke="#fff"
          strokeWidth="5"
        />
        <text x="391" y="257" textAnchor="middle">
          Scan &amp; transaksi
        </text>
      </g>
      <path
        d="M473 157h88"
        stroke="#0f766e"
        strokeWidth="5"
        strokeDasharray="7 8"
      />
      <g>
        <rect
          x="563"
          y="65"
          width="150"
          height="184"
          rx="22"
          fill="#fff"
          stroke="#5eead4"
          strokeWidth="3"
        />
        <text x="638" y="105" textAnchor="middle">
          STOK
        </text>
        <text x="638" y="145" textAnchor="middle">
          MINYAK 1L · 5
        </text>
        <text x="638" y="180" textAnchor="middle" fill="#b45309">
          Restock
        </text>
      </g>
    </svg>
  );
}
export function TokoLanding() {
  const vertical = VERTICAL_MAP.toko;
  const faqs = getLandingSeo(vertical).faqs;
  return (
    <LandingShell vertical={vertical}>
      <section className="toko-hero">
        <div className="vertical-wrap toko-hero-grid">
          <div>
            <span className="vertical-kicker">ALTORA TOKO · TERSEDIA</span>
            <h1>
              Barang di rak, angka di kasir, dan keputusan restock harus bicara
              hal yang sama.
            </h1>
            <p>
              Scan barcode atau cari SKU saat transaksi. Pergerakan stok, metode
              bayar, dan riwayat produk tercatat agar owner tidak perlu menebak
              apa yang terjadi setelah toko tutup.
            </p>
            <div className="vertical-cta-row">
              <a
                className="vertical-button vertical-button-primary"
                href="/register"
              >
                Atur kasir toko
              </a>
              <a className="vertical-text-link" href="#toko-flow">
                Lihat alur stok
              </a>
            </div>
          </div>
          <div className="toko-hero-visual">
            <StoreScanSvg />
            <aside>
              <b>Gula Pasir 1kg</b>
              <span>Stok 5 · minimum 10</span>
              <em>Masuk daftar restock</em>
            </aside>
          </div>
        </div>
      </section>
      <section className="toko-flow" id="fitur">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Satu transaksi"
            title="Scan sekali, dampaknya terlihat di tempat yang tepat."
          />
          <div>
            <article>
              <b>1</b>
              <h3>Produk dipindai</h3>
              <p>Barcode, SKU, atau pencarian produk.</p>
            </article>
            <article>
              <b>2</b>
              <h3>Bayar tercatat</h3>
              <p>Kas fisik dan digital tidak dicampur.</p>
            </article>
            <article>
              <b>3</b>
              <h3>Stok bergerak</h3>
              <p>Riwayat item dan cabang diperbarui.</p>
            </article>
            <article>
              <b>4</b>
              <h3>Restock muncul</h3>
              <p>Minimum stok menjadi tindakan.</p>
            </article>
          </div>
        </div>
      </section>
      <section className="toko-pain">
        <div className="vertical-wrap toko-pain-grid">
          <div className="toko-shelf">
            <span>Rak fisik: 2</span>
            <span>Sistem: 7</span>
            <i>Selisih baru ketahuan saat stok habis.</i>
          </div>
          <div>
            <SectionHeading
              eyebrow="Masalah kasir dan rak"
              title="Kesalahan kecil saat scan bisa berubah menjadi stok yang tidak dipercaya."
            />
            <p>
              Produk tanpa barcode diketik ulang, varian tertukar, dan kasir
              harus mengingat mana barang yang sudah masuk keranjang saat
              pelanggan menambah belanjaan.
            </p>
          </div>
        </div>
      </section>
      <section className="toko-proof">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Product proof"
            title="Daftar tindakan membawa owner ke barang yang butuh perhatian."
          />
          <div className="toko-action-board">
            <article>
              <b>STOK MENIPIS</b>
              <h3>Gula Pasir 1kg</h3>
              <p>Sisa 5 · minimum 10 · 12 terjual minggu ini</p>
              <button type="button">Buat restock</button>
            </article>
            <article>
              <b>BARANG MASUK</b>
              <h3>PO #481 · CV Makmur</h3>
              <p>80 item · diterima kemarin</p>
              <button type="button">Buka penerimaan</button>
            </article>
            <article>
              <b>SELISIH KAS</b>
              <h3>Shift Sore · Rp25.000</h3>
              <p>Perlu review sebelum tutup hari</p>
              <button type="button">Tinjau shift</button>
            </article>
          </div>
        </div>
      </section>
      <section className="toko-before">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Sebelum dan sesudah"
            title="Dari rak yang harus diingat ke stok yang punya riwayat."
          />
          <div>
            <article>
              <span>Sebelum</span>
              <p>
                Kasir menjual, owner menghitung, dan barang kosong baru
                diketahui ketika pelanggan bertanya.
              </p>
            </article>
            <article>
              <span>Dengan alur toko</span>
              <p>
                Penjualan, penerimaan, transfer, dan opname membentuk jejak
                pergerakan stok.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="toko-roles">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Perangkat sesuai tugas"
            title="Kasir menjual cepat, owner tetap punya konteks."
          />
          <div>
            <p>
              <b>HP kasir</b> · scan dan transaksi cepat.
            </p>
            <p>
              <b>Tablet stok</b> · penerimaan, transfer, dan opname.
            </p>
            <p>
              <b>Laptop owner</b> · restock, margin, dan laporan cabang.
            </p>
          </div>
        </div>
      </section>
      <section className="vertical-faq" id="faq">
        <div className="vertical-wrap">
          <SectionHeading
            eyebrow="Pertanyaan umum"
            title="Kesiapan Altora Toko"
          />
          <FaqAccordion items={faqs} />
        </div>
      </section>
      <FinalCta
        title="Mulai dari satu rak yang paling sering membuat stok tidak pasti."
        body="Atur produk, barcode, minimum stok, dan alur penerimaan sesuai keadaan toko hari ini."
        action="Konsultasi toko"
      />
    </LandingShell>
  );
}
