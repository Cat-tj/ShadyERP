import Image from "next/image";

const POINTS = [
  {
    title: "Live dashboard",
    detail: "Omzet, transaksi, dan stok update real-time, bisa dicek kapan saja tanpa buka laptop.",
  },
  {
    title: "Kasir cadangan",
    detail: "Perlu bantu kasir mendadak? HP kamu bisa langsung transaksi, datanya tetap satu sistem.",
  },
  {
    title: "Notifikasi penting",
    detail: "Stok menipis, shift ditutup, approval karyawan — semua masuk notifikasi ke HP.",
  },
];

export function MobileHighlight() {
  return (
    <section id="mobile" className="mobile-highlight">
      <div className="wrap mobile-highlight-grid">
        <div className="mobile-highlight-copy reveal">
          <span className="eyebrow">Kerja dari HP</span>
          <h2>Pantau usaha & terima transaksi langsung dari HP kamu.</h2>
          <p className="lede">
            Nggak perlu selalu di depan komputer. Cek omzet, approve stok, sampai bantu kasir bisa langsung dari
            HP — datanya otomatis sama dengan yang di laptop.
          </p>
          <ul className="mobile-highlight-points">
            {POINTS.map((point) => (
              <li key={point.title}>
                <b>{point.title}</b>
                <span>{point.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mobile-highlight-visual reveal">
          <div className="mobile-highlight-glow" aria-hidden="true" />
          <div className="mobile-highlight-photo-wrap">
            <Image
              src="/landing-previews/mobile-highlight-hand.png"
              alt="Pegang HP sambil pantau Ringkasan Finance Altora"
              width={1040}
              height={1670}
              sizes="(max-width: 900px) 70vw, 34vw"
              style={{ width: "100%", height: "auto" }}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
