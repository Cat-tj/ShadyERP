/** Bulatkan ke atas ke kelipatan terdekat (default Rp500) — hindari harga ganjil kayak Rp13.452. */
export function roundPriceUp(price: number, step = 500): number {
  if (price <= 0) return 0;
  return Math.ceil(price / step) * step;
}

/** Harga jual dari HPP + target margin (margin dihitung dari harga jual: margin% = (harga-HPP)/harga). */
export function computeSuggestedPrice(hpp: number, targetMarginPercent: number): number | null {
  if (hpp <= 0) return null;
  if (targetMarginPercent <= 0 || targetMarginPercent >= 100) return null;
  const rawPrice = hpp / (1 - targetMarginPercent / 100);
  return roundPriceUp(rawPrice);
}
