import { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Expense } from "@/lib/db";
import {
  listRecent,
  totalByMonth,
  totalByYear,
  getMicroExpensesSummary,
  getBudgetLimit,
} from "@/lib/db";
import { TotalCard } from "@/components/TotalCard";
import { ExpenseRow } from "@/components/ExpenseRow";
import { strings } from "@/constants/strings";
import { formatTanggalId, currentYearMonth } from "@/lib/date";
import { C } from "@/constants/Colors";

type Section = { title: string; data: Expense[] };

export default function BerandaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [yearlyTotal, setYearlyTotal] = useState(0);
  const [budgetLimit, setBudgetLimitState] = useState(3000000);
  const [microSummary, setMicroSummary] = useState({ total: 0, count: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const ym = currentYearMonth();

  const load = useCallback(async () => {
    const [exps, mt, yt, micro, bLimit] = await Promise.all([
      listRecent(100),
      totalByMonth(ym),
      totalByYear(currentYear),
      getMicroExpensesSummary(ym),
      getBudgetLimit(),
    ]);
    setExpenses(exps);
    setMonthlyTotal(mt);
    setYearlyTotal(yt);
    setMicroSummary(micro);
    setBudgetLimitState(bLimit);
  }, [ym, currentYear]);

  // Reload setiap layar mendapat fokus
  useFocusEffect(
    useCallback(() => {
      load().catch(console.error);
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load().catch(console.error);
    setRefreshing(false);
  }, [load]);

  // Kelompokkan transaksi per tanggal
  const sections: Section[] = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const exp of expenses) {
      const list = map.get(exp.spentAt) ?? [];
      list.push(exp);
      map.set(exp.spentAt, list);
    }
    return Array.from(map.entries()).map(([date, data]) => ({ title: date, data }));
  }, [expenses]);

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.greenDark}
          />
        }
        ListHeaderComponent={
          <TotalCard
            monthlyTotal={monthlyTotal}
            yearlyTotal={yearlyTotal}
            month={currentMonth}
            year={currentYear}
            budgetLimit={budgetLimit}
            microTotal={microSummary.total}
            microCount={microSummary.count}
          />
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
            <Text style={styles.emptyTitle}>{strings.belumAdaData}</Text>
            <Text style={styles.emptySubtitle}>{strings.belumAdaDataDetail}</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
      />

      {/* Tombol utama */}
      <View style={[styles.fabContainer, { bottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/tambah")}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={strings.catatPengeluaran}
        >
          <Text style={styles.fabText}>＋  {strings.catatPengeluaran}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  sectionHeader: {
    backgroundColor: C.cream,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  empty: {
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.ink,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: C.muted,
    textAlign: "center",
    lineHeight: 22,
  },
  fabContainer: {
    position: "absolute",
    left: 16,
    right: 16,
  },
  fab: {
    backgroundColor: C.greenDark,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    color: C.white,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
