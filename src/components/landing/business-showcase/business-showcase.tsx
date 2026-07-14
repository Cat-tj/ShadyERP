"use client";

import { useState, type CSSProperties } from "react";
import { VERTICALS } from "@/lib/verticals";
import { BusinessTabs } from "./business-tabs";
import { DeviceStage } from "./device-stage";
import { BUSINESS_SHOWCASES } from "./showcase-data";

export function BusinessShowcase() {
  const [activeKey, setActiveKey] = useState(BUSINESS_SHOWCASES[0].key);
  const active = BUSINESS_SHOWCASES.find((item) => item.key === activeKey) ?? BUSINESS_SHOWCASES[0];
  const vertical = VERTICALS.find((item) => item.key === active.key)!;

  return <section id="ekosistem" className="business-showcase" style={{ "--showcase-primary": vertical.theme.primary, "--showcase-soft": vertical.theme.soft, "--showcase-bg": vertical.theme.background } as CSSProperties}>
    <div className="wrap">
      <header className="business-showcase-head"><span className="eyebrow">Cocok untuk usaha kamu</span><h2>Satu fondasi, disesuaikan dengan cara kerja usahamu.</h2><p>Pengguna cukup mencatat fakta lapangan. Altora mengurus stok, uang, tugas, dan tindakan lanjutannya.</p></header>
      <BusinessTabs items={BUSINESS_SHOWCASES} activeKey={activeKey} onChange={setActiveKey} />
      <div className="business-showcase-body" id={`showcase-panel-${active.key}`} role="tabpanel" aria-labelledby={`showcase-tab-${active.key}`}>
        <div className="business-showcase-copy"><span>{active.label}</span><h3>{active.headline}</h3><p>{active.description}</p><ul><li>Workflow yang relevan, bukan dashboard generik.</li><li>Data penting muncul sebelum menjadi masalah.</li><li>Tetap ringan untuk dipakai tim setiap hari.</li></ul></div>
        <DeviceStage showcase={active} />
      </div>
    </div>
  </section>;
}
