import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { C } from "@/constants/Colors";
import type { SavingGoal } from "@/lib/db";
import { formatRupiah } from "@/lib/format";

export interface SavingGoalProgress {
  percentage: number;
  remaining: number;
  isCompleted: boolean;
}

export function calculateSavingGoalProgress(
  currentAmount: number,
  targetAmount: number
): SavingGoalProgress {
  const safeTarget = Math.max(1, targetAmount);
  const percentage = Math.min(100, Math.round((currentAmount / safeTarget) * 100));
  const remaining = Math.max(0, targetAmount - currentAmount);
  const isCompleted = currentAmount >= targetAmount;

  return { percentage, remaining, isCompleted };
}

interface SavingGoalCardProps {
  goal: SavingGoal | null;
  onQuickDeposit: (amount: number) => void;
  onOpenManageModal: () => void;
  onCreateNewGoal: () => void;
}

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000];

export function SavingGoalCard({
  goal,
  onQuickDeposit,
  onOpenManageModal,
  onCreateNewGoal,
}: SavingGoalCardProps) {
  const progress = useMemo(() => {
    if (!goal) return null;
    return calculateSavingGoalProgress(goal.currentAmount, goal.targetAmount);
  }, [goal]);

  if (!goal) {
    return (
      <View style={styles.card}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyIconText}>🐷</Text>
          </View>
          <View style={styles.emptyTextCol}>
            <Text style={styles.emptyTitle}>Celengan Target Impian</Text>
            <Text style={styles.emptySubtitle}>
              Berhasil tahan jajan bocor halus? Alihkan uangnya ke target impianmu!
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.createBtn}
          onPress={onCreateNewGoal}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Buat target celengan baru"
        >
          <Text style={styles.createBtnText}>+ Buat Target Celengan Sekarang</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header Celengan */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.emojiCircle}>
            <Text style={styles.emojiText}>{goal.emoji || "🐷"}</Text>
          </View>
          <View>
            <Text style={styles.goalTitle} numberOfLines={1}>
              {goal.title}
            </Text>
            <Text style={styles.goalSubtitle}>Celengan Target Impian</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.manageBtn}
          onPress={onOpenManageModal}
          accessibilityRole="button"
          accessibilityLabel="Kelola celengan"
        >
          <Text style={styles.manageBtnText}>Kelola ⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Progress & Nominal */}
      <View style={styles.amountBox}>
        <View style={styles.amountRow}>
          <Text style={styles.currentAmountText}>{formatRupiah(goal.currentAmount)}</Text>
          <Text style={styles.targetAmountText}>/ {formatRupiah(goal.targetAmount)}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.max(progress?.percentage ?? 0, 3)}%` },
              progress?.isCompleted && styles.progressBarFillDone,
            ]}
          />
        </View>

        {/* Status Text & Persentase */}
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>
            {progress?.isCompleted
              ? "🎉 Target Tercapai! Selamat kamu berhasil!"
              : `Kurang ${formatRupiah(progress?.remaining ?? 0)} lagi`}
          </Text>
          <Text style={[styles.percentBadge, progress?.isCompleted && styles.percentBadgeDone]}>
            {progress?.percentage}%
          </Text>
        </View>
      </View>

      {/* Quick Deposit Section */}
      <View style={styles.depositSection}>
        <Text style={styles.depositSectionTitle}>
          💡 Alihkan uang jajan hari ini ke celengan:
        </Text>
        <View style={styles.quickBtnRow}>
          {QUICK_AMOUNTS.map((amt) => (
            <TouchableOpacity
              key={amt}
              style={styles.quickChip}
              onPress={() => onQuickDeposit(amt)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Tabung cepat ${formatRupiah(amt)}`}
            >
              <Text style={styles.quickChipText}>
                +{amt >= 1000 ? `${amt / 1000}rb` : amt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
    ...Platform.select({
      web: {
        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
      },
      default: {
        elevation: 2,
        shadowColor: C.ink,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
    }),
  },
  emptyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  emptyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconText: {
    fontSize: 22,
  },
  emptyTextCol: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: C.ink,
  },
  emptySubtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  createBtn: {
    backgroundColor: C.greenDark,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  createBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.white,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  emojiCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.cream,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiText: {
    fontSize: 20,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.2,
  },
  goalSubtitle: {
    fontSize: 11,
    color: C.muted,
    marginTop: 1,
  },
  manageBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: C.cream,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  manageBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.inkLight,
  },
  amountBox: {
    backgroundColor: C.cream,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 8,
  },
  currentAmountText: {
    fontSize: 19,
    fontWeight: "900",
    color: C.greenDark,
    fontVariant: ["tabular-nums"],
  },
  targetAmountText: {
    fontSize: 13,
    fontWeight: "600",
    color: C.muted,
    fontVariant: ["tabular-nums"],
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: C.mutedBg,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: C.greenLight,
    borderRadius: 5,
  },
  progressBarFillDone: {
    backgroundColor: C.greenDark,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusText: {
    fontSize: 11.5,
    color: C.inkLight,
    fontWeight: "600",
    flex: 1,
    paddingRight: 6,
  },
  percentBadge: {
    fontSize: 12,
    fontWeight: "800",
    color: C.greenDark,
    fontVariant: ["tabular-nums"],
  },
  percentBadgeDone: {
    color: C.greenDark,
  },
  depositSection: {
    paddingTop: 4,
  },
  depositSectionTitle: {
    fontSize: 11.5,
    color: C.muted,
    fontWeight: "600",
    marginBottom: 8,
  },
  quickBtnRow: {
    flexDirection: "row",
    gap: 8,
  },
  quickChip: {
    flex: 1,
    backgroundColor: C.greenSoft,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    cursor: "pointer" as any,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: C.greenDark,
    fontVariant: ["tabular-nums"],
  },
});
