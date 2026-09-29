import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { Expense } from "@/lib/db";
import { formatRupiah } from "@/lib/format";
import { strings } from "@/constants/strings";
import { C, getCategoryById } from "@/constants/Colors";

type Props = {
  expense: Expense;
  onPress: () => void;
};

const HAS_OPERATOR = /[+\-*\/×÷x:(]/i;

export function ExpenseRow({ expense, onPress }: Props) {
  const showExpression =
    HAS_OPERATOR.test(expense.expression) &&
    expense.expression !== String(expense.amount);

  const cat = getCategoryById(expense.category);

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <View style={[styles.emojiBadge, { backgroundColor: cat.bg }]}>
        <Text style={styles.emojiText}>{cat.emoji}</Text>
      </View>

      <View style={styles.left}>
        <Text style={styles.note} numberOfLines={1}>
          {expense.note.trim() || strings.tanpaCatatan}
        </Text>
        {showExpression ? (
          <Text style={styles.expression} numberOfLines={1}>
            {expense.expression}
          </Text>
        ) : (
          <Text style={[styles.catName, { color: cat.color }]}>{cat.label}</Text>
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: C.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  emojiBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  emojiText: {
    fontSize: 20,
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  note: {
    fontSize: 15,
    color: C.ink,
    fontWeight: "600",
  },
  expression: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  catName: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
    color: C.greenDark,
  },
});
