export function LandingContent() {
  return (
    <div className="altora-landing">
<header className="site">
  <div className="wrap nav">
    <a className="brand" href="#top">
      <span className="brand-mark">
        <svg viewBox="0 0 400 460" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <linearGradient id="altoraLogoGradient" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="var(--logo-c1)" />
              <stop offset="22%" stopColor="var(--logo-c2)" />
              <stop offset="42%" stopColor="var(--logo-c3)" />
              <stop offset="60%" stopColor="var(--logo-c4)" />
              <stop offset="78%" stopColor="var(--logo-c5)" />
              <stop offset="100%" stopColor="var(--logo-c6)" />
            </linearGradient>
            <linearGradient id="altoraLogoShade" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M 210 40 C 150 40 100 75 70 130 L 130 175 C 150 140 175 118 210 118 C 245 118 268 138 268 168 L 268 195 L 175 195 C 105 195 55 235 55 300 C 55 365 110 405 175 405 C 215 405 245 388 268 360 L 268 395 L 335 395 L 335 168 C 335 90 290 40 210 40 Z M 268 250 L 268 300 C 268 335 235 350 195 350 C 160 350 130 335 130 305 C 130 270 165 250 205 250 Z" fill="url(#altoraLogoGradient)" fillRule="evenodd" />
          <path d="M 268 195 L 175 195 C 105 195 55 235 55 300 C 55 320 60 337 70 352 C 75 300 120 262 180 262 L 268 262 Z" fill="url(#altoraLogoShade)" />
          <path d="M 335 300 C 335 350 315 390 275 408 C 305 400 335 375 335 335 Z" fill="url(#altoraLogoGradient)" />
        </svg>
      </span>
      <span className="brand-word">ALTORA</span>
    </a>
    <nav className="nav-links">
      <a className="navlink" href="#fitur">Fitur</a>
      <a className="navlink" href="#cara-kerja">Cara kerja</a>
      <a className="navlink" href="#harga">Harga</a>
      <a className="navlink" href="#kontak">Kontak</a>
    </nav>
    <div className="nav-cta">
      <a className="btn btn-primary" href="https://wa.me/6285190911170?text=Halo%20Altora%2C%20saya%20mau%20tanya%20soal%20aplikasi%20kasirnya" target="_blank" rel="noopener">
        Chat WhatsApp
      </a>
    </div>
  </div>
</header>

<main id="top">

  {/* HERO */}
  <section className="hero">
    <div className="hero-glow" aria-hidden="true"></div>
    <div className="wrap hero-grid">
      <div className="hero-copy">
        <span className="eyebrow">POS &amp; Manajemen Toko untuk UMKM Indonesia</span>
        <h1 aria-label="Tutup toko, tanpa tutup buku.">
          Tutup toko,<br />
          <span className="roll-window" aria-hidden="true">
            <span className="roll-track">
              <span className="roll-item">tanpa tutup buku.</span>
              <span className="roll-item">kasir sampai laporan.</span>
              <span className="roll-item">walau internet mati.</span>
              <span className="roll-item">mulai hari ini juga.</span>
              <span className="roll-item">tanpa tutup buku.</span>
            </span>
          </span>
        </h1>
        <p className="lede">
          Altora rapikan kasir, stok, karyawan, dan laporan tokomu jadi satu layar —
          buat coffee shop, barbershop, atau toko retail. Tetap jalan walau internet
          sempat mati, tetap tercatat sampai struk terakhir.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="https://wa.me/6285190911170?text=Halo%20Altora%2C%20saya%20mau%20tanya%20soal%20aplikasi%20kasirnya" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 5L2 22l5.2-1.36a9.94 9.94 0 0 0 4.84 1.23h.01c5.5 0 9.96-4.46 9.96-9.96S17.55 2 12.04 2Zm5.87 14.24c-.25.7-1.45 1.34-2 1.43-.51.08-1.15.11-1.86-.12-.43-.13-.98-.32-1.69-.62-2.97-1.28-4.9-4.26-5.05-4.46-.15-.2-1.21-1.6-1.21-3.06 0-1.45.76-2.16 1.03-2.46.27-.3.6-.37.8-.37.2 0 .4 0 .58.01.18.01.44-.07.68.53.25.6.85 2.08.92 2.23.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.18-.31.4-.44.53-.15.15-.3.31-.13.6.17.3.76 1.28 1.64 2.08 1.13 1.03 2.08 1.35 2.38 1.5.3.15.47.13.65-.07.18-.2.75-.87.95-1.17.2-.3.4-.25.68-.15.28.1 1.76.85 2.06 1 .3.15.5.23.57.35.07.13.07.73-.18 1.43Z"/></svg>
            Chat via WhatsApp
          </a>
          <a className="btn btn-ghost" href="mailto:admin@altora.my.id?subject=Tanya%20Altora">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 6h18v12H3z"/><path d="m3 7 9 6 9-6"/></svg>
            Kirim Email
          </a>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-visual-inner">
          <span className="badge-float"><span className="badge-dot" aria-hidden="true"></span>Langsung</span>

          <div className="receipt-back" role="img" aria-label="Contoh struk digital Altora untuk transaksi dua item dengan promo happy hour">
            <div className="r-brand">ALTORA POS</div>
            <div className="r-sub">Kopi Nusantara — BSD</div>
            <hr className="r-rule" />
            <div className="r-row"><span>2x Kopi Susu</span><span>36.000</span></div>
            <div className="r-row"><span>1x Croissant</span><span>28.000</span></div>
            <hr className="r-rule" />
            <div className="r-row r-promo"><span>Promo -10%</span><span>-6.400</span></div>
            <div className="r-row r-total-row"><span>TOTAL</span><span>57.600</span></div>
          </div>

          <div className="dash-card" role="img" aria-label="Contoh dashboard Kasir Altora menampilkan omzet hari ini, jumlah transaksi, stok menipis, dan pesanan meja aktif">
            <div className="dash-chrome">
              <span className="dash-dot"></span><span className="dash-dot"></span><span className="dash-dot"></span>
              <span className="dash-url mono">kasir.altora.id / dashboard</span>
            </div>
            <div className="dash-body">
              <div className="dash-title-row">
                <span className="dash-title">Kasir · Hari ini</span>
                <span className="dash-live"><span className="badge-dot" aria-hidden="true"></span>Tersinkron</span>
              </div>
              <div className="dash-grid">
                <div className="dash-tile">
                  <span className="dash-tile-label">Omzet hari ini</span>
                  <span className="dash-tile-value mono">Rp3,4jt</span>
                  <span className="dash-tile-delta">+8% vs kemarin</span>
                </div>
                <div className="dash-tile">
                  <span className="dash-tile-label">Transaksi</span>
                  <span className="dash-tile-value mono">142</span>
                  <span className="dash-tile-delta">+12 dari kemarin</span>
                </div>
                <div className="dash-tile">
                  <span className="dash-tile-label">Stok menipis</span>
                  <span className="dash-tile-value mono">3 produk</span>
                  <span className="dash-tile-delta warn">Perlu restock</span>
                </div>
                <div className="dash-tile">
                  <span className="dash-tile-label">Pesanan meja</span>
                  <span className="dash-tile-value mono">5 aktif</span>
                  <span className="dash-tile-delta">2 siap disajikan</span>
                </div>
              </div>
              <div>
                <span className="dash-chart-label">Omzet · 14 hari</span>
                <svg viewBox="0 0 300 64" width="100%" height="56" preserveAspectRatio="none" aria-hidden="true">
                  <polyline className="dash-chart-path" points="0,48 22,44 44,46 66,36 88,38 110,30 132,32 154,24 176,26 198,18 220,20 242,12 264,14 300,6" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div className="trust">
    <div className="trust-track">
      <div className="trust-row">
        <span className="trust-item">Coffee Shop</span>
        <span className="trust-item">Restoran &amp; Warung</span>
        <span className="trust-item">Barbershop &amp; Salon</span>
        <span className="trust-item">Retail &amp; Toko Kelontong</span>
        <span className="trust-item">Laundry</span>
        <span className="trust-item">Bengkel</span>
        <span className="trust-item">Klinik &amp; Apotek</span>
        <span className="trust-item">Butik &amp; Fashion</span>
        <span className="trust-item">Percetakan &amp; ATK</span>
        <span className="trust-item">Multi-Outlet</span>
        <span className="trust-item">&amp; Semua Jenis UMKM Lainnya</span>
      </div>
      <div className="trust-row" aria-hidden="true">
        <span className="trust-item">Coffee Shop</span>
        <span className="trust-item">Restoran &amp; Warung</span>
        <span className="trust-item">Barbershop &amp; Salon</span>
        <span className="trust-item">Retail &amp; Toko Kelontong</span>
        <span className="trust-item">Laundry</span>
        <span className="trust-item">Bengkel</span>
        <span className="trust-item">Klinik &amp; Apotek</span>
        <span className="trust-item">Butik &amp; Fashion</span>
        <span className="trust-item">Percetakan &amp; ATK</span>
        <span className="trust-item">Multi-Outlet</span>
        <span className="trust-item">&amp; Semua Jenis UMKM Lainnya</span>
      </div>
    </div>
  </div>

  {/* QR MEJA SPOTLIGHT */}
  <section id="qr-meja" className="spotlight">
    <div className="wrap spotlight-grid">
      <div className="spotlight-copy reveal">
        <span className="eyebrow">Fitur andalan</span>
        <h2 className="gradient-text">Pelanggan pesan sendiri, tinggal scan meja.</h2>
        <p className="lede">
          Cetak satu kode QR per meja, tempel di meja fisik. Pelanggan buka menu di HP
          masing-masing, pilih produk, pesan langsung — tanpa nunggu dipanggil pelayan.
        </p>
        <ul className="spotlight-points">
          <li>
            <span className="spotlight-point-mark">01</span>
            <div>
              <b>Pesan berkali-kali, bayar sekali.</b>
              <p>Semua pesanan dari meja yang sama otomatis digabung jadi satu tagihan sampai pelanggan minta bayar.</p>
            </div>
          </li>
          <li>
            <span className="spotlight-point-mark">02</span>
            <div>
              <b>Dapur lihat pesanan real-time.</b>
              <p>Pesanan langsung muncul di layar kitchen display — kasir tinggal proses pembayaran saat selesai.</p>
            </div>
          </li>
          <li>
            <span className="spotlight-point-mark">03</span>
            <div>
              <b>Stok kepotong otomatis.</b>
              <p>Begitu pesanan masuk, stok langsung terkunci — dua meja nggak bisa rebutan barang yang sama.</p>
            </div>
          </li>
        </ul>
      </div>

      <div className="spotlight-visual reveal">
        <div className="phone">
          <div className="phone-island"></div>
          <div className="phone-screen">
            <div className="ps-topbar">
              <div className="ps-topbar-title">Kopi Nusantara — BSD</div>
              <div className="ps-topbar-sub">Pesan dari Meja 04</div>
            </div>
            <div className="ps-bill">
              <div className="ps-bill-title">Pesanan meja ini (belum dibayar)</div>
              <div className="ps-bill-row"><span>1× Es Teh Manis</span><span>8.000</span></div>
            </div>
            <div className="ps-search">Cari menu...</div>
            <div className="ps-chips">
              <span className="ps-chip ps-chip-active">Semua</span>
              <span className="ps-chip">Kopi</span>
              <span className="ps-chip">Makanan</span>
            </div>
            <div className="ps-grid">
              <div className="ps-card"><span className="ps-card-name">Kopi Susu</span><span className="ps-card-price">18.000</span></div>
              <div className="ps-card"><span className="ps-card-name">Croissant Coklat</span><span className="ps-card-price">28.000</span></div>
              <div className="ps-card"><span className="ps-card-name">Americano</span><span className="ps-card-price">15.000</span></div>
              <div className="ps-card"><span className="ps-card-name">Roti Bakar</span><span className="ps-card-price">22.000</span></div>
            </div>
            <div className="ps-cartbar"><span>2 item</span><span>Lihat keranjang — Rp64.000</span></div>
            <div className="ps-tabbar">
              <span className="ps-tab ps-tab-active"><span className="ps-tab-dot"></span>Menu</span>
              <span className="ps-tab"><span className="ps-tab-dot"></span>Pesanan</span>
              <span className="ps-tab"><span className="ps-tab-dot"></span>Akun</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* FEATURE GALLERY */}
  <section id="galeri">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow">Lihat isi aplikasinya</span>
        <h2 className="gradient-text">Satu aplikasi, semua sisi toko kamu.</h2>
        <p className="lede">Bukan cuma pesan lewat QR — geser buat lihat layar yang tim kamu pakai tiap hari, dari kasir sampai laporan bulanan.</p>
      </div>
      <div className="gallery-track reveal">
        <div className="gallery-card">
          <div className="dash-chrome">
            <span className="dash-dot"></span><span className="dash-dot"></span><span className="dash-dot"></span>
            <span className="dash-url mono">kasir.altora.id / kasir</span>
          </div>
          <div className="gal-shell">
            <div className="gal-sidebar">
              <span className="gal-nav-dot gal-nav-active"></span>
              <span className="gal-nav-dot"></span><span className="gal-nav-dot"></span>
              <span className="gal-nav-dot"></span><span className="gal-nav-dot"></span><span className="gal-nav-dot"></span>
            </div>
            <div className="gal-main">
              <div className="gal-main-head"><span className="gal-main-title">Kasir · Kopi Nusantara BSD</span><span className="gal-badge gal-badge-good">Shift aktif</span></div>
              <div className="gal-split">
                <div className="gal-split-main">
                  <div className="gal-row"><div><div className="gal-row-name">Kopi Susu</div><div className="gal-row-sub">Kopi · Rp18.000</div></div><span className="gal-row-value">2x</span></div>
                  <div className="gal-row"><div><div className="gal-row-name">Croissant Coklat</div><div className="gal-row-sub">Makanan · Rp28.000</div></div><span className="gal-row-value">1x</span></div>
                  <div className="gal-row"><div><div className="gal-row-name">Americano</div><div className="gal-row-sub">Kopi · Rp15.000</div></div><span className="gal-row-value">1x</span></div>
                </div>
                <div className="gal-split-side">
                  <div className="gal-cart">
                    <span className="gal-cart-title">Keranjang</span>
                    <div className="gal-cart-row"><span>3 item</span><span>64.000</span></div>
                    <div className="gal-cart-row"><span>Promo -10%</span><span>-6.400</span></div>
                    <div className="gal-cart-total"><span>TOTAL</span><span>57.600</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="gallery-card">
          <div className="dash-chrome">
            <span className="dash-dot"></span><span className="dash-dot"></span><span className="dash-dot"></span>
            <span className="dash-url mono">kasir.altora.id / laporan</span>
          </div>
          <div className="gal-shell">
            <div className="gal-sidebar">
              <span className="gal-nav-dot"></span>
              <span className="gal-nav-dot gal-nav-active"></span><span className="gal-nav-dot"></span>
              <span className="gal-nav-dot"></span><span className="gal-nav-dot"></span><span className="gal-nav-dot"></span>
            </div>
            <div className="gal-main">
              <div className="gal-main-head"><span className="gal-main-title">Laporan · Bulan ini</span><span className="gal-badge gal-badge-good">+14%</span></div>
              <div className="gal-tiles">
                <div className="gal-tile"><span className="gal-tile-label">Omzet</span><span className="gal-tile-value mono">Rp84,2jt</span><span className="gal-tile-delta">+14% vs lalu</span></div>
                <div className="gal-tile"><span className="gal-tile-label">Transaksi</span><span className="gal-tile-value mono">2.184</span><span className="gal-tile-delta">+8% vs lalu</span></div>
                <div className="gal-tile"><span className="gal-tile-label">Rata-rata</span><span className="gal-tile-value mono">Rp38,5rb</span><span className="gal-tile-delta">+5% vs lalu</span></div>
              </div>
              <svg viewBox="0 0 400 90" width="100%" height="90" preserveAspectRatio="none" aria-hidden="true">
                <polyline points="0,72 40,64 80,68 120,50 160,54 200,36 240,40 280,22 320,26 360,10 400,14" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className="gallery-card">
          <div className="dash-chrome">
            <span className="dash-dot"></span><span className="dash-dot"></span><span className="dash-dot"></span>
            <span className="dash-url mono">kasir.altora.id / produk</span>
          </div>
          <div className="gal-shell">
            <div className="gal-sidebar">
              <span className="gal-nav-dot"></span><span className="gal-nav-dot"></span>
              <span className="gal-nav-dot gal-nav-active"></span>
              <span className="gal-nav-dot"></span><span className="gal-nav-dot"></span><span className="gal-nav-dot"></span>
            </div>
            <div className="gal-main">
              <div className="gal-main-head"><span className="gal-main-title">Produk &amp; Stok</span><span className="gal-badge gal-badge-warn">1 menipis</span></div>
              <div className="gal-row"><div><div className="gal-row-name">Kopi Susu</div><div className="gal-row-sub">Kategori: Kopi</div></div><span className="gal-badge gal-badge-good">Stok 42</span></div>
              <div className="gal-row"><div><div className="gal-row-name">Croissant Coklat</div><div className="gal-row-sub">Kategori: Makanan</div></div><span className="gal-badge gal-badge-warn">Stok 3</span></div>
              <div className="gal-row"><div><div className="gal-row-name">Americano</div><div className="gal-row-sub">Kategori: Kopi</div></div><span className="gal-badge gal-badge-good">Stok 18</span></div>
              <div className="gal-row"><div><div className="gal-row-name">Roti Bakar</div><div className="gal-row-sub">Kategori: Makanan</div></div><span className="gal-badge gal-badge-good">Stok 25</span></div>
            </div>
          </div>
        </div>

        <div className="gallery-card">
          <div className="dash-chrome">
            <span className="dash-dot"></span><span className="dash-dot"></span><span className="dash-dot"></span>
            <span className="dash-url mono">kasir.altora.id / absensi</span>
          </div>
          <div className="gal-shell">
            <div className="gal-sidebar">
              <span className="gal-nav-dot"></span><span className="gal-nav-dot"></span><span className="gal-nav-dot"></span>
              <span className="gal-nav-dot gal-nav-active"></span>
              <span className="gal-nav-dot"></span><span className="gal-nav-dot"></span>
            </div>
            <div className="gal-main">
              <div className="gal-main-head"><span className="gal-main-title">Absensi · Hari ini</span><span className="gal-badge gal-badge-good">4/5 hadir</span></div>
              <div className="gal-row"><div><div className="gal-row-name">Rani — Kasir</div><div className="gal-row-sub">Masuk 08.02</div></div><span className="gal-badge gal-badge-good">Hadir</span></div>
              <div className="gal-row"><div><div className="gal-row-name">Dimas — Barista</div><div className="gal-row-sub">Masuk 08.15</div></div><span className="gal-badge gal-badge-good">Hadir</span></div>
              <div className="gal-row"><div><div className="gal-row-name">Sinta — Barista</div><div className="gal-row-sub">Belum absen</div></div><span className="gal-badge gal-badge-warn">Telat</span></div>
              <div className="gal-row"><div><div className="gal-row-name">Budi — Kasir</div><div className="gal-row-sub">Masuk 07.58</div></div><span className="gal-badge gal-badge-good">Hadir</span></div>
            </div>
          </div>
        </div>

        <div className="gallery-card">
          <div className="dash-chrome">
            <span className="dash-dot"></span><span className="dash-dot"></span><span className="dash-dot"></span>
            <span className="dash-url mono">kasir.altora.id / dapur</span>
          </div>
          <div className="gal-shell">
            <div className="gal-sidebar">
              <span className="gal-nav-dot"></span><span className="gal-nav-dot"></span><span className="gal-nav-dot"></span><span className="gal-nav-dot"></span>
              <span className="gal-nav-dot gal-nav-active"></span>
              <span className="gal-nav-dot"></span>
            </div>
            <div className="gal-main">
              <div className="gal-main-head"><span className="gal-main-title">Kitchen Display</span><span className="gal-badge gal-badge-warn">4 pesanan aktif</span></div>
              <div className="gal-tickets">
                <div className="gal-ticket">
                  <div className="gal-ticket-head"><span>Meja 04</span><span>2 mnt lalu</span></div>
                  <div className="gal-ticket-item">1x Kopi Susu · 1x Roti Bakar</div>
                </div>
                <div className="gal-ticket">
                  <div className="gal-ticket-head"><span>Meja 07</span><span>5 mnt lalu</span></div>
                  <div className="gal-ticket-item">2x Americano</div>
                </div>
                <div className="gal-ticket">
                  <div className="gal-ticket-head"><span>Meja 02</span><span>7 mnt lalu</span></div>
                  <div className="gal-ticket-item">1x Croissant Coklat</div>
                </div>
                <div className="gal-ticket">
                  <div className="gal-ticket-head"><span>Take away</span><span>1 mnt lalu</span></div>
                  <div className="gal-ticket-item">3x Kopi Susu</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="gallery-card">
          <div className="dash-chrome">
            <span className="dash-dot"></span><span className="dash-dot"></span><span className="dash-dot"></span>
            <span className="dash-url mono">kasir.altora.id / member</span>
          </div>
          <div className="gal-shell">
            <div className="gal-sidebar">
              <span className="gal-nav-dot"></span><span className="gal-nav-dot"></span><span className="gal-nav-dot"></span><span className="gal-nav-dot"></span><span className="gal-nav-dot"></span>
              <span className="gal-nav-dot gal-nav-active"></span>
            </div>
            <div className="gal-main">
              <div className="gal-main-head"><span className="gal-main-title">Member · Dewi A.</span><span className="gal-badge gal-badge-good">Member sejak 2023</span></div>
              <div className="gal-split">
                <div className="gal-split-side">
                  <div className="gal-loyalty">
                    <div className="gal-loyalty-top"><span>KARTU MEMBER</span><span>ALTORA</span></div>
                    <div>
                      <div className="gal-row-sub" style={{ color: "rgba(255,255,255,0.8)" }}>Poin terkumpul</div>
                      <div className="gal-loyalty-points">1.240 pts</div>
                    </div>
                  </div>
                </div>
                <div className="gal-split-main">
                  <div className="gal-row"><div><div className="gal-row-name">Transaksi terakhir</div><div className="gal-row-sub">3 hari lalu</div></div><span className="gal-row-value">Rp57.600</span></div>
                  <div className="gal-row"><div><div className="gal-row-name">Total kunjungan</div><div className="gal-row-sub">Sejak Jan 2023</div></div><span className="gal-row-value">86x</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="gallery-nav">
        <button type="button" className="gallery-nav-btn gallery-prev" aria-label="Sebelumnya">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <button type="button" className="gallery-nav-btn gallery-next" aria-label="Berikutnya">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>
    </div>
  </section>

  {/* PROBLEM / SOLUTION */}
  <section id="kenapa">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow">Kenapa Altora</span>
        <h2>Data toko yang tadinya nyebar, sekarang ngumpul.</h2>
        <p className="lede">Nota kertas, WhatsApp grup karyawan, catatan stok di buku tulis — kerja, tapi capek. Altora gantikan itu semua tanpa harus belajar sistem yang rumit.</p>
      </div>
      <div className="compare reveal">
        <div className="compare-cell">
          <h3>Pencatatan transaksi</h3>
          <div className="compare-pair">
            <span className="tag tag-before">Sebelum</span>
            <p className="compare-text">Nota manual atau kalkulator, gampang hilang, susah direkap akhir bulan.</p>
          </div>
          <div className="compare-pair">
            <span className="tag tag-after">Dengan Altora</span>
            <p className="compare-text">Setiap transaksi tercatat otomatis, struk digital, bisa cetak ke printer thermal.</p>
          </div>
        </div>
        <div className="compare-cell">
          <h3>Stok barang</h3>
          <div className="compare-pair">
            <span className="tag tag-before">Sebelum</span>
            <p className="compare-text">Stok ditebak-tebak, baru sadar habis pas pelanggan sudah pesan.</p>
          </div>
          <div className="compare-pair">
            <span className="tag tag-after">Dengan Altora</span>
            <p className="compare-text">Potongan stok otomatis tiap transaksi, plus riwayat lengkap tiap perubahan.</p>
          </div>
        </div>
        <div className="compare-cell">
          <h3>Untung &amp; rugi</h3>
          <div className="compare-pair">
            <span className="tag tag-before">Sebelum</span>
            <p className="compare-text">Owner nggak tahu pasti untung berapa sampai tutup buku akhir bulan.</p>
          </div>
          <div className="compare-pair">
            <span className="tag tag-after">Dengan Altora</span>
            <p className="compare-text">Laporan omzet &amp; untung bersih (sudah dikurangi pengeluaran) real-time.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* FEATURE LEDGER */}
  <section id="fitur">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow">Yang ada di dalam</span>
        <h2>Satu paket, isinya lengkap.</h2>
        <p className="lede">Bukan cuma kasir — semua yang dibutuhkan toko harian sudah ada, tanpa beli modul tambahan.</p>
      </div>
      <div className="ledger reveal">
        <div className="ledger-head">
          <span>Fitur</span><span>Untuk apa</span><span style={{ textAlign: "right" }}>Status</span>
        </div>

        <div className="ledger-row">
          <span className="ledger-feature">Kasir &amp; struk digital</span>
          <span className="ledger-desc">Jual cepat, banyak metode bayar (tunai/QRIS/e-wallet/deposit), cetak ke printer thermal.</span>
          <span className="ledger-status">✓ Aktif</span>
        </div>
        <div className="ledger-row">
          <span className="ledger-feature">Meja QR &amp; dapur</span>
          <span className="ledger-desc">Pelanggan pesan sendiri lewat scan QR, dapur pantau lewat layar kitchen display.</span>
          <span className="ledger-status">✓ Aktif</span>
        </div>
        <div className="ledger-row">
          <span className="ledger-feature">Produk, stok &amp; varian</span>
          <span className="ledger-desc">Ukuran, level gula, topping — plus transfer stok antar outlet dan riwayat lengkap.</span>
          <span className="ledger-status">✓ Aktif</span>
        </div>
        <div className="ledger-row">
          <span className="ledger-feature">Member &amp; poin</span>
          <span className="ledger-desc">Kartu QR, saldo deposit, poin otomatis dari tiap transaksi.</span>
          <span className="ledger-status">✓ Aktif</span>
        </div>
        <div className="ledger-row">
          <span className="ledger-feature">Promo terjadwal</span>
          <span className="ledger-desc">Happy hour &amp; diskon kategori aktif sendiri sesuai jam, tanpa input manual.</span>
          <span className="ledger-status">✓ Aktif</span>
        </div>
        <div className="ledger-row">
          <span className="ledger-feature">Karyawan &amp; absensi</span>
          <span className="ledger-desc">Jadwal kerja per outlet, absen dengan foto dan lokasi GPS.</span>
          <span className="ledger-status">✓ Aktif</span>
        </div>
        <div className="ledger-row">
          <span className="ledger-feature">Booking &amp; reservasi</span>
          <span className="ledger-desc">Janji potong rambut, atau pesanan yang diantar/dibawa ke acara.</span>
          <span className="ledger-status">✓ Aktif</span>
        </div>
        <div className="ledger-row">
          <span className="ledger-feature">Laporan &amp; ekspor</span>
          <span className="ledger-desc">Omzet, produk terlaris, untung bersih, siap diekspor ke Excel/CSV.</span>
          <span className="ledger-status">✓ Aktif</span>
        </div>
        <div className="ledger-row">
          <span className="ledger-feature">Mode offline</span>
          <span className="ledger-desc">Kasir tetap bisa jualan walau internet mati, transaksi sinkron otomatis nanti.</span>
          <span className="ledger-status">✓ Aktif</span>
        </div>
        <div className="ledger-row">
          <span className="ledger-feature">Multi-outlet &amp; tim</span>
          <span className="ledger-desc">Banyak cabang, banyak karyawan dengan peran berbeda, satu dashboard.</span>
          <span className="ledger-status">✓ Aktif</span>
        </div>
      </div>
    </div>
  </section>

  {/* HOW IT WORKS */}
  <section id="cara-kerja">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow">Cara kerja</span>
        <h2>Mulai jualan hari ini juga.</h2>
        <p className="lede">Tiga langkah, tanpa training berhari-hari.</p>
      </div>
      <div className="steps reveal">
        <div className="step">
          <span className="step-num">01</span>
          <h3>Daftar toko</h3>
          <p>Isi nama usaha, jenis usaha, dan outlet pertamamu.</p>
        </div>
        <div className="step">
          <span className="step-num">02</span>
          <h3>Atur produk &amp; tim</h3>
          <p>Tambah menu atau produk, undang karyawan, cetak QR meja kalau perlu.</p>
        </div>
        <div className="step">
          <span className="step-num">03</span>
          <h3>Mulai jualan</h3>
          <p>Kasir langsung bisa dipakai hari itu juga — laporan &amp; stok jalan otomatis di belakang layar.</p>
        </div>
      </div>
    </div>
  </section>

  {/* USE CASES */}
  <section id="usecase">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow">Cocok untuk usaha kamu</span>
        <h2>Satu aplikasi, banyak cara pakai.</h2>
      </div>
      <div className="cases reveal">
        <div className="case-card">
          <span className="case-kicker">Coffee shop &amp; F&amp;B</span>
          <h3>Meja penuh, dapur tetap tenang.</h3>
          <p>Pelanggan pesan lewat QR di meja, dapur lihat antrian di layar kitchen display, kasir tinggal proses pembayaran.</p>
        </div>
        <div className="case-card">
          <span className="case-kicker">Barbershop &amp; salon</span>
          <h3>Jadwal potong rambut, rapi tanpa buku catatan.</h3>
          <p>Booking pelanggan yang telepon, tentukan kapster/barbernya, dan tetap jualan produk perawatan lewat kasir yang sama.</p>
        </div>
        <div className="case-card">
          <span className="case-kicker">Retail &amp; toko kecil</span>
          <h3>Stok kelihatan, laporan langsung ada.</h3>
          <p>Varian ukuran/warna, transfer stok antar cabang, dan laporan produk terlaris tanpa hitung manual.</p>
        </div>
      </div>
    </div>
  </section>

  {/* PRICING */}
  <section id="harga">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow">Harga</span>
        <h2>Mulai gratis, naik kelas kalau sudah butuh.</h2>
        <p className="lede">Bayar bulanan, tanpa kontrak tahunan. Batas paket otomatis mengikuti jumlah outlet, karyawan, dan produkmu.</p>
      </div>
      <div className="pricing reveal">
        <div className="plan">
          <span className="plan-name mono">Free</span>
          <div className="plan-price">Rp0<small> /bulan</small></div>
          <p className="plan-desc">Buat coba-coba atau usaha yang baru mulai jalan.</p>
          <ul className="plan-specs">
            <li><b>1</b> outlet</li>
            <li><b>3</b> karyawan</li>
            <li><b>50</b> produk</li>
          </ul>
          <a className="btn btn-ghost" href="https://wa.me/6285190911170?text=Halo%20Altora%2C%20saya%20mau%20mulai%20paket%20Free" target="_blank" rel="noopener">Mulai gratis</a>
        </div>
        <div className="plan featured">
          <span className="plan-badge">Paling laris</span>
          <span className="plan-name mono">Basic</span>
          <div className="plan-price">Rp99.000<small> /bulan</small></div>
          <p className="plan-desc">Buat usaha yang sudah mulai buka cabang kedua.</p>
          <ul className="plan-specs">
            <li><b>3</b> outlet</li>
            <li><b>10</b> karyawan</li>
            <li><b>500</b> produk</li>
          </ul>
          <a className="btn btn-primary" href="https://wa.me/6285190911170?text=Halo%20Altora%2C%20saya%20mau%20tanya%20paket%20Basic" target="_blank" rel="noopener">Tanya paket ini</a>
        </div>
        <div className="plan">
          <span className="plan-name mono">Pro</span>
          <div className="plan-price">Rp249.000<small> /bulan</small></div>
          <p className="plan-desc">Buat yang serius scale up ke banyak cabang.</p>
          <ul className="plan-specs">
            <li><b>Tanpa batas</b> outlet</li>
            <li><b>Tanpa batas</b> karyawan</li>
            <li><b>Tanpa batas</b> produk</li>
          </ul>
          <a className="btn btn-ghost" href="https://wa.me/6285190911170?text=Halo%20Altora%2C%20saya%20mau%20tanya%20paket%20Pro" target="_blank" rel="noopener">Tanya paket ini</a>
        </div>
      </div>
    </div>
  </section>

  {/* CLOSING CTA */}
  <section className="closing" id="kontak">
    <div className="closing-glow" aria-hidden="true"></div>
    <div className="wrap">
      <span className="eyebrow">Siap mulai?</span>
      <h2 style={{ marginTop: "14px" }}>Siap beresin toko kamu?</h2>
      <p className="lede">Chat singkat aja dulu — ceritakan jenis usahamu, kami bantu tentuin paket yang pas.</p>
      <div className="closing-actions">
        <a className="btn btn-primary" href="https://wa.me/6285190911170?text=Halo%20Altora%2C%20saya%20mau%20tanya%20soal%20aplikasi%20kasirnya" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 5L2 22l5.2-1.36a9.94 9.94 0 0 0 4.84 1.23h.01c5.5 0 9.96-4.46 9.96-9.96S17.55 2 12.04 2Zm5.87 14.24c-.25.7-1.45 1.34-2 1.43-.51.08-1.15.11-1.86-.12-.43-.13-.98-.32-1.69-.62-2.97-1.28-4.9-4.26-5.05-4.46-.15-.2-1.21-1.6-1.21-3.06 0-1.45.76-2.16 1.03-2.46.27-.3.6-.37.8-.37.2 0 .4 0 .58.01.18.01.44-.07.68.53.25.6.85 2.08.92 2.23.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.18-.31.4-.44.53-.15.15-.3.31-.13.6.17.3.76 1.28 1.64 2.08 1.13 1.03 2.08 1.35 2.38 1.5.3.15.47.13.65-.07.18-.2.75-.87.95-1.17.2-.3.4-.25.68-.15.28.1 1.76.85 2.06 1 .3.15.5.23.57.35.07.13.07.73-.18 1.43Z"/></svg>
          Chat via WhatsApp
        </a>
        <a className="btn btn-ghost" href="mailto:admin@altora.my.id?subject=Tanya%20Altora">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 6h18v12H3z"/><path d="m3 7 9 6 9-6"/></svg>
          admin@altora.my.id
        </a>
      </div>
      <div className="closing-contact">
        <span>PT. ALTORA INTERNATIONAL TECHNOLOGY</span>
        <span>+62 851-9091-1170</span>
      </div>
    </div>
  </section>
</main>

<footer className="site">
  <div className="wrap">
    <div className="footer-grid">
      <div>
        <a className="brand" href="#top">
          <span className="brand-mark">
            <svg viewBox="0 0 400 460" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M 210 40 C 150 40 100 75 70 130 L 130 175 C 150 140 175 118 210 118 C 245 118 268 138 268 168 L 268 195 L 175 195 C 105 195 55 235 55 300 C 55 365 110 405 175 405 C 215 405 245 388 268 360 L 268 395 L 335 395 L 335 168 C 335 90 290 40 210 40 Z M 268 250 L 268 300 C 268 335 235 350 195 350 C 160 350 130 335 130 305 C 130 270 165 250 205 250 Z" fill="url(#altoraLogoGradient)" fillRule="evenodd" />
              <path d="M 268 195 L 175 195 C 105 195 55 235 55 300 C 55 320 60 337 70 352 C 75 300 120 262 180 262 L 268 262 Z" fill="url(#altoraLogoShade)" />
              <path d="M 335 300 C 335 350 315 390 275 408 C 305 400 335 375 335 335 Z" fill="url(#altoraLogoGradient)" />
            </svg>
          </span>
          <span className="brand-word">ALTORA</span>
        </a>
        <p className="footer-desc">Aplikasi kasir dan manajemen toko untuk UMKM Indonesia — coffee shop, barbershop, retail, dan berbagai jenis usaha lainnya, dalam satu layar.</p>
      </div>
      <div className="footer-col">
        <div className="footer-heading">Halaman</div>
        <a href="#fitur">Fitur</a>
        <a href="#cara-kerja">Cara kerja</a>
        <a href="#harga">Harga</a>
        <a href="#kontak">Kontak</a>
      </div>
      <div className="footer-col">
        <div className="footer-heading">Kontak</div>
        <p style={{ marginBottom: "6px" }}>PT. ALTORA INTERNATIONAL TECHNOLOGY</p>
        <a href="mailto:admin@altora.my.id">admin@altora.my.id</a>
        <a href="tel:+6285190911170">+62 851-9091-1170</a>
      </div>
    </div>
    <div className="footer-bottom">
      <span>© 2026 PT. ALTORA INTERNATIONAL TECHNOLOGY.</span>
      <span>Dibuat untuk UMKM Indonesia.</span>
    </div>
  </div>
</footer>
    </div>
  );
}
