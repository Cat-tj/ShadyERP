"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

/** Barcode Code128 dari SKU produk — dirender client-side (bukan API luar), dipakai untuk label cetak & preview form. */
export function BarcodeSvg({
  value,
  height = 46,
  width = 1.6,
  fontSize = 12,
  className = "",
}: {
  value: string;
  height?: number;
  width?: number;
  fontSize?: number;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !value.trim()) return;
    try {
      JsBarcode(svgRef.current, value, {
        format: "CODE128",
        height,
        width,
        fontSize,
        margin: 4,
        displayValue: true,
      });
    } catch {
      // Karakter tidak valid untuk CODE128 (jarang, mis. emoji) — biarkan svg kosong daripada crash.
    }
  }, [value, height, width, fontSize]);

  return <svg ref={svgRef} className={className} role="img" aria-label={`Barcode ${value}`} />;
}
