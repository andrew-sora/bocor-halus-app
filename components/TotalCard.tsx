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
  onPressMicroInsight?: () => void;
  onPressAddExtraBudget?: () => void;
  extraBudget?: number;
};

export function calculateBudgetStatus(monthlyTotal: number, budgetLimit: number = 3000000) {
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

  return { sisaJatah, ratio, percentage, statusBadgeBg, statusBadgeText, statusMsg };
}

export function TotalCard({
  monthlyTotal,
  yearlyTotal,
  month,
  year,
  budgetLimit = 3000000,
  microTotal = 0,
  microCount = 0,
  onPressMicroInsight,
  onPressAddExtraBudget,
  extraBudget = 0,
}: Props) {
  const { sisaJatah, ratio, percentage, statusBadgeBg, statusBadgeText, statusMsg } =
    calculateBudgetStatus(monthlyTotal, budgetLimit);

  const handleShareWhatsApp = () => {
    const text = `Rekap Pengeluaran ${namaBulan(month)} ${year}\n\nTotal: ${formatRupiah(monthlyTotal)}\nSisa Jatah: ${formatRupiah(sisaJatah)} (${percentage}% terpakai)\nTransaksi Kecil (< Rp 50k): ${microCount} transaksi\n\nDicatat via Bocor Halus App`;
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
          <View>
            <Text style={styles.budgetSublabel}>Sisa Jatah Belanja:</Text>
            {extraBudget > 0 && (
              <Text style={styles.extraBudgetNote}>
                +{formatRupiah(extraBudget)} uang masuk
              </Text>
            )}
          </View>
          <View style={styles.budgetRightRow}>
            <Text style={styles.budgetVal}>{formatRupiah(sisaJatah)}</Text>
            {Boolean(onPressAddExtraBudget) && (
              <TouchableOpacity
                style={styles.addExtraBtn}
                onPress={onPressAddExtraBudget}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Catat uang masuk"
              >
                <Text style={styles.addExtraBtnText}>+ Uang Masuk</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.statusNote}>{statusMsg}</Text>

        {/* Action Share WA */}
        <TouchableOpacity
          style={styles.shareWaBtn}
          onPress={handleShareWhatsApp}
          activeOpacity={0.8}
        >
          <Text style={styles.shareWaBtnText}>Bagikan Ringkasan ke WhatsApp</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.yearRow}>
          <Text style={styles.yearLabel}>{strings.totalTahunIni}</Text>
          <MoneyText amount={yearlyTotal} size="sm" color={C.white} />
        </View>
      </View>

      {/* Encouragement Banner */}
      {ratio <= 0.8 && (
        <View style={styles.encouragementChip}>
          <Text style={styles.encouragementText}>
            Pengeluaran bulan ini terkendali dengan baik. Tetap konsisten menjaga catatan keuangan Anda.
          </Text>
        </View>
      )}

      {/* Bocor Halus Micro-Insight Chip */}
      {microCount > 0 && (
        <TouchableOpacity
          style={styles.insightChip}
          onPress={onPressMicroInsight}
          activeOpacity={onPressMicroInsight ? 0.75 : 1}
          disabled={!onPressMicroInsight}
          accessibilityRole="button"
          accessibilityLabel="Lihat rincian transaksi bocor halus"
        >
          <View style={styles.insightRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.insightText}>
                {strings.bocorHalusInsightText(formatRupiah(microTotal), microCount)}
              </Text>
            </View>
            {Boolean(onPressMicroInsight) && (
              <View style={styles.insightCtaBadge}>
                <Text style={styles.insightCtaText}>Rincian ›</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
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
    fontWeight: "600",
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
  encouragementChip: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  encouragementText: {
    fontSize: 13,
    color: "#166534",
    lineHeight: 18,
    fontWeight: "500",
  },
  insightChip: {
    backgroundColor: C.warningBg,
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  insightText: {
    fontSize: 13,
    color: "#78350F",
    lineHeight: 18,
    fontWeight: "500",
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  insightCtaBadge: {
    backgroundColor: "rgba(120, 53, 15, 0.12)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  insightCtaText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#78350F",
  },
  extraBudgetNote: {
    fontSize: 11,
    color: C.greenSoft,
    fontWeight: "600",
    marginTop: 2,
  },
  budgetRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addExtraBtn: {
    backgroundColor: "rgba(209, 250, 229, 0.25)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(209, 250, 229, 0.5)",
  },
  addExtraBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.greenSoft,
  },
});
