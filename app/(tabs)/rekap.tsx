import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  monthlyTotals,
  availableYears,
  totalByYear,
  getBudgetLimit,
} from "@/lib/db";
import { namaBulan } from "@/lib/date";
import { formatRupiah } from "@/lib/format";
import { strings } from "@/constants/strings";
import { C } from "@/constants/Colors";

type MonthRow = { month: number; total: number; count: number };

export default function RekapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [year, setYear] = useState(new Date().getFullYear());
  const [years, setYears] = useState<number[]>([]);
  const [rows, setRows] = useState<MonthRow[]>([]);
  const [yearTotal, setYearTotal] = useState(0);
  const [budgetLimit, setBudgetLimit] = useState(3000000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    availableYears()
      .then(setYears)
      .catch(console.error);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [mt, yt, bLimit] = await Promise.all([
        monthlyTotals(year),
        totalByYear(year),
        getBudgetLimit(),
      ]);
      setRows(mt);
      setYearTotal(yt);
      setBudgetLimit(bLimit);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const totalSavedYear = useMemo(() => {
    return rows.reduce((acc, row) => {
      if (row.total > 0 && row.total < budgetLimit) {
        return acc + (budgetLimit - row.total);
      }
      return acc;
    }, 0);
  }, [rows, budgetLimit]);

  const canPrev = years.length === 0 || year > Math.min(...years);
  const canNext = years.length === 0 || year < Math.max(...years);

  const navigateToMonth = (month: number) => {
    const ym = `${year}-${String(month).padStart(2, "0")}`;
    router.push({ pathname: "/rekap/[ym]", params: { ym } });
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Selector Tahun */}
      <View style={styles.yearRow}>
        <TouchableOpacity
          style={[styles.arrowBtn, !canPrev && styles.arrowDisabled]}
          onPress={() => canPrev && setYear((y) => y - 1)}
          disabled={!canPrev}
          accessibilityLabel="Tahun sebelumnya"
        >
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.yearBadge}>
          <Text style={styles.yearText}>{year}</Text>
        </View>
        <TouchableOpacity
          style={[styles.arrowBtn, !canNext && styles.arrowDisabled]}
          onPress={() => canNext && setYear((y) => y + 1)}
          disabled={!canNext}
          accessibilityLabel="Tahun berikutnya"
        >
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 40 }}
          color={C.greenDark}
          size="large"
        />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => String(item.month)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item }) => {
            const hasData = item.total > 0;
            const isSaved = item.total <= budgetLimit;
            const diff = Math.abs(budgetLimit - item.total);

            return (
              <TouchableOpacity
                style={[styles.monthCard, !hasData && styles.monthCardEmpty]}
                onPress={() => navigateToMonth(item.month)}
                activeOpacity={0.7}
              >
                <View style={styles.monthHeader}>
                  <Text style={[styles.monthName, !hasData && styles.mutedText]}>
                    {namaBulan(item.month)}
                  </Text>
                  <View style={[styles.badge, hasData ? styles.badgeActive : styles.badgeMuted]}>
                    <Text style={[styles.badgeText, hasData ? styles.badgeActiveText : styles.badgeMutedText]}>
                      {hasData ? `${item.count} transaksi` : "Kosong"}
                    </Text>
                  </View>
                </View>

                <View style={styles.monthAmountRow}>
                  <Text style={[styles.monthTotal, !hasData && styles.mutedTotal]}>
                    {formatRupiah(item.total)}
                  </Text>
                  {hasData && (
                    <View
                      style={[
                        styles.savingsBadge,
                        isSaved ? styles.savingsSafeBg : styles.savingsOverBg,
                      ]}
                    >
                      <Text
                        style={[
                          styles.savingsBadgeText,
                          isSaved ? styles.savingsSafeText : styles.savingsOverText,
                        ]}
                      >
                        {isSaved
                          ? `+${formatRupiah(diff)} hemat`
                          : `-${formatRupiah(diff)} bocor`}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            <View style={styles.totalCard}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{strings.totalSetahun} ({year})</Text>
                <Text style={styles.totalAmount}>{formatRupiah(yearTotal)}</Text>
              </View>

              {totalSavedYear > 0 && (
                <View style={styles.savedYearContainer}>
                  <Text style={styles.savedYearLabel}>🎉 Uang Berhasil Dihemat Tahun Ini:</Text>
                  <Text style={styles.savedYearAmount}>+{formatRupiah(totalSavedYear)}</Text>
                </View>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  arrowBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  arrowDisabled: { opacity: 0.3 },
  arrowText: { fontSize: 24, color: C.ink, lineHeight: 28 },
  yearBadge: {
    marginHorizontal: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.greenSoft,
  },
  yearText: { fontSize: 18, fontWeight: "700", color: C.greenDark },
  monthCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  monthCardEmpty: { opacity: 0.6 },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  monthName: { fontSize: 16, fontWeight: "700", color: C.ink },
  mutedText: { color: C.muted },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeActive: { backgroundColor: C.greenSoft },
  badgeMuted: { backgroundColor: C.mutedBg },
  badgeText: { fontSize: 12, fontWeight: "600" },
  badgeActiveText: { color: C.greenDark },
  badgeMutedText: { color: C.muted },
  monthAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  monthTotal: { fontSize: 18, fontWeight: "700", color: C.greenDark },
  mutedTotal: { color: C.muted, fontWeight: "400", fontSize: 15 },
  savingsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  savingsSafeBg: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  savingsOverBg: {
    backgroundColor: "rgba(225, 29, 72, 0.12)",
  },
  savingsBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  savingsSafeText: {
    color: "#059669",
  },
  savingsOverText: {
    color: "#E11D48",
  },
  totalCard: {
    backgroundColor: C.greenDark,
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: "500" },
  totalAmount: { fontSize: 20, fontWeight: "800", color: C.white },
  savedYearContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  savedYearLabel: {
    fontSize: 12,
    color: "#A7F3D0",
    fontWeight: "600",
  },
  savedYearAmount: {
    fontSize: 14,
    color: "#A7F3D0",
    fontWeight: "800",
  },
});
