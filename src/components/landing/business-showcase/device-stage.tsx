import type { CSSProperties } from "react";
import type { ShowcaseDefinition } from "./types";
import { VERTICALS } from "@/lib/verticals";

export function DeviceStage({ showcase }: { showcase: ShowcaseDefinition }) {
  const vertical = VERTICALS.find((item) => item.key === showcase.key)!;
  const Phone = showcase.Phone;
  const Laptop = showcase.Laptop;
  const Tablet = showcase.Tablet;
  const style = { "--showcase-primary": vertical.theme.primary, "--showcase-deep": vertical.theme.deep, "--showcase-soft": vertical.theme.soft, "--showcase-bg": vertical.theme.background } as CSSProperties;
  return <div className="bs-stage" style={style}>
    <div className="bs-stage-glow" aria-hidden="true" />
    <div className="bs-laptop"><div key={`${showcase.key}-laptop`} className="bs-screen-enter"><Laptop label={showcase.label} density={showcase.density} /></div></div>
    {/* Tablet sengaja TANPA key+animasi masuk: remount beranimasi di layer
        yang ketimpa laptop/HP (float animation bertumpuk) bikin Chromium
        kadang gagal repaint background layar, keliatan transparan/ghosted. */}
    <div className="bs-tablet-wrap"><Tablet label={showcase.label} density={showcase.density} /></div>
    <div className="bs-phone-wrap"><div key={`${showcase.key}-phone`} className="bs-screen-enter"><Phone density={showcase.density} /></div></div>
  </div>;
}
