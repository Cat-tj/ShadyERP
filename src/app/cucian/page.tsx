import { LaundryStatusChecker } from "@/components/laundry/laundry-status-checker";

export const metadata = {
  title: "Cek Status Cucian — Altora",
};

export default function CucianStatusPage() {
  return (
    <div className="portal-backdrop flex min-h-screen items-center justify-center px-4 py-10">
      <LaundryStatusChecker />
    </div>
  );
}
