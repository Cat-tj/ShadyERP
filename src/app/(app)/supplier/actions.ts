"use server";

import { auth } from "@/lib/auth";
import {
  createSupplier,
  updateSupplier,
  setSupplierStatus as setSupplierStatusService,
} from "@/server/services/supplier-service";

export async function createSupplierAction(data: {
  name: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  address?: string;
  paymentTerms?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return { error: "Unauthorized" };
    }

    const supplier = await createSupplier(session.user.tenantId, {
      name: data.name,
      phone: data.phone,
      email: data.email,
      contactPerson: data.contactPerson,
      address: data.address,
      paymentTerms: data.paymentTerms,
    });

    return { data: supplier };
  } catch (err) {
    console.error("Error creating supplier:", err);
    return { error: "Gagal membuat supplier" };
  }
}

export async function updateSupplierAction(
  supplierId: string,
  data: {
    name: string;
    phone?: string;
    email?: string;
    contactPerson?: string;
    paymentTerms?: string;
  }
) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return { error: "Unauthorized" };
    }

    const supplier = await updateSupplier(session.user.tenantId, supplierId, {
      name: data.name,
      phone: data.phone,
      email: data.email,
      contactPerson: data.contactPerson,
      paymentTerms: data.paymentTerms,
    });

    return { data: supplier };
  } catch (err) {
    console.error("Error updating supplier:", err);
    return { error: "Gagal mengubah supplier" };
  }
}

export async function setSupplierStatusAction(supplierId: string, status: "ACTIVE" | "INACTIVE" | "BLACKLISTED") {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return { error: "Unauthorized" };
    }

    const supplier = await setSupplierStatusService(session.user.tenantId, supplierId, status);

    return { data: supplier };
  } catch (err) {
    console.error("Error updating supplier status:", err);
    return { error: "Gagal mengubah status supplier" };
  }
}
