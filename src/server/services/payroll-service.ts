import { prisma } from "@/lib/prisma";
import { calculateVariableEarnings } from "./production-pay-service";

/**
 * Membuat PayGroup baru untuk pengelompokan pekerja.
 */
export async function createPayGroup(
  tenantId: string,
  name: string,
  cutoffDay: number,
  paymentDay: number
) {
  return prisma.payGroup.create({
    data: {
      tenantId,
      name,
      cutoffDay,
      paymentDay,
    },
  });
}

/**
 * Membuat periode payroll baru untuk kelompok tertentu.
 */
export async function createPayrollPeriod(
  tenantId: string,
  payGroupId: string,
  name: string,
  startDate: Date,
  endDate: Date
) {
  return prisma.payrollPeriod.create({
    data: {
      tenantId,
      payGroupId,
      name,
      startDate,
      endDate,
      status: "DRAFT",
    },
  });
}

/**
 * PPh 21 TER (Tarif Efektif Rata-Rata) Calculator
 * Mengembalikan tarif % berdasarkan penghasilan bruto bulanan dan kategori PTKP.
 */
function getTerRate(gross: number, taxStatus: string): number {
  // Category mapping:
  // Cat A: TK/0, TK/1, K/0
  // Cat B: TK/2, TK/3, K/1, K/2
  // Cat C: K/3
  const status = taxStatus.toUpperCase();
  const isB = ["TK/2", "TK/3", "K/1", "K/2"].includes(status);
  const isC = status === "K/3";

  if (isC) {
    if (gross <= 5400000) return 0;
    if (gross <= 5600000) return 0.0025;
    if (gross <= 6200000) return 0.01;
    if (gross <= 6700000) return 0.0175;
    if (gross <= 8750000) return 0.03;
    return 0.05;
  } else if (isB) {
    if (gross <= 5400000) return 0;
    if (gross <= 6200000) return 0.0025;
    if (gross <= 6500000) return 0.01;
    if (gross <= 6850000) return 0.015;
    if (gross <= 8500000) return 0.03;
    return 0.05;
  } else {
    // Category A (TK/0, TK/1, K/0)
    if (gross <= 5400000) return 0;
    if (gross <= 5600000) return 0.0025;
    if (gross <= 6000000) return 0.005;
    if (gross <= 6200000) return 0.0075;
    if (gross <= 6500000) return 0.01;
    if (gross <= 7500000) return 0.0125;
    if (gross <= 8500000) return 0.0175;
    return 0.03;
  }
}

/**
 * Menghitung rincian payroll (Time-to-Pay Engine) untuk seluruh pekerja di pay group.
 */
