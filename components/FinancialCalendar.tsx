import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { C } from "@/constants/Colors";
import { MICRO_EXPENSE_THRESHOLD } from "@/lib/db";
import type { Expense } from "@/lib/db";
import { formatTanggalId } from "@/lib/date";
import { formatRupiah } from "@/lib/format";

export type DayCalendarStatus = "future" | "no_spend" | "safe" | "bocor" | "heavy";

export interface DayData {
  dayNumber: number;
  dateString: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  total: number;
  count: number;
  bocorCount: number;
  status: DayCalendarStatus;
}

/**
 * Format nominal singkat untuk grid kalender mobile
 * misal: 15.000 -> 15k, 250.000 -> 250k, 1.500.000 -> 1.5jt
 */
export function formatCompactK(amt: number): string {
  if (amt <= 0) return "";
  if (amt < 1000) return String(amt);
  if (amt < 1000000) {
    const k = Math.round(amt / 1000);
    return `${k}k`;
  }
  const jt = amt / 1000000;
  return `${jt.toFixed(1).replace(/\.0$/, "")}jt`;
}

/**
 * Menghitung status pengeluaran satu hari
 */
export function computeDayStatus(
  dayTotal: number,
  bocorCount: number,
  dailyBudget: number,
  isFuture: boolean
): DayCalendarStatus {
  if (isFuture) return "future";
  if (dayTotal === 0) return "no_spend";
  if (dayTotal > (dailyBudget > 0 ? dailyBudget * 1.5 : 150000)) return "heavy";
  if (bocorCount > 0) return "bocor";
  return "safe";
}

/**
 * Menghasilkan grid hari dalam satu bulan (Senin - Minggu)
 */
export function generateMonthGrid(
  yearMonth: string,
  expenses: Expense[],
  dailyBudget: number,
  todayStr: string
): DayData[] {
  const [yStr, mStr] = yearMonth.split("-");
  const year = Number(yStr) || new Date().getFullYear();
  const month = Number(mStr) || new Date().getMonth() + 1;

  // Tanggal pertama dan jumlah hari
  const firstDay = new Date(year, month - 1, 1);
  const totalDays = new Date(year, month, 0).getDate();

  // Hari pertama dalam minggu (0: Sen, 1: Sel, ..., 6: Min)
  const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

  // Peta pengeluaran per tanggal
  const expenseMap = new Map<string, { total: number; count: number; bocorCount: number }>();
  for (const exp of expenses) {
    const cur = expenseMap.get(exp.spentAt) ?? { total: 0, count: 0, bocorCount: 0 };
    cur.total += exp.amount;
    cur.count += 1;
    if (exp.amount < MICRO_EXPENSE_THRESHOLD) {
      cur.bocorCount += 1;
    }
    expenseMap.set(exp.spentAt, cur);
  }

  const cells: DayData[] = [];

  // Slot kosong sebelum tanggal 1
  for (let i = 0; i < startingDayOfWeek; i++) {
    cells.push({
      dayNumber: 0,
      dateString: "",
      isCurrentMonth: false,
      isToday: false,
      total: 0,
      count: 0,
      bocorCount: 0,
      status: "future",
    });
  }

  // Isi tanggal 1 s/d totalDays
  for (let d = 1; d <= totalDays; d++) {
    const dStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const data = expenseMap.get(dStr) ?? { total: 0, count: 0, bocorCount: 0 };
    const isFuture = dStr > todayStr;
    const isToday = dStr === todayStr;

    const status = computeDayStatus(data.total, data.bocorCount, dailyBudget, isFuture);

    cells.push({
      dayNumber: d,
      dateString: dStr,
      isCurrentMonth: true,
      isToday,
      total: data.total,
      count: data.count,
      bocorCount: data.bocorCount,
      status,
    });
  }

  return cells;
}

const DAYS_HEADER = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

interface FinancialCalendarProps {
  yearMonth: string;
  expenses: Expense[];
  budgetLimit?: number;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  todayStr?: string;
}

