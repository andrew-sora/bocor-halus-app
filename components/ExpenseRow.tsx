import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { Expense } from "@/lib/db";
import { formatRupiah } from "@/lib/format";
import { strings } from "@/constants/strings";
import { C } from "@/constants/Colors";

type Props = {
  expense: Expense;
  onPress: () => void;
};

const HAS_OPERATOR = /[+\-*\/×÷x:(]/i;

export function ExpenseRow({ expense, onPress }: Props) {
  const showExpression =
    HAS_OPERATOR.test(expense.expression) &&
    expense.expression !== String(expense.amount);

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <View style={styles.left}>
        <Text style={styles.note} numberOfLines={1}>
          {expense.note.trim() || strings.tanpaCatatan}
        </Text>
        {showExpression && (
          <Text style={styles.expression} numberOfLines={1}>
            {expense.expression}
          </Text>
        )}
      </View>
      <Text style={styles.amount}>{formatRupiah(expense.amount)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: C.white,
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  note: {
    fontSize: 16,
    color: C.ink,
    fontWeight: "500",
  },
  expression: {
    fontSize: 13,
    color: C.muted,
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    color: C.greenDark,
  },
});
