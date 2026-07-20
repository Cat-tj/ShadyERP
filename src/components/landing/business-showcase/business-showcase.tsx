"use client";

import { useState, type CSSProperties } from "react";
import { VERTICALS } from "@/lib/verticals";
import { BusinessTabs } from "./business-tabs";
import { DeviceStagePhoto } from "./device-stage-photo";
import { BUSINESS_SHOWCASES } from "./showcase-data";
import { BarChartIcon, CheckCircleIcon, LockIcon, PackageIcon } from "@/components/ui/icons";

export function BusinessShowcase() {
  const [activeKey, setActiveKey] = useState<(typeof BUSINESS_SHOWCASES)[number]["key"]>("toko");
  const active = BUSINESS_SHOWCASES.find((item) => item.key === activeKey) ?? BUSINESS_SHOWCASES[0];
  const vertical = VERTICALS.find((item) => item.key === active.key)!;

  return <section id="ekosistem" className="business-showcase" style={{ "--showcase-primary": vertical.theme.primary, "--showcase-deep": vertical.theme.deep, "--showcase-soft": vertical.theme.soft, "--showcase-bg": vertical.theme.background } as CSSProperties}>
    <div className="wrap">
      <div className="business-showcase-intro">
        <header className="business-showcase-head"><span className="eyebrow">Cocok untuk usaha kamu</span><h2>Satu fondasi, disesuaikan dengan cara kerja usahamu.</h2><p>Catat fakta lapangan sekali saja, Altora mengurus stok, uang, tugas, dan tindakan lanjutannya secara otomatis.</p></header>
        <BusinessTabs items={BUSINESS_SHOWCASES} activeKey={activeKey} onChange={setActiveKey} />
      </div>
      <div className="business-showcase-body" id={`showcase-panel-${active.key}`} role="tabpanel" aria-labelledby={`showcase-tab-${active.key}`}>
        <div className="business-showcase-copy"><span>{active.label}</span><h3>{active.headline}</h3><p>{active.description}</p><ul>{active.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul><div className="business-showcase-note"><PackageIcon aria-hidden="true" /><div><strong>Terintegrasi penuh</strong><span>Stok, kas, dan laporan selalu sinkron otomatis.</span></div></div><div className="business-showcase-sync"><i />Tersinkron otomatis di semua perangkat</div></div>
        <DeviceStagePhoto />
      </div>
      <div className="business-showcase-assurances" aria-label="Keunggulan Altora"><div><BarChartIcon aria-hidden="true" /><span><strong>Realtime &amp; Akurat</strong><small>Data selalu terbaru</small></span></div><div><CheckCircleIcon aria-hidden="true" /><span><strong>Mudah Digunakan</strong><small>Fokus pada tugas penting</small></span></div><div><PackageIcon aria-hidden="true" /><span><strong>Terintegrasi Penuh</strong><small>Stok, kas, laporan terhubung</small></span></div><div><LockIcon aria-hidden="true" /><span><strong>Aman &amp; Terpercaya</strong><small>Backup &amp; enkripsi data</small></span></div></div>
    </div>
  </section>;
}