export function FinancialCalendar({
  yearMonth,
  expenses,
  budgetLimit = 3000000,
  selectedDate,
  onSelectDate,
  todayStr = new Date().toISOString().slice(0, 10),
}: FinancialCalendarProps) {
  // Rata-rata jatah harian dari total jatah bulan ini
  const dailyBudget = useMemo(() => {
    return Math.round(budgetLimit / 30);
  }, [budgetLimit]);

  const gridCells = useMemo(() => {
    return generateMonthGrid(yearMonth, expenses, dailyBudget, todayStr);
  }, [yearMonth, expenses, dailyBudget, todayStr]);

  // Statistik bulan ini untuk ringkasan cepat kalender
  const monthStats = useMemo(() => {
    let noSpendDays = 0;
    let bocorDays = 0;
    let heavyDays = 0;
    for (const cell of gridCells) {
      if (!cell.isCurrentMonth || cell.status === "future") continue;
      if (cell.status === "no_spend") noSpendDays++;
      if (cell.status === "bocor") bocorDays++;
      if (cell.status === "heavy") heavyDays++;
    }
    return { noSpendDays, bocorDays, heavyDays };
  }, [gridCells]);

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    return gridCells.find((c) => c.dateString === selectedDate) ?? null;
  }, [gridCells, selectedDate]);

  return (
    <View style={styles.card}>
      {/* Header Bar Kalender */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>📅 Kalender Pengeluaran Visual</Text>
          <Text style={styles.subtitle}>
            Klik tanggal untuk saring transaksi harian
          </Text>
        </View>
        <View style={styles.badgeHemat}>
          <Text style={styles.badgeHematText}>
            ✨ {monthStats.noSpendDays} Hari Hemat
          </Text>
        </View>
      </View>

      {/* Bar Hari Terpilih */}
      {selectedDayData && (
        <View style={styles.selectedBar}>
          <View style={styles.selectedLeft}>
            <Text style={styles.selectedDateText}>
              {formatTanggalId(selectedDayData.dateString)}
            </Text>
            <Text style={styles.selectedTotalText}>
              Total: {formatRupiah(selectedDayData.total)} ({selectedDayData.count} transaksi)
              {selectedDayData.bocorCount > 0 && ` • 💧 ${selectedDayData.bocorCount} bocor halus`}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => onSelectDate(null)}
            accessibilityRole="button"
            accessibilityLabel="Tampilkan semua transaksi"
          >
            <Text style={styles.clearBtnText}>Tampilkan Semua ✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Header Nama Hari (Sen - Min) */}
      <View style={styles.weekHeader}>
        {DAYS_HEADER.map((dayName, idx) => {
          const isWeekend = idx >= 5;
          return (
            <View key={dayName} style={styles.weekHeaderCell}>
              <Text
                style={[
                  styles.weekHeaderText,
                  isWeekend && styles.weekHeaderWeekend,
                ]}
              >
                {dayName}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Grid Tanggal */}
      <View style={styles.grid}>
        {gridCells.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return <View key={`empty-${idx}`} style={styles.dayCellEmpty} />;
          }

          const isSelected = selectedDate === cell.dateString;
          const isWeekend = idx % 7 >= 5;

          return (
            <TouchableOpacity
              key={cell.dateString}
              style={[
                styles.dayCell,
                isWeekend && styles.dayCellWeekend,
                cell.isToday && styles.dayCellToday,
                isSelected && styles.dayCellSelected,
              ]}
              onPress={() => {
                if (isSelected) {
                  onSelectDate(null);
                } else {
                  onSelectDate(cell.dateString);
                }
              }}
              activeOpacity={0.7}
              accessibilityLabel={`Tanggal ${cell.dayNumber}, total ${formatRupiah(cell.total)}`}
            >
              {/* Tanggal & Today Marker */}
              <View style={styles.dayTopRow}>
                <Text
                  style={[
                    styles.dayNumber,
                    cell.isToday && styles.dayNumberToday,
                    isSelected && styles.dayNumberSelected,
                  ]}
                >
                  {cell.dayNumber}
                </Text>
                {cell.isToday && <View style={styles.todayDot} />}
              </View>

              {/* Status Indicator / Nominal */}
              <View style={styles.dayBottomArea}>
                {cell.total > 0 ? (
                  <View
                    style={[
                      styles.amtPill,
                      cell.status === "bocor" && styles.amtPillBocor,
                      cell.status === "heavy" && styles.amtPillHeavy,
                      cell.status === "safe" && styles.amtPillSafe,
                    ]}
                  >
                    <Text
                      style={[
                        styles.amtPillText,
                        cell.status === "bocor" && styles.amtPillTextBocor,
                        cell.status === "heavy" && styles.amtPillTextHeavy,
                        cell.status === "safe" && styles.amtPillTextSafe,
                      ]}
                      numberOfLines={1}
                    >
                      {formatCompactK(cell.total)}
                    </Text>
                  </View>
                ) : cell.status === "no_spend" ? (
                  <Text style={styles.noSpendIcon}>✨</Text>
                ) : (
                  <View style={styles.dayPlaceholder} />
                )}
              </View>

              {/* Dot Leak khusus jika ada bocor halus */}
              {cell.bocorCount > 0 && cell.status !== "bocor" && (
                <View style={styles.bocorMicroDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend / Keterangan Warna */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: C.greenLight }]} />
          <Text style={styles.legendText}>Aman</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: C.warning }]} />
          <Text style={styles.legendText}>Bocor Halus (&lt;50rb)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: C.danger }]} />
          <Text style={styles.legendText}>Belanja Besar</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={{ fontSize: 11 }}>✨</Text>
          <Text style={styles.legendText}>Nol Belanja</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
    ...Platform.select({
      web: {
        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
      },
      default: {
        elevation: 2,
        shadowColor: C.ink,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11.5,
    color: C.muted,
    marginTop: 2,
  },
  badgeHemat: {
    backgroundColor: C.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeHematText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.greenDark,
  },
  selectedBar: {
    backgroundColor: C.cream,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: C.greenLight,
  },
  selectedLeft: {
    flex: 1,
    paddingRight: 8,
  },
  selectedDateText: {
    fontSize: 13,
    fontWeight: "800",
    color: C.greenDark,
  },
  selectedTotalText: {
    fontSize: 11.5,
    color: C.inkLight,
    marginTop: 2,
  },
  clearBtn: {
    backgroundColor: C.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.danger,
  },
  weekHeader: {
    flexDirection: "row",
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  weekHeaderCell: {
    flex: 1,
    alignItems: "center",
  },
  weekHeaderText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: C.muted,
  },
  weekHeaderWeekend: {
    color: C.warning,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCellEmpty: {
    width: "14.285%",
    aspectRatio: 1,
    padding: 2,
  },
  dayCell: {
    width: "14.285%",
    aspectRatio: 1,
    padding: 2,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 3,
    backgroundColor: "transparent",
    cursor: "pointer" as any,
  },
  dayCellWeekend: {
    backgroundColor: "rgba(241, 245, 249, 0.4)",
  },
  dayCellToday: {
    borderColor: C.greenDark,
    backgroundColor: "rgba(16, 185, 129, 0.05)",
  },
  dayCellSelected: {
    backgroundColor: C.greenSoft,
    borderColor: C.greenDark,
    borderWidth: 1.5,
  },
  dayTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  dayNumber: {
    fontSize: 11,
    fontWeight: "600",
    color: C.ink,
  },
  dayNumberToday: {
    fontWeight: "800",
    color: C.greenDark,
  },
  dayNumberSelected: {
    fontWeight: "900",
    color: C.greenDark,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.greenDark,
  },
  dayBottomArea: {
    alignItems: "center",
    justifyContent: "center",
    height: 16,
    width: "100%",
  },
  amtPill: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 5,
    maxWidth: "95%",
    alignItems: "center",
    justifyContent: "center",
  },
  amtPillSafe: {
    backgroundColor: C.greenSoft,
  },
  amtPillBocor: {
    backgroundColor: C.warningBg,
  },
  amtPillHeavy: {
    backgroundColor: C.dangerBg,
  },
  amtPillText: {
    fontSize: 9,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  amtPillTextSafe: {
    color: C.greenDark,
  },
  amtPillTextBocor: {
    color: C.warning,
  },
  amtPillTextHeavy: {
    color: C.danger,
  },
  noSpendIcon: {
    fontSize: 10,
    lineHeight: 12,
  },
  dayPlaceholder: {
    height: 4,
  },
  bocorMicroDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.warning,
  },
  legendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexWrap: "wrap",
    gap: 6,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10.5,
    color: C.muted,
    fontWeight: "600",
  },
});
