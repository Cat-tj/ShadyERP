import type { ReactNode } from "react";
import type { ShowcaseActivity, ShowcaseMetric, ShowcaseScreenProps } from "./types";

export function PhoneFrame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="bs-phone" role="img" aria-label={`Contoh tampilan aplikasi ${label} di ponsel`}>
      <span className="bs-phone-island" aria-hidden="true" />
      <div className="bs-phone-screen">{children}</div>
    </div>
  );
}

export function PhoneHeader({ title, subtitle, badge = "Live" }: { title: string; subtitle: string; badge?: string }) {
  return (
    <header className="bs-phone-header">
      <div><strong>{title}</strong><span>{subtitle}</span></div>
      <b className="bs-live"><i />{badge}</b>
    </header>
  );
}

export function MetricGrid({ metrics, density = "comfortable" }: { metrics: ShowcaseMetric[]; density?: ShowcaseScreenProps["density"] }) {
  return <div className={`bs-metrics bs-density-${density}`}>{metrics.map((metric) => <div className={`bs-metric is-${metric.tone ?? "neutral"}`} key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></div>)}</div>;
}

export function ActivityRow({ activity }: { activity: ShowcaseActivity }) {
  return <div className="bs-activity"><i className={`is-${activity.tone ?? "info"}`} /><div><strong>{activity.title}</strong><span>{activity.detail}</span></div><b className={`is-${activity.tone ?? "info"}`}>{activity.status}</b></div>;
}

export function ActivityList({ title, activities }: { title: string; activities: ShowcaseActivity[] }) {
  return <section className="bs-main-list"><div className="bs-list-heading"><strong>{title}</strong><span>Lihat semua</span></div>{activities.map((activity) => <ActivityRow key={`${activity.title}-${activity.status}`} activity={activity} />)}</section>;
}

export function ProgressRow({ label, value, detail, tone = "primary" }: { label: string; value: number; detail: string; tone?: "primary" | "warning" | "danger" | "success" }) {
  return <div className={`bs-progress is-${tone}`}><div><span>{label}</span><b>{detail}</b></div><i><em style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></i></div>;
}

export function StatusFooter({ text = "Tersinkron otomatis" }: { text?: string }) {
  return <footer className="bs-status-footer"><i />{text}</footer>;
}

export function DesktopFrame({ title, children }: { title: string; children: ReactNode }) {
  return <div className="bs-desktop" aria-hidden="true"><div className="bs-desktop-chrome"><i /><i /><i /><span>{title}.altora.my.id</span></div><div className="bs-desktop-body">{children}</div></div>;
}

export function TabletFrame({ title, metrics }: { title: string; metrics: ShowcaseMetric[] }) {
  return <div className="bs-tablet" aria-hidden="true"><strong>{title}</strong><span>Ringkasan hari ini</span><MetricGrid metrics={metrics.slice(0, 2)} density="compact" /><StatusFooter /></div>;
}
