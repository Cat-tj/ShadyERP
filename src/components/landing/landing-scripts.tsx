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

function initSpotlightCarousel() {
  const root = document.querySelector<HTMLElement>(".altora-landing .spotlight-wrap");
  const slides = Array.from(document.querySelectorAll<HTMLElement>(".altora-landing [data-spotlight-slide]"));
  const dots = Array.from(document.querySelectorAll<HTMLButtonElement>(".altora-landing [data-spotlight-dot]"));
  const prev = document.querySelector<HTMLButtonElement>(".altora-landing .spotlight-prev");
  const next = document.querySelector<HTMLButtonElement>(".altora-landing .spotlight-next");
  if (!root || slides.length === 0 || !prev || !next) return () => {};

  let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
  let transitionTimer: ReturnType<typeof setTimeout> | null = null;

  function setActive(nextIndex: number) {
    const normalized = (nextIndex + slides.length) % slides.length;
    if (normalized === activeIndex) return;

    const direction = normalized > activeIndex || (activeIndex === slides.length - 1 && normalized === 0) ? "next" : "prev";
    root!.dataset.spotlightDirection = direction;
    const previousIndex = activeIndex;
    activeIndex = normalized;

    if (transitionTimer) {
      clearTimeout(transitionTimer);
      transitionTimer = null;
      slides.forEach((slide, index) => {
        slide.classList.remove("is-leaving");
        slide.hidden = index !== previousIndex;
      });
    }

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      const isPrevious = index === previousIndex;
      slide.hidden = !(isActive || isPrevious);
      slide.classList.toggle("is-active", isActive);
      slide.classList.toggle("is-leaving", isPrevious);
    });

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("is-active", isActive);
      if (isActive) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });

    transitionTimer = setTimeout(() => {
      slides.forEach((slide, index) => {
        slide.classList.remove("is-leaving");
        slide.hidden = index !== activeIndex;
      });
      transitionTimer = null;
    }, 520);
  }

  const onPrev = () => setActive(activeIndex - 1);
  const onNext = () => setActive(activeIndex + 1);
  const dotHandlers = dots.map((dot, index) => {
    const handler = () => setActive(index);
    dot.addEventListener("click", handler);
    return { dot, handler };
  });

  prev.addEventListener("click", onPrev);
  next.addEventListener("click", onNext);

  return () => {
    if (transitionTimer) clearTimeout(transitionTimer);
    prev.removeEventListener("click", onPrev);
    next.removeEventListener("click", onNext);
    dotHandlers.forEach(({ dot, handler }) => dot.removeEventListener("click", handler));
  };
}

function initTourTabs() {
  const track = document.querySelector<HTMLElement>(".altora-landing .gallery-track");
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>(".altora-landing [data-tour-tab]"));
  if (!track || tabs.length === 0) return () => {};

  const cards = Array.from(track.querySelectorAll<HTMLElement>(".gallery-card"));

  function setActive(index: number) {
    tabs.forEach((tab, i) => {
      const isActive = i === index;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
    const card = cards[index];
    if (card) track!.scrollTo({ left: card.offsetLeft - track!.offsetLeft, behavior: "smooth" });
  }

  const handlers = tabs.map((tab, index) => {
    const handler = () => setActive(index);
    tab.addEventListener("click", handler);
    return { tab, handler };
  });

  return () => handlers.forEach(({ tab, handler }) => tab.removeEventListener("click", handler));
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
        baseY: -18,
        baseX: 6,
        maxY: 8,
        maxX: 6,
        perspective: 1400,
      }),
      initSpotlightCarousel(),
      initGalleryNav(),
      initTourTabs(),
    ];
    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
