"use client";

import { useEffect } from "react";

/**
 * Efek ringan tanpa library: header nempel yang berubah pas discroll,
 * dan scroll-reveal via IntersectionObserver untuk elemen [data-reveal].
 * Konten tidak pernah disembunyikan sebelum JS aktif (lihat globals.css).
 */
export function PageEffects() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    document.documentElement.classList.add("fx-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return null;
}
