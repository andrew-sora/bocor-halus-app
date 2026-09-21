import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { listByMonth, totalByMonth } from "@/lib/db";
import type { Expense } from "@/lib/db";
import { ExpenseRow } from "@/components/ExpenseRow";
import { formatRupiah } from "@/lib/format";
import { formatTanggalId, namaBulan } from "@/lib/date";
import { C } from "@/constants/Colors";

type Section = { title: string; data: Expense[] };

export default function RekapDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { ym } = useLocalSearchParams<{ ym: string }>();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Update title header dengan nama bulan
  useEffect(() => {
    if (!ym) return;
    const [year, month] = ym.split("-").map(Number);
    navigation.setOptions({
      title: `${namaBulan(month)} ${year}`,
    });
  }, [ym, navigation]);

  useEffect(() => {
    if (!ym) return;
    Promise.all([listByMonth(ym), totalByMonth(ym)])
      .then(([exps, t]) => {
        setExpenses(exps);
        setTotal(t);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [ym]);

  // Kelompokkan per tanggal
  const sections: Section[] = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const exp of expenses) {
      const list = map.get(exp.spentAt) ?? [];
      list.push(exp);
      map.set(exp.spentAt, list);
    }
    return Array.from(map.entries()).map(([date, data]) => ({
      title: date,
      data,
    }));
  }, [expenses]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={C.greenDark} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header total bulan */}
      <View style={styles.totalHeader}>
        <Text style={styles.totalLabel}>Total Bulan Ini</Text>
        <Text style={styles.totalAmount}>{formatRupiah(total)}</Text>
        <Text style={styles.txCount}>{expenses.length} transaksi</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
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
            <Text style={styles.emptyText}>Tidak ada transaksi bulan ini.</Text>
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
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 30,
    fontWeight: "700",
    color: C.white,
    marginBottom: 4,
  },
  txCount: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
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
    fontSize: 16,
    color: C.muted,
  },
});
