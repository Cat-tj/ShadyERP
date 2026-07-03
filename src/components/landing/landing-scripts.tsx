"use client";

import { useEffect } from "react";

type TiltOptions = {
  baseY: number;
  baseX: number;
  maxY: number;
  maxX: number;
  perspective: number;
  resetMs?: number;
};

function initTilt(stageSel: string, targetSel: string, opts: TiltOptions) {
  const stage = document.querySelector<HTMLElement>(stageSel);
  const card = document.querySelector<HTMLElement>(targetSel);
  if (!stage || !card) return () => {};

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches;
  if (reduceMotion || coarsePointer) return () => {};

  const { baseY, baseX, maxY, maxX, perspective, resetMs = 600 } = opts;
  const baseTransform = `perspective(${perspective}px) rotateY(${baseY}deg) rotateX(${baseX}deg)`;

  let pointer: { x: number; y: number } | null = null;
  let rafId: number | null = null;
  let resetTimer: ReturnType<typeof setTimeout> | null = null;

  function onEntranceDone(e: AnimationEvent) {
    if (e.target !== card || e.animationName !== "card-in") return;
    card!.style.animation = "none";
  }
  card.addEventListener("animationend", onEntranceDone);

  function apply() {
    rafId = null;
    if (!pointer) return;
    const rect = card!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const halfW = Math.max(rect.width / 2, 1);
    const halfH = Math.max(rect.height / 2, 1);
    const nx = Math.max(-1, Math.min(1, (pointer.x - cx) / halfW));
    const ny = Math.max(-1, Math.min(1, (pointer.y - cy) / halfH));
    const rotY = baseY + nx * maxY;
    const rotX = baseX - ny * maxX;
    card!.style.transform = `perspective(${perspective}px) rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg)`;
  }

  function onMove(e: MouseEvent) {
    pointer = { x: e.clientX, y: e.clientY };
    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }
    if (rafId === null) rafId = requestAnimationFrame(apply);
    resetTimer = setTimeout(() => {
      card!.style.transform = baseTransform;
    }, resetMs);
  }
  function onLeave() {
    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }
    card!.style.transform = baseTransform;
  }

  stage.addEventListener("mousemove", onMove);
  stage.addEventListener("mouseleave", onLeave);

  return () => {
    card.removeEventListener("animationend", onEntranceDone);
    stage.removeEventListener("mousemove", onMove);
    stage.removeEventListener("mouseleave", onLeave);
    if (rafId !== null) cancelAnimationFrame(rafId);
    if (resetTimer) clearTimeout(resetTimer);
  };
}

function initReveal() {
  const els = document.querySelectorAll<HTMLElement>(".altora-landing .reveal");
  if (!("IntersectionObserver" in window) || els.length === 0) {
    els.forEach((el) => el.classList.add("in"));
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

function initGalleryNav() {
  const track = document.querySelector<HTMLElement>(".altora-landing .gallery-track");
  const prev = document.querySelector<HTMLElement>(".altora-landing .gallery-prev");
  const next = document.querySelector<HTMLElement>(".altora-landing .gallery-next");
  if (!track || !prev || !next) return () => {};

  function scrollByCard(dir: number) {
    const card = track!.querySelector(".gallery-card");
    const amount = card ? card.getBoundingClientRect().width + 16 : 240;
    track!.scrollBy({ left: dir * amount, behavior: "smooth" });
  }
  const onPrev = () => scrollByCard(-1);
  const onNext = () => scrollByCard(1);
  prev.addEventListener("click", onPrev);
  next.addEventListener("click", onNext);

  return () => {
    prev.removeEventListener("click", onPrev);
    next.removeEventListener("click", onNext);
  };
}

export function LandingScripts() {
  useEffect(() => {
    const cleanups = [
      initReveal(),
      initTilt(".altora-landing .hero-visual", ".altora-landing .dash-card", {
        baseY: -6,
        baseX: 2,
        maxY: 8,
        maxX: 6,
        perspective: 1400,
      }),
      initTilt(".altora-landing .spotlight-visual", ".altora-landing .phone", {
        baseY: 8,
        baseX: 2,
        maxY: 10,
        maxX: 6,
        perspective: 1200,
      }),
      initGalleryNav(),
    ];
    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
