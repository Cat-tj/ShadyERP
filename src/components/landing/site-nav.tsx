"use client";

import { useEffect, useRef, useState } from "react";
import { VERTICALS, type VerticalDef } from "@/lib/verticals";

const WA_HREF = "https://wa.me/6285190911170?text=Halo%20Altora%2C%20saya%20mau%20tanya%20soal%20aplikasi%20kasirnya";

export function SiteNav({ vertical }: { vertical?: VerticalDef }) {
  const [scrolled, setScrolled] = useState(false);
  const [solusiOpen, setSolusiOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerToggleRef = useRef<HTMLButtonElement>(null);
  const solusiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!solusiOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (solusiRef.current && !solusiRef.current.contains(e.target as Node)) setSolusiOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSolusiOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [solusiOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const drawer = drawerRef.current;
    const focusables = drawer?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    const first = focusables?.[0];
    const last = focusables?.[focusables.length - 1];
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        drawerToggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !focusables || focusables.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const logo = vertical ? (
    <img src={`/brand/${vertical.key}-symbol-onlight.svg`} alt="" width={40} height={40} style={{ display: "block" }} />
  ) : (
    <img src="/brand/altora-purple-symbol.svg" alt="" width={40} height={40} style={{ display: "block" }} />
  );

  return (
    <header className={`site ${scrolled ? "is-scrolled" : ""}`}>
      <div className="wrap nav">
        <a className="brand" href="#top">
          <span className="brand-mark">{logo}</span>
          <span className="brand-word">ALTORA</span>
        </a>

        <nav className="nav-links" aria-label="Navigasi utama">
          <div className="nav-dropdown" ref={solusiRef}>
            <button
              type="button"
              className="navlink navlink-btn"
              aria-expanded={solusiOpen}
              aria-haspopup="true"
              onClick={() => setSolusiOpen((v) => !v)}
            >
              Solusi
              <svg viewBox="0 0 12 8" width="10" height="7" aria-hidden="true" className={`nav-caret ${solusiOpen ? "is-open" : ""}`}>
                <path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {solusiOpen && (
              <div className="nav-dropdown-panel" role="menu">
                {VERTICALS.map((v) => (
                  <a
                    key={v.key}
                    role="menuitem"
                    href={`https://${v.subdomain}.altora.my.id`}
                    className="nav-dropdown-item"
                    onClick={() => setSolusiOpen(false)}
                  >
                    <img src={`/brand/${v.key}-symbol-onlight.svg`} alt="" width={18} height={18} />
                    <span>{v.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
          <a className="navlink" href="#fitur">Fitur</a>
          <a className="navlink" href="#harga">Harga</a>
          <a className="navlink" href="#faq">FAQ</a>
          <a className="navlink" href="#kontak">Tentang</a>
        </nav>

        <div className="nav-cta">
          <a className="btn btn-ghost nav-login" href="/login">Login</a>
          <a className="btn btn-primary" href="/register">Mulai Gratis</a>
          <button
            type="button"
            className="nav-drawer-toggle"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            aria-label={drawerOpen ? "Tutup menu" : "Buka menu"}
            ref={drawerToggleRef}
            onClick={() => setDrawerOpen((v) => !v)}
          >
            <span className={`hamburger ${drawerOpen ? "is-open" : ""}`} aria-hidden="true">
              <i></i><i></i><i></i>
            </span>
          </button>
        </div>
      </div>

      {drawerOpen && (
        <div className="nav-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div
            id="mobile-drawer"
            className="nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
            ref={drawerRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="nav-drawer-head">
              <span className="brand">
                <span className="brand-mark">{logo}</span>
                <span className="brand-word">ALTORA</span>
              </span>
              <button type="button" className="nav-drawer-close" aria-label="Tutup menu" onClick={() => setDrawerOpen(false)}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            <div className="nav-drawer-links">
              <span className="nav-drawer-heading">Solusi</span>
              {VERTICALS.map((v) => (
                <a key={v.key} href={`https://${v.subdomain}.altora.my.id`} onClick={() => setDrawerOpen(false)}>{v.label}</a>
              ))}
              <span className="nav-drawer-heading">Halaman</span>
              <a href="#fitur" onClick={() => setDrawerOpen(false)}>Fitur</a>
              <a href="#harga" onClick={() => setDrawerOpen(false)}>Harga</a>
              <a href="#faq" onClick={() => setDrawerOpen(false)}>FAQ</a>
              <a href="#kontak" onClick={() => setDrawerOpen(false)}>Tentang</a>
            </div>
            <div className="nav-drawer-actions">
              <a className="btn btn-ghost" href="/login">Login</a>
              <a className="btn btn-primary" href="/register">Mulai Gratis</a>
              <a className="btn btn-ghost" href={WA_HREF} target="_blank" rel="noopener">Chat WhatsApp</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
