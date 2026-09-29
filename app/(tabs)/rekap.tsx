import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { monthlyTotals, availableYears, totalByYear } from "@/lib/db";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    availableYears()
      .then(setYears)
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([monthlyTotals(year), totalByYear(year)])
      .then(([mt, yt]) => {
        setRows(mt);
        setYearTotal(yt);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year]);

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

                <Text style={[styles.monthTotal, !hasData && styles.mutedTotal]}>
                  {formatRupiah(item.total)}
                </Text>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>{strings.totalSetahun} ({year})</Text>
              <Text style={styles.totalAmount}>{formatRupiah(yearTotal)}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: C.muted,
    marginTop: 2,
  },
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
  arrowText: { fontSize: 24, fontWeight: "600", color: C.greenDark },
  yearBadge: {
    backgroundColor: C.white,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  yearText: { fontSize: 18, fontWeight: "700", color: C.ink },
  monthCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  monthCardEmpty: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderColor: "#E2E8F0",
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  monthName: { fontSize: 16, fontWeight: "700", color: C.ink },
  monthTotal: { fontSize: 18, fontWeight: "800", color: C.greenDark },
  mutedText: { color: C.muted },
  mutedTotal: { color: C.muted, fontWeight: "500" },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeActive: { backgroundColor: C.greenSoft },
  badgeMuted: { backgroundColor: C.mutedBg },
  badgeText: { fontSize: 12, fontWeight: "600" },
  badgeActiveText: { color: C.greenDark },
  badgeMutedText: { color: C.muted },
  totalCard: {
    backgroundColor: C.greenDark,
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: C.shadowStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 6,
  },
  totalLabel: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.85)" },
  totalAmount: { fontSize: 20, fontWeight: "800", color: C.white },
});
