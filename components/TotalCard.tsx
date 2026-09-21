import { View, Text, StyleSheet } from "react-native";
import { MoneyText } from "./MoneyText";
import { strings } from "@/constants/strings";
import { namaBulan } from "@/lib/date";
import { C } from "@/constants/Colors";

type Props = {
  monthlyTotal: number;
  yearlyTotal: number;
  month: number;
  year: number;
};

export function TotalCard({ monthlyTotal, yearlyTotal, month, year }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{strings.totalBulanIni}</Text>
      <Text style={styles.period}>
        {namaBulan(month)} {year}
      </Text>
      <MoneyText amount={monthlyTotal} size="xl" color={C.white} style={styles.amount} />
      <View style={styles.divider} />
      <View style={styles.yearRow}>
        <Text style={styles.yearLabel}>{strings.totalTahunIni}</Text>
        <MoneyText amount={yearlyTotal} size="sm" color={C.white} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.greenDark,
    borderRadius: 20,
    padding: 24,
    margin: 16,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  label: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  period: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
    marginBottom: 8,
  },
  amount: {
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 12,
  },
  yearRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  yearLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
  },
});
