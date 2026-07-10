"use client";

import Image from "next/image";
import type { PosProduct } from "./pos-screen";

export function ProductVisual({ product }: { product: PosProduct }) {
  const seed = product.name
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const palettes = [
    ["#fef3c7", "#f97316"],
    ["#dcfce7", "#16a34a"],
    ["#e0f2fe", "#0284c7"],
    ["#fce7f3", "#db2777"],
    ["#ede9fe", "#7c3aed"],
  ];
  const [bg, accent] = palettes[seed % palettes.length];
  const initials = product.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div
      className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg lg:h-20 lg:w-20"
      style={{ backgroundColor: bg }}
    >
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="96px"
          className="object-cover"
        />
      ) : (
        <>
          <div
            className="absolute -right-5 -top-5 h-16 w-16 rounded-full opacity-20"
            style={{ backgroundColor: accent }}
          />
          <div
            className="absolute -bottom-7 -left-5 h-20 w-20 rounded-full opacity-20"
            style={{ backgroundColor: accent }}
          />
          <span className="relative text-2xl font-black tracking-normal" style={{ color: accent }}>
            {initials || "M"}
          </span>
        </>
      )}
    </div>
  );
}
