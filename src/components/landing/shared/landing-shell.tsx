import type { CSSProperties, ReactNode } from "react";
import { SiteNav } from "@/components/landing/site-nav";
import type { VerticalDef } from "@/lib/verticals";

export function LandingShell({ vertical, children }: { vertical: VerticalDef; children: ReactNode }) {
  const style = {
    "--vertical-primary": vertical.theme.primary,
    "--vertical-deep": vertical.theme.deep,
    "--vertical-soft": vertical.theme.soft,
    "--vertical-background": vertical.theme.background,
    "--primary": vertical.theme.primary,
    "--primary-dark": vertical.theme.deep,
    "--primary-bright": vertical.theme.accent,
    "--v-soft": vertical.theme.soft,
    "--v-bg": vertical.theme.background,
  } as CSSProperties;

  return (
    <div className={`altora-landing vertical-landing vertical-${vertical.key}`} style={style}>
      <SiteNav vertical={vertical} />
      <main id="top">{children}</main>
      <footer className="vertical-footer" id="kontak">
        <div className="vertical-wrap vertical-footer-grid">
          <div>
            <strong>ALTORA</strong>
            <p>Fondasi operasional yang dapat mengikuti cara kerja bisnismu.</p>
          </div>
          <div>
            <span>Butuh bantuan memilih alur?</span>
            <a href="https://wa.me/6285190911170?text=Halo%20Altora%2C%20saya%20mau%20tanya%20tentang%20setup" target="_blank" rel="noopener">Hubungi tim Altora</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description, id }: { eyebrow: string; title: string; description?: string; id?: string }) {
  return (
    <header className="vertical-section-heading" id={id}>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </header>
  );
}

export function FinalCta({ title, body, action = "Mulai konsultasi" }: { title: string; body: string; action?: string }) {
  return (
    <section className="vertical-final-cta">
      <div className="vertical-wrap">
        <span>Mulai dari alur yang paling penting</span>
        <h2>{title}</h2>
        <p>{body}</p>
        <div className="vertical-cta-row">
          <a className="vertical-button vertical-button-primary" href="/register">Coba Altora</a>
          <a className="vertical-button vertical-button-secondary" href="https://wa.me/6285190911170?text=Halo%20Altora%2C%20saya%20mau%20konsultasi" target="_blank" rel="noopener">{action}</a>
        </div>
      </div>
    </section>
  );
}
