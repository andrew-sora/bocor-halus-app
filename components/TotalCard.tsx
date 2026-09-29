import { View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { MoneyText } from "./MoneyText";
import { strings } from "@/constants/strings";
import { namaBulan } from "@/lib/date";
import { C } from "@/constants/Colors";
import { formatRupiah } from "@/lib/format";

type Props = {
  monthlyTotal: number;
  yearlyTotal: number;
  month: number;
  year: number;
  budgetLimit?: number;
  microTotal?: number;
  microCount?: number;
};

export function TotalCard({
  monthlyTotal,
  yearlyTotal,
  month,
  year,
  budgetLimit = 3000000,
  microTotal = 0,
  microCount = 0,
}: Props) {
  const sisaJatah = Math.max(0, budgetLimit - monthlyTotal);
  const ratio = Math.min(1, monthlyTotal / Math.max(1, budgetLimit));
  const percentage = Math.round(ratio * 100);

  let statusBadgeBg = "rgba(209, 250, 229, 0.25)";
  let statusBadgeText = C.greenSoft;
  let statusMsg = strings.budgetOptimal;

  if (monthlyTotal > budgetLimit) {
    statusBadgeBg = "rgba(254, 226, 226, 0.3)";
    statusBadgeText = "#FECDD3";
    statusMsg = strings.budgetOver;
  } else if (ratio > 0.8) {
    statusBadgeBg = "rgba(254, 243, 199, 0.3)";
    statusBadgeText = "#FDE68A";
    statusMsg = strings.budgetMepet;
  }

  const handleShareWhatsApp = () => {
    const text = `Halo! 👋\nBerikut rekap pengeluaran bulanan (Bocor Halus) bulan ${namaBulan(month)} ${year}:\n\n💸 Total Pengeluaran: ${formatRupiah(monthlyTotal)}\n✨ Sisa Jatah Bulanan: ${formatRupiah(sisaJatah)} (${percentage}% terpakai)\n💡 Transaksi Kecil (< Rp 50k): ${microCount} transaksi\n\nDicatat rapi dengan Bocor Halus App ✨`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.label}>{strings.totalBulanIni}</Text>
            <Text style={styles.period}>
              {namaBulan(month)} {year}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusBadgeBg }]}>
            <Text style={[styles.statusText, { color: statusBadgeText }]}>{percentage}% Terpakai</Text>
          </View>
        </View>

        <MoneyText amount={monthlyTotal} size="xl" color={C.white} style={styles.amount} />

        {/* Progress Bar Jatah */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${percentage}%`,
                backgroundColor: ratio > 1 ? C.danger : ratio > 0.8 ? C.warning : C.greenLight,
              },
            ]}
          />
        </View>

        <View style={styles.budgetRow}>
          <Text style={styles.budgetSublabel}>{strings.sisaJatah}:</Text>
          <Text style={styles.budgetVal}>{formatRupiah(sisaJatah)}</Text>
        </View>

        <Text style={styles.statusNote}>{statusMsg}</Text>

        {/* Action Share WA General */}
        <TouchableOpacity
          style={styles.shareWaBtn}
          onPress={handleShareWhatsApp}
          activeOpacity={0.8}
        >
          <Text style={styles.shareWaBtnText}>📱  Bagikan Rekap Bulanan ke WhatsApp</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.yearRow}>
          <Text style={styles.yearLabel}>{strings.totalTahunIni}</Text>
          <MoneyText amount={yearlyTotal} size="sm" color={C.white} />
        </View>
      </View>

      {/* General Encouragement Chip */}
      {ratio <= 0.8 && (
        <View style={styles.ldrEncouragementChip}>
          <Text style={styles.ldrEmoji}>🌱</Text>
          <Text style={styles.ldrText}>
            Kerja bagus! Pengeluaran bulananmu terkendali dengan baik. Tetap konsisten menjaga keuanganmu tetap sehat ✨
          </Text>
        </View>
      )}

      {/* Bocor Halus Micro-Insight Chip */}
      {microCount > 0 && (
        <View style={styles.insightChip}>
          <Text style={styles.insightEmoji}>💡</Text>
          <Text style={styles.insightText}>
            {strings.bocorHalusInsightText(formatRupiah(microTotal), microCount)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  card: {
    backgroundColor: C.greenDark,
    borderRadius: 24,
    padding: 22,
    shadowColor: C.shadowStrong,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  label: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  period: {
    fontSize: 15,
    color: "rgba(255,255,255,0.95)",
    fontWeight: "700",
    marginTop: 2,
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  amount: {
    marginBottom: 12,
  },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 99,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 99,
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  budgetSublabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  budgetVal: {
    fontSize: 14,
    color: C.white,
    fontWeight: "700",
  },
  statusNote: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
    marginBottom: 12,
  },
  shareWaBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  shareWaBtnText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginBottom: 10,
  },
  yearRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  yearLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
  },
  ldrEncouragementChip: {
    flexDirection: "row",
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    alignItems: "center",
  },
  ldrEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  ldrText: {
    flex: 1,
    fontSize: 12,
    color: "#065F46",
    lineHeight: 17,
    fontWeight: "600",
  },
  insightChip: {
    flexDirection: "row",
    backgroundColor: C.warningBg,
    borderRadius: 16,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#FCD34D",
    alignItems: "center",
  },
  insightEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  insightText: {
    flex: 1,
    fontSize: 12,
    color: "#78350F",
    lineHeight: 17,
    fontWeight: "500",
  },
});
