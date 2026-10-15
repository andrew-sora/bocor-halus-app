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
import { C, getCategoryById } from "@/constants/Colors";

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
              <Text style={styles.txCount}>{expenses.length} transaksi</Text>
            </View>

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
                <Text style={styles.transactionListTitle}>Riwayat Transaksi Harian</Text>
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
  breakdownCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 12,
  },
  multiProgressBar: {
    height: 10,
    borderRadius: 99,
    flexDirection: "row",
    overflow: "hidden",
    backgroundColor: C.mutedBg,
    marginBottom: 16,
  },
  categoryList: {
    gap: 10,
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
    justifyContent: "center",
    alignItems: "center",
  },
  catEmojiText: {
    fontSize: 18,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "700",
    color: C.ink,
  },
  categoryCount: {
    fontSize: 11,
    color: C.muted,
    marginTop: 1,
  },
  categoryRight: {
    alignItems: "flex-end",
  },
  categoryAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: C.ink,
  },
  categoryPercent: {
    fontSize: 11,
    fontWeight: "700",
    color: C.greenDark,
    marginTop: 1,
  },
  transactionListHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
  },
  transactionListTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
