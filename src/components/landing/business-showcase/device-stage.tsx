import type { CSSProperties } from "react";
import { DesktopFrame, MetricGrid, StatusFooter, TabletFrame } from "./shared";
import { STAGE_METRICS } from "./showcase-data";
import type { ShowcaseDefinition } from "./types";
import { VERTICALS } from "@/lib/verticals";

export function DeviceStage({ showcase }: { showcase: ShowcaseDefinition }) {
  const vertical = VERTICALS.find((item) => item.key === showcase.key)!;
  const metrics = STAGE_METRICS[showcase.key];
  const Screen = showcase.Screen;
  const style = { "--showcase-primary": vertical.theme.primary, "--showcase-soft": vertical.theme.soft, "--showcase-bg": vertical.theme.background } as CSSProperties;
  return <div className="bs-stage" style={style}>
    <div className="bs-stage-glow" aria-hidden="true" />
    <div className="bs-laptop"><DesktopFrame title={vertical.subdomain}><div className="bs-desktop-title"><span>{showcase.label} · Hari ini</span><b>Live</b></div><MetricGrid metrics={metrics} density="compact" /><div className="bs-desktop-list"><strong>{showcase.headline}</strong><span>{showcase.description}</span><StatusFooter /></div></DesktopFrame></div>
    <div className="bs-tablet-wrap"><TabletFrame title={showcase.label} metrics={metrics} /></div>
    <div className="bs-phone-wrap"><div key={showcase.key} className="bs-screen-enter"><Screen density={showcase.density} /></div></div>
  </div>;
}
