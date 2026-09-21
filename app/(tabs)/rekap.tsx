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

  // Load daftar tahun yang tersedia
  useEffect(() => {
    availableYears()
      .then(setYears)
      .catch(console.error);
  }, []);

  // Load data saat tahun berubah
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
      {/* Pemilih tahun */}
      <View style={styles.yearRow}>
        <TouchableOpacity
          style={[styles.arrowBtn, !canPrev && styles.arrowDisabled]}
          onPress={() => canPrev && setYear((y) => y - 1)}
          disabled={!canPrev}
          accessibilityLabel="Tahun sebelumnya"
        >
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.yearText}>{year}</Text>
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
          renderItem={({ item }) => {
            const hasData = item.total > 0;
            return (
              <TouchableOpacity
                style={styles.monthRow}
                onPress={() => navigateToMonth(item.month)}
                activeOpacity={0.7}
              >
                <Text style={[styles.monthName, !hasData && styles.mutedText]}>
                  {namaBulan(item.month)}
                </Text>
                <Text style={[styles.txCount, !hasData && styles.mutedText]}>
                  {hasData ? `${item.count} ${strings.jumlahTransaksi}` : "—"}
                </Text>
                <Text
                  style={[styles.monthTotal, !hasData && styles.mutedTotal]}
                >
                  {formatRupiah(item.total)}
                </Text>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{strings.totalSetahun}</Text>
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
  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.cream,
  },
  arrowBtn: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowDisabled: { opacity: 0.3 },
  arrowText: { fontSize: 28, fontWeight: "300", color: C.greenDark },
  yearText: { fontSize: 22, fontWeight: "700", color: C.ink, width: 100, textAlign: "center" },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    minHeight: 56,
  },
  monthName: { fontSize: 16, fontWeight: "600", color: C.ink, flex: 1 },
  txCount: { fontSize: 14, color: C.muted, width: 100, textAlign: "center" },
  monthTotal: { fontSize: 16, fontWeight: "700", color: C.greenDark, width: 120, textAlign: "right" },
  mutedText: { color: C.muted },
  mutedTotal: { color: C.mutedBg, fontWeight: "400" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: C.greenDark,
    marginTop: 8,
  },
  totalLabel: { fontSize: 16, fontWeight: "700", color: C.white },
  totalAmount: { fontSize: 18, fontWeight: "700", color: C.white },
});
