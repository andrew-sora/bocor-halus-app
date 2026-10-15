import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import type { Expense } from "@/lib/db";
import { formatRupiah } from "@/lib/format";
import { C } from "@/constants/Colors";
import { ExpenseRow } from "@/components/ExpenseRow";

type Props = {
  visible: boolean;
  onClose: () => void;
  monthName: string;
  microTotal: number;
  microCount: number;
  expenses: Expense[];
  onSelectExpense: (id: string) => void;
};

export function MicroExpensesModal({
  visible,
  onClose,
  monthName,
  microTotal,
  microCount,
  expenses,
  onSelectExpense,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheetContainer}>
          <View style={styles.content}>
            {/* Handle Drag Bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Rincian Bocor Halus</Text>
                <Text style={styles.subtitle}>
                  {microCount} transaksi kecil (&lt; Rp 50.000) • {monthName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Tutup"
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Summary Bar */}
            <View style={styles.summaryBar}>
              <Text style={styles.summaryLabel}>Total Pengeluaran Kecil:</Text>
              <Text style={styles.summaryValue}>{formatRupiah(microTotal)}</Text>
            </View>

            {/* Educative Tip */}
            <View style={styles.tipBox}>
              <Text style={styles.tipText}>
                Belanjaan kecil seperti camilan, parkir, atau kopi sering kali tidak terasa, tapi bila diakumulasikan dapat menyerap jatah belanja cukup signifikan.
              </Text>
            </View>

            {/* List */}
            <FlatList
              data={expenses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ExpenseRow
                  expense={item}
                  onPress={() => onSelectExpense(item.id)}
                />
              )}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Tidak ada transaksi kecil bulan ini.</Text>
                </View>
              }
            />

            {/* Footer Button */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.doneBtn}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.doneBtnText}>Tutup Rincian</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    maxHeight: "85%",
    backgroundColor: C.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  content: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.border,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  closeBtnText: {
    fontSize: 14,
    color: C.muted,
    fontWeight: "700",
  },
  summaryBar: {
    marginHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: C.greenDark,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.85)",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "800",
    color: C.white,
    letterSpacing: -0.3,
  },
  tipBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#F3ECE1",
    borderWidth: 1,
    borderColor: C.border,
  },
  tipText: {
    fontSize: 12,
    color: C.inkLight,
    lineHeight: 18,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: C.muted,
  },
  footer: {
    padding: 16,
    backgroundColor: C.cream,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  doneBtn: {
    backgroundColor: C.ink,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  doneBtnText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
