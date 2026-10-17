import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, useNavigation, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  listByMonth,
  totalByMonth,
  getBudgetLimit,
  getMonthlyExtraBudget,
} from "@/lib/db";
import type { Expense } from "@/lib/db";
import { ExpenseRow } from "@/components/ExpenseRow";
import { FinancialCalendar } from "@/components/FinancialCalendar";
import { formatRupiah } from "@/lib/format";
import { formatTanggalId, namaBulan, todayLocal } from "@/lib/date";
import { C, getCategoryById } from "@/constants/Colors";

type Section = { title: string; data: Expense[] };

export default function RekapDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { ym } = useLocalSearchParams<{ ym: string }>();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [budgetLimit, setBudgetLimit] = useState(3000000);
  const [extraBudget, setExtraBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Update title header dengan nama bulan
  useEffect(() => {
    if (!ym) return;
    const [year, month] = ym.split("-").map(Number);
    navigation.setOptions({
      title: `${namaBulan(month)} ${year}`,
    });
  }, [ym, navigation]);

  const loadData = useCallback(async () => {
    if (!ym) return;
    try {
      const [exps, t, bLimit, extra] = await Promise.all([
        listByMonth(ym),
        totalByMonth(ym),
        getBudgetLimit(),
        getMonthlyExtraBudget(ym),
      ]);
      setExpenses(exps);
      setTotal(t);
      setBudgetLimit(bLimit);
      setExtraBudget(extra);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [ym]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const totalBudget = budgetLimit + extraBudget;
  const sisa = totalBudget - total;

  // Catat pengeluaran susulan khusus untuk bulan ini
  const handleAddExpenseThisMonth = () => {
    if (!ym) return;
    const [year, month] = ym.split("-").map(Number);
    const now = new Date();
    let defaultDate = `${ym}-01`;
    if (year === now.getFullYear() && month === now.getMonth() + 1) {
      defaultDate = todayLocal();
    } else {
      const daysInMonth = new Date(year, month, 0).getDate();
      defaultDate = `${ym}-${String(Math.min(25, daysInMonth)).padStart(2, "0")}`;
    }
    router.push({ pathname: "/tambah", params: { defaultDate } });
  };

  // Hitung komposisi per kategori
  const categoryBreakdown = useMemo(() => {
    if (total <= 0 || expenses.length === 0) return [];
    const map = new Map<string, { total: number; count: number }>();
    for (const exp of expenses) {
      const catId = exp.category || "lainnya";
      const current = map.get(catId) ?? { total: 0, count: 0 };
      map.set(catId, {
        total: current.total + exp.amount,
        count: current.count + 1,
      });
    }

    const items = Array.from(map.entries()).map(([catId, data]) => {
      const cat = getCategoryById(catId);
      const percentage = Math.round((data.total / total) * 100);
      return {
        catId,
        cat,
        total: data.total,
        count: data.count,
        percentage,
      };
    });

    items.sort((a, b) => b.total - a.total);
    return items;
  }, [expenses, total]);

  // Kelompokkan per tanggal (bisa difilter jika ada tanggal yang dipilih di kalender)
  const filteredExpenses = useMemo(() => {
    if (!selectedDate) return expenses;
    return expenses.filter((e) => e.spentAt === selectedDate);
  }, [expenses, selectedDate]);

  const sections: Section[] = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const exp of filteredExpenses) {
      const list = map.get(exp.spentAt) ?? [];
      list.push(exp);
      map.set(exp.spentAt, list);
    }
    return Array.from(map.entries()).map(([date, data]) => ({
      title: date,
      data,
    }));
  }, [filteredExpenses]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={C.greenDark} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View>
            {/* Header total bulan */}
            <View style={styles.totalHeader}>
              <Text style={styles.totalLabel}>Total Pengeluaran Bulan Ini</Text>
              <Text style={styles.totalAmount}>{formatRupiah(total)}</Text>
              <Text style={styles.txCount}>{expenses.length} transaksi tercatat</Text>

              {/* Status Sisa Uang / Uang Terselamatkan */}
              <View style={styles.balanceContainer}>
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceSubtext}>Pemasukan / Jatah Belanja:</Text>
                  <Text style={styles.balanceSubval}>{formatRupiah(totalBudget)}</Text>
                </View>
                <View style={[styles.balanceBadge, sisa >= 0 ? styles.balanceSafe : styles.balanceOver]}>
                  <Text style={[styles.balanceBadgeText, sisa >= 0 ? styles.balanceSafeText : styles.balanceOverText]}>
                    {sisa >= 0
                      ? `🎉 Sisa Uang Hemat: +${formatRupiah(sisa)}`
                      : `⚠️ Melebihi Jatah: -${formatRupiah(Math.abs(sisa))}`}
                  </Text>
                </View>
              </View>

              {/* Tombol Catat Pengeluaran Susulan di Bulan Ini */}
              <TouchableOpacity
                style={styles.addMonthBtn}
                onPress={handleAddExpenseThisMonth}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Catat pengeluaran di bulan ini"
              >
                <Text style={styles.addMonthBtnText}>+ Catat Pengeluaran Bulan Ini</Text>
              </TouchableOpacity>
            </View>

            {/* Kalender Pengeluaran Visual */}
            {ym && (
              <View style={{ marginTop: 14 }}>
                <FinancialCalendar
                  yearMonth={ym}
                  expenses={expenses}
                  budgetLimit={totalBudget}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  todayStr={todayLocal()}
                />
              </View>
            )}

            {/* Komposisi Kategori */}
            {categoryBreakdown.length > 0 && (
              <View style={styles.breakdownCard}>
                <Text style={styles.breakdownTitle}>Komposisi Pengeluaran</Text>

                {/* Progress bar bertingkat */}
                <View style={styles.multiProgressBar}>
                  {categoryBreakdown.map((item) => (
                    <View
                      key={item.catId}
                      style={{
                        width: `${Math.max(item.percentage, 3)}%`,
                        backgroundColor: item.cat.color,
                        height: "100%",
                      }}
                    />
                  ))}
                </View>

                {/* List Kategori */}
                <View style={styles.categoryList}>
                  {categoryBreakdown.map((item) => (
                    <View key={item.catId} style={styles.categoryRow}>
                      <View style={styles.categoryLeft}>
                        <View style={[styles.catEmojiBadge, { backgroundColor: item.cat.bg }]}>
                          <Text style={styles.catEmojiText}>{item.cat.emoji}</Text>
                        </View>
                        <View>
                          <Text style={styles.categoryName}>{item.cat.label}</Text>
                          <Text style={styles.categoryCount}>{item.count} transaksi</Text>
                        </View>
                      </View>
                      <View style={styles.categoryRight}>
                        <Text style={styles.categoryAmount}>{formatRupiah(item.total)}</Text>
                        <Text style={styles.categoryPercent}>{item.percentage}%</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {expenses.length > 0 && (
              <View style={styles.transactionListHeader}>
                <View style={styles.transactionListHeaderRow}>
                  <Text style={styles.transactionListTitle}>
                    {selectedDate
                      ? `Transaksi ${formatTanggalId(selectedDate)}`
                      : "Riwayat Transaksi Harian"}
                  </Text>
                  {selectedDate && (
                    <TouchableOpacity
                      onPress={() => setSelectedDate(null)}
                      style={styles.resetFilterBtn}
                    >
                      <Text style={styles.resetFilterText}>Lihat Semua ✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>
              {formatTanggalId(section.title)}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ExpenseRow
            expense={item}
            onPress={() =>
              router.push({ pathname: "/tambah", params: { id: item.id } })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Tidak ada transaksi di bulan ini.</Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={handleAddExpenseThisMonth}
            >
              <Text style={styles.emptyAddBtnText}>+ Catat Transaksi Sekarang</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.cream,
  },
  totalHeader: {
    backgroundColor: C.greenDark,
    padding: 20,
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 30,
    fontWeight: "800",
    color: C.white,
    marginBottom: 2,
  },
  txCount: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  balanceContainer: {
    marginTop: 14,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  balanceSubtext: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  balanceSubval: {
    fontSize: 13,
    color: C.white,
    fontWeight: "700",
  },
  balanceBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  balanceSafe: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.4)",
  },
  balanceOver: {
    backgroundColor: "rgba(225, 29, 72, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.4)",
  },
  balanceBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  balanceSafeText: {
    color: "#6EE7B7",
  },
  balanceOverText: {
    color: "#FDA4AF",
  },
  addMonthBtn: {
    marginTop: 14,
    backgroundColor: C.greenLight,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  addMonthBtnText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "700",
  },
  sectionHeader: {
    backgroundColor: C.cream,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  empty: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: C.muted,
    marginBottom: 12,
  },
  emptyAddBtn: {
    backgroundColor: C.greenDark,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "700",
  },
  breakdownCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.ink,
    marginBottom: 12,
  },
  multiProgressBar: {
    height: 10,
    borderRadius: 5,
    flexDirection: "row",
    overflow: "hidden",
    backgroundColor: C.mutedBg,
    marginBottom: 16,
  },
  categoryList: {
    gap: 12,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  catEmojiBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  catEmojiText: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: C.ink,
  },
  categoryCount: {
    fontSize: 12,
    color: C.muted,
  },
  categoryRight: {
    alignItems: "flex-end",
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: C.ink,
  },
  categoryPercent: {
    fontSize: 12,
    color: C.muted,
    fontWeight: "500",
  },
  transactionListHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  transactionListHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  transactionListTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.inkLight,
  },
  resetFilterBtn: {
    backgroundColor: C.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  resetFilterText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.danger,
  },
});
