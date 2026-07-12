import { requireSession } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { listBookings } from "@/server/services/booking-service";
import { listUsers } from "@/server/services/user-service";
import { BookingManager } from "@/components/booking/booking-manager";

export default async function BookingPage() {
  const user = await requireSession();
  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const staff = await listUsers(user.tenantId);

  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 3);
  from.setHours(0, 0, 0, 0);
  const to = new Date(now);
  to.setDate(to.getDate() + 30);

  const bookings = await listBookings(
    user.tenantId,
    outlets.map((o) => o.id),
    { from, to }
  );

  return (
    <BookingManager
      outlets={outlets.map((o) => ({ id: o.id, name: o.name }))}
      staff={staff.map((s) => ({ id: s.id, name: s.name }))}
      bookings={bookings.map((booking) => ({
        id: booking.id,
        outletId: booking.outletId,
        outletName: booking.outlet.name,
        type: booking.type,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        memberName: booking.member?.name ?? null,
        serviceName: booking.serviceName,
        scheduledAt: booking.scheduledAt.toISOString(),
        durationMinutes: booking.durationMinutes,
        staffUserId: booking.staffUserId,
        staffName: booking.staff?.name ?? null,
        pax: booking.pax,
        eventAddress: booking.eventAddress,
        quotedAmount: booking.quotedAmount,
        transportFee: booking.transportFee,
        staffFee: booking.staffFee,
        depositAmount: booking.depositAmount,
        status: booking.status,
        note: booking.note,
      }))}
    />
  );
}
