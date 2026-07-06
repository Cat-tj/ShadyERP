import { redirect } from "next/navigation";
import { requireSession } from "@/server/require-session";
import { getOpenShift, getShiftSummary } from "@/server/services/shift-service";
import { CloseShiftForm } from "@/components/kasir/close-shift-form";

export default async function TutupShiftPage() {
  const user = await requireSession();
  const shift = await getOpenShift(user.tenantId, user.id);

  if (!shift) {
    redirect("/kasir");
  }

  const summary = await getShiftSummary(user.tenantId, shift.id);

  return (
    <div className="mx-auto max-w-5xl">
      <CloseShiftForm
        shiftId={shift.id}
        outletName={shift.outlet.name}
        openingCash={shift.openingCash}
        totalPenjualanCash={summary?.totalPenjualanCash ?? 0}
        jumlahTransaksiCash={summary?.jumlahTransaksiCash ?? 0}
        totalGesekTunai={summary?.totalGesekTunai ?? 0}
        jumlahGesekTunai={summary?.jumlahGesekTunai ?? 0}
      />
    </div>
  );
}