export async function calculatePayrollPeriod(payrollPeriodId: string) {
  const period = await prisma.payrollPeriod.findUnique({
    where: { id: payrollPeriodId },
    include: { payGroup: true },
  });

  if (!period) throw new Error("Periode payroll tidak ditemukan.");
  if (period.status !== "DRAFT") throw new Error("Periode payroll sudah dikunci atau dibayar.");

  // Dapatkan seluruh pekerja aktif di dalam PayGroup ini
  const workers = await prisma.worker.findMany({
    where: {
      tenantId: period.tenantId,
      payGroupId: period.payGroupId,
      isActive: true,
    },
    include: {
      person: true,
      compensations: {
        where: {
          startDate: { lte: period.endDate },
          OR: [{ endDate: null }, { endDate: { gte: period.startDate } }],
        },
        orderBy: { startDate: "desc" },
      },
    },
  });

  // Kosongkan draf garis payroll lama
  await prisma.payrollLine.deleteMany({
    where: { payrollPeriodId },
  });

  const lines = [];

  for (const worker of workers) {
    // 1. Ambil Compensation Profile aktif
    const activeComp = worker.compensations[0];
    if (!activeComp) continue; // Skip jika tidak ada profil kompensasi aktif

    const baseSalary = activeComp.baseRate;

    // 2. Hitung Lembur (Overtime) dari OvertimeRequest yang disetujui
    const approvedOT = await prisma.overtimeRequest.findMany({
      where: {
        workerId: worker.id,
        date: { gte: period.startDate, lte: period.endDate },
        status: "APPROVED",
      },
    });
    const overtimeHours = approvedOT.reduce((sum, req) => sum + req.plannedHours, 0);
    // Upah lembur per jam di Indonesia: baseSalary / 173 * 1.5 (asumsi tarif rata-rata pengali)
    const hourlyOTRate = Math.round(baseSalary / 173);
    const overtimePay = Math.round(overtimeHours * hourlyOTRate * 1.5);

    // 3. Hitung Potongan Keterlambatan/Absensi
    const attendances = await prisma.attendance.findMany({
      where: {
        workerId: worker.id,
        clockInAt: { gte: period.startDate, lte: period.endDate },
      },
    });
    const lateInMinutes = attendances.reduce((total, att) => {
      if (att.clockInAt && att.status === "LATE") {
        // Ambil selisih keterlambatan (dummy 15 menit per status late)
        return total + 15;
      }
      return total;
    }, 0);
    // Denda keterlambatan: Rp 1,000 per menit terlambat
    const lateDeductions = lateInMinutes * 1000;

    // 4. Potongan Cuti Tidak Berbayar (Unpaid Leave)
    const leaveLedgers = await prisma.leaveLedgerEntry.findMany({
      where: {
        workerId: worker.id,
        transactionType: "USAGE",
        createdAt: { gte: period.startDate, lte: period.endDate },
        note: { contains: "UNPAID" },
      },
    });
    const unpaidDays = leaveLedgers.reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
    // Potongan per hari cuti tidak berbayar: baseSalary / 25 hari kerja
    const leaveDeductions = Math.round(unpaidDays * (baseSalary / 25));

    // 5. Hitung Variable Pay (Komisi Produksi Borongan - Milestone 4)
    const variablePay = await calculateVariableEarnings(worker.id, period.startDate, period.endDate);

    // 6. Hitung BPJS (Kes & TK)
    // BPJS Kes: 1% pekerja, 4% perusahaan. Batas atas upah Rp 12.000.000.
    const bpjsKesBasis = Math.min(baseSalary, 12000000);
    const bpjsKesEmployee = activeComp.bpjsKesActive ? Math.round(bpjsKesBasis * 0.01) : 0;
    const bpjsKesCompany = activeComp.bpjsKesActive ? Math.round(bpjsKesBasis * 0.04) : 0;

    // BPJS TK (JKK, JKM, JHT, JP): JHT employee 2%, JP employee 1% (Upah maks JP Rp 9.077.600)
    const bpjsTkBasis = baseSalary;
    const bpjsTkEmployee = activeComp.bpjsTkActive ? Math.round(bpjsTkBasis * 0.03) : 0; // JHT + JP
    const bpjsTkCompany = activeComp.bpjsTkActive ? Math.round(bpjsTkBasis * 0.0624) : 0; // JKK + JKM + JHT + JP

    // 7. Hitung PPh 21 TER (Termasuk komisi borongan)
    const grossIncome = baseSalary + overtimePay + variablePay;
    const taxRate = getTerRate(grossIncome, worker.person.taxStatus || "TK/0");
    const taxAmount = Math.round(grossIncome * taxRate);

    // 8. Hitung Gaji Bersih (Net Pay)
    const netPay = baseSalary + overtimePay + variablePay - lateDeductions - leaveDeductions - bpjsKesEmployee - bpjsTkEmployee - taxAmount;

    lines.push({
      payrollPeriodId,
      workerId: worker.id,
      baseSalary,
      overtimePay,
      lateDeductions,
      leaveDeductions,
      bpjsKesCompany,
      bpjsKesEmployee,
      bpjsTkCompany,
      bpjsTkEmployee,
      taxAmount,
      variablePay,
      netPay,
      status: "DRAFT",
    });
  }

  if (lines.length > 0) {
    await prisma.payrollLine.createMany({
      data: lines,
    });
  }

  return prisma.payrollLine.findMany({
    where: { payrollPeriodId },
    include: { worker: { include: { person: true } } },
  });
}

/**
 * Mengunci periode payroll agar tidak bisa dikalkulasi ulang.
 */
export async function lockPayrollPeriod(payrollPeriodId: string) {
  return prisma.payrollPeriod.update({
    where: { id: payrollPeriodId },
    data: { status: "LOCKED" },
  });
}

/**
 * Melakukan pembayaran penggajian (Settlement) dan membukukannya ke pengeluaran.
 */
export async function payPayrollPeriod(payrollPeriodId: string, outletId: string, createdById: string) {
  const period = await prisma.payrollPeriod.findUnique({
    where: { id: payrollPeriodId },
    include: { lines: true },
  });

  if (!period) throw new Error("Periode payroll tidak ditemukan.");
  if (period.status !== "LOCKED") throw new Error("Periode payroll harus dikunci terlebih dahulu.");

  const totalNetPay = period.lines.reduce((sum, line) => sum + line.netPay, 0);

  return prisma.$transaction(async (tx) => {
    // 1. Update status periode menjadi PAID
    await tx.payrollPeriod.update({
      where: { id: payrollPeriodId },
      data: { status: "PAID" },
    });

    // 2. Catat sebagai Expense (Biaya Penggajian)
    await tx.expense.create({
      data: {
        tenantId: period.tenantId,
        outletId,
        category: "GAJI",
        amount: totalNetPay,
        note: `Penggajian Karyawan periode ${period.name}`,
        createdById,
      },
    });
  });
}
