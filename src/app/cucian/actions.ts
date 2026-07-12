"use server";

import { getPublicLaundryOrderStatus } from "@/server/services/laundry-service";

export type PublicLaundryStatus = {
  orderNumber: string;
  customerName: string;
  outletName: string;
  status: string;
  serviceType: string;
  serviceName: string | null;
  total: number;
  paidAmount: number;
  dueAt: string | null;
  createdAt: string;
};

export type CheckLaundryStatusResult = { order?: PublicLaundryStatus; error?: string };

export async function checkLaundryStatusAction(
  orderNumber: string,
  phone: string
): Promise<CheckLaundryStatusResult> {
  if (!orderNumber.trim() || !phone.trim()) {
    return { error: "Isi nomor order dan nomor HP dulu ya." };
  }

  const order = await getPublicLaundryOrderStatus(orderNumber, phone);
  if (!order) {
    return { error: "Order tidak ditemukan. Cek lagi nomor order & nomor HP-nya." };
  }

  return {
    order: {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      outletName: order.outlet.name,
      status: order.status,
      serviceType: order.serviceType,
      serviceName: order.serviceName,
      total: order.total,
      paidAmount: order.paidAmount,
      dueAt: order.dueAt?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
    },
  };
}
