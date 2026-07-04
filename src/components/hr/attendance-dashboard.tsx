"use client";

import { GlassPanel } from "@/components/ui/glass-panel";

interface AttendanceData {
  userName: string;
  presentDays: number;
  onTime: number;
  late: number;
  punctuality: number;
}

interface AttendanceDashboardProps {
  data: AttendanceData[];
  isLoading?: boolean;
}

export function AttendanceDashboard({ data, isLoading }: AttendanceDashboardProps) {
  if (isLoading) {
    return <div className="text-center text-[var(--color-text-secondary)]">Loading...</div>;
  }

  if (!data || data.length === 0) {
    return <p className="text-[var(--color-text-secondary)]">Belum ada data kehadiran</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <GlassPanel key={item.userName} className="rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-[var(--color-text)]">{item.userName}</h3>
              <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Kehadiran</p>
                  <p className="font-mono-data font-semibold text-[var(--color-text)]">{item.presentDays} hari</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Tepat Waktu</p>
                  <p className="font-mono-data font-semibold text-green-600">{item.onTime}x</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Terlambat</p>
                  <p className="font-mono-data font-semibold text-orange-600">{item.late}x</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--color-text-secondary)]">Kehadiran</p>
              <p className={`text-2xl font-bold ${item.punctuality >= 80 ? "text-green-600" : item.punctuality >= 70 ? "text-yellow-600" : "text-red-600"}`}>
                {item.punctuality}%
              </p>
            </div>
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}

interface TeamPerformanceProps {
  data: {
    staffName: string;
    transactionCount: number;
    totalRevenue: number;
    avgTransaction: number;
  }[];
  isLoading?: boolean;
}

export function TeamPerformance({ data, isLoading }: TeamPerformanceProps) {
  if (isLoading) return <div className="text-[var(--color-text-secondary)]">Loading...</div>;
  if (!data || data.length === 0) return <p className="text-[var(--color-text-secondary)]">Belum ada data</p>;

  const sorted = [...data].sort((a, b) => b.totalRevenue - a.totalRevenue);

  return (
    <div className="space-y-2">
      {sorted.map((item, idx) => (
        <GlassPanel key={item.staffName} className="rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-xs font-bold text-[var(--color-primary)]">
                {idx + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">{item.staffName}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">{item.transactionCount} transaksi</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono-data text-sm font-bold text-[var(--color-text)]">
                Rp{Math.round(item.totalRevenue / 1000000)}M
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">Rata: Rp{Math.round(item.avgTransaction / 1000)}K</p>
            </div>
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}
