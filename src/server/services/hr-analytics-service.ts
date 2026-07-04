import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subDays } from "date-fns";

/**
 * HR Analytics service
 * - Attendance trends (punctuality, overtime, absences)
 * - Team performance dashboard
 * - Shift utilization analysis
 */

// ============ ATTENDANCE TRENDS ============

export async function getAttendanceTrends(tenantId: string, period = 30) {
  const startDate = subDays(new Date(), period);
  const endDate = new Date();

  const users = await prisma.user.findMany({
    where: { tenantId, role: { in: ["STAFF", "MANAGER"] } },
    include: {
      attendances: {
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return users
    .map((user) => {
      const total = user.attendances.length;
      if (total === 0) return null;

      const onTime = user.attendances.filter((a) => {
        const schedule = a.shiftStart; // simplified - should check schedule
        return new Date(a.createdAt) <= new Date(schedule);
      }).length;

      const late = total - onTime;
      const absent = 0; // Kalau tidak ada attendance record untuk scheduled day

      return {
        userId: user.id,
        userName: user.name,
        role: user.role,
        totalPresent: total,
        onTime,
        late,
        punctuality: total > 0 ? Math.round((onTime / total) * 100) : 0,
        absent,
      };
    })
    .filter((x) => x !== null);
}

// ============ OVERTIME ANALYSIS ============

export async function getOvertimeAnalysis(tenantId: string, outletId?: string, period = 30) {
  const startDate = subDays(new Date(), period);

  const shifts = await prisma.cashierShift.findMany({
    where: {
      tenantId,
      ...(outletId && { outletId }),
      closedAt: { gte: startDate },
    },
    include: { user: true },
  });

  const overtimeData = shifts
    .map((shift) => {
      if (!shift.closedAt) return null;

      const duration = new Date(shift.closedAt).getTime() - new Date(shift.openedAt).getTime();
      const hours = duration / (1000 * 60 * 60);
      const standardHours = 8;
      const overtimeHours = Math.max(0, hours - standardHours);

      return {
        userId: shift.userId,
        userName: shift.user?.name,
        shiftId: shift.id,
        date: shift.openedAt,
        duration: Math.round(hours * 100) / 100,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
        hasOvertime: overtimeHours > 0,
      };
    })
    .filter((x) => x !== null);

  return overtimeData;
}

// ============ TEAM PERFORMANCE ============

export async function getTeamPerformance(tenantId: string, outletId?: string) {
  const users = await prisma.user.findMany({
    where: {
      tenantId,
      role: { in: ["STAFF", "MANAGER"] },
      ...(outletId && { outlets: { some: { outletId } } }),
    },
    include: {
      attendances: {
        where: {
          createdAt: {
            gte: subDays(new Date(), 30),
          },
        },
      },
      sales: {
        where: {
          createdAt: {
            gte: subDays(new Date(), 30),
          },
          isCancelled: false,
        },
      },
    },
  });

  return users.map((user) => {
    const totalSales = user.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const saleCount = user.sales.length;
    const avgSale = saleCount > 0 ? Math.round(totalSales / saleCount) : 0;
    const attendanceRate = 0; // would need to calculate based on scheduled shifts

    return {
      userId: user.id,
      userName: user.name,
      role: user.role,
      presentDays: user.attendances.length,
      totalSales,
      transactionCount: saleCount,
      avgTransaction: avgSale,
      performance:
        saleCount > 10 && attendanceRate > 80
          ? "Excellent"
          : saleCount > 5 && attendanceRate > 70
            ? "Good"
            : "Needs Improvement",
    };
  });
}

// ============ SHIFT UTILIZATION ============

export async function getShiftUtilization(tenantId: string, outletId?: string, period = 30) {
  const startDate = subDays(new Date(), period);

  const shifts = await prisma.cashierShift.findMany({
    where: {
      tenantId,
      ...(outletId && { outletId }),
      openedAt: { gte: startDate },
    },
    include: {
      sales: true,
    },
  });

  const utilization = shifts.map((shift) => {
    const duration = shift.closedAt
      ? (new Date(shift.closedAt).getTime() - new Date(shift.openedAt).getTime()) / (1000 * 60 * 60)
      : 0;

    const transactionCount = shift.sales.length;
    const transactionsPerHour = duration > 0 ? Math.round((transactionCount / duration) * 100) / 100 : 0;

    return {
      shiftId: shift.id,
      date: shift.openedAt,
      durationHours: Math.round(duration * 100) / 100,
      transactionCount,
      transactionsPerHour,
      utilizationLevel:
        transactionsPerHour > 3 ? "High" : transactionsPerHour > 1 ? "Medium" : "Low",
    };
  });

  return utilization;
}

// ============ PAYROLL SUMMARY (simplified) ============

export async function getPayrollSummary(tenantId: string, outletId?: string, year?: number, month?: number) {
  let startDate: Date, endDate: Date;

  if (year && month) {
    const date = new Date(year, month - 1, 1);
    startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  } else {
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  const users = await prisma.user.findMany({
    where: {
      tenantId,
      role: { in: ["STAFF", "MANAGER"] },
      ...(outletId && { outlets: { some: { outletId } } }),
    },
    include: {
      attendances: {
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      },
    },
  });

  const payrollData = users.map((user) => {
    const workingDays = user.attendances.length;
    const dailyRate = 200000; // Simplified - should come from contract/setting
    const baseSalary = workingDays * dailyRate;

    // Could add overtime pay, deductions, etc.
    const grossSalary = baseSalary;
    const netSalary = Math.round(grossSalary * 0.9); // Simplified 10% deduction

    return {
      userId: user.id,
      userName: user.name,
      workingDays,
      dailyRate,
      baseSalary,
      deductions: grossSalary - netSalary,
      netSalary,
    };
  });

  const totalPayroll = payrollData.reduce((sum, emp) => sum + emp.netSalary, 0);

  return {
    period: month ? `${month}/${year}` : new Date().toISOString().slice(0, 7),
    employees: payrollData,
    totalPayroll,
    employeeCount: payrollData.length,
  };
}

// ============ STAFF COMPARISON ============

export async function getStaffComparison(tenantId: string, outletId?: string, period = 30) {
  const startDate = subDays(new Date(), period);

  const stats = await prisma.user.findMany({
    where: {
      tenantId,
      role: { in: ["STAFF", "MANAGER"] },
      ...(outletId && { outlets: { some: { outletId } } }),
    },
    include: {
      attendances: {
        where: { createdAt: { gte: startDate } },
      },
      sales: {
        where: { createdAt: { gte: startDate }, isCancelled: false },
      },
    },
  });

  return stats
    .map((staff) => {
      const totalRevenue = staff.sales.reduce((sum, s) => sum + s.totalAmount, 0);
      const avgTransaction = staff.sales.length > 0 ? Math.round(totalRevenue / staff.sales.length) : 0;

      return {
        staffId: staff.id,
        staffName: staff.name,
        attendanceDays: staff.attendances.length,
        transactionCount: staff.sales.length,
        totalRevenue,
        avgTransaction,
        efficiency: staff.attendances.length > 0 ? Math.round(staff.sales.length / staff.attendances.length) : 0,
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}
