"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Diamkan saja — aplikasi tetap jalan normal tanpa service worker.
    });
  }, []);

  useEffect(() => {
    // 1. Escape key handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const modals = document.querySelectorAll(".fixed.inset-0:not(.bg-transparent)");
        if (modals.length > 0) {
          const activeModal = modals[modals.length - 1] as HTMLElement;
          const buttons = Array.from(activeModal.querySelectorAll("button, a"));
          const closeButton = buttons.find((btn) => {
            const text = (btn.textContent || "").toLowerCase();
            return (
              text.includes("batal") ||
              text.includes("tutup") ||
              text.includes("cancel") ||
              text.includes("keluar") ||
              btn.getAttribute("aria-label")?.toLowerCase().includes("close")
            );
          });
          if (closeButton) {
            (closeButton as HTMLElement).click();
          }
        }
      }
    };

    // 2. Click outside (backdrop click) handler
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        target.classList.contains("fixed") &&
        target.classList.contains("inset-0") &&
        !target.classList.contains("bg-transparent")
      ) {
        const buttons = Array.from(target.querySelectorAll("button, a"));
        const closeButton = buttons.find((btn) => {
          const text = (btn.textContent || "").toLowerCase();
          return (
            text.includes("batal") ||
            text.includes("tutup") ||
            text.includes("cancel") ||
            text.includes("keluar") ||
            btn.getAttribute("aria-label")?.toLowerCase().includes("close")
          );
        });
        if (closeButton) {
          (closeButton as HTMLElement).click();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return null;
}
