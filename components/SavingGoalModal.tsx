import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { C } from "@/constants/Colors";
import type { SavingGoal } from "@/lib/db";
import { formatRupiah } from "@/lib/format";

const EMOJI_OPTIONS = ["🐷", "👟", "✈️", "📱", "💻", "👗", "🏠", "🛡️", "🚗", "👶"];
const TARGET_PRESETS = [300000, 500000, 1000000, 2000000, 5000000];

interface SavingGoalModalProps {
  visible: boolean;
  onClose: () => void;
  goals: SavingGoal[];
  activeGoalId: string | null;
  onSelectActiveGoal: (goalId: string) => void;
  onSaveGoal: (goal: { id?: string; title: string; targetAmount: number; emoji: string }) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
  onDepositOrWithdraw: (goalId: string, amount: number) => Promise<void>;
}

export function SavingGoalModal({
  visible,
  onClose,
  goals,
  activeGoalId,
  onSelectActiveGoal,
  onSaveGoal,
  onDeleteGoal,
  onDepositOrWithdraw,
}: SavingGoalModalProps) {
  const [tab, setTab] = useState<"manage" | "create" | "custom_deposit">("manage");

  // Create Goal State
  const [title, setTitle] = useState("");
  const [targetAmountStr, setTargetAmountStr] = useState("500000");
  const [selectedEmoji, setSelectedEmoji] = useState("🐷");
  const [saving, setSaving] = useState(false);

  // Custom Deposit State
  const [customAmountStr, setCustomAmountStr] = useState("");

  const activeGoal = goals.find((g) => g.id === activeGoalId) || goals[0] || null;

  const handleCreateSubmit = async () => {
    if (!title.trim()) return;
    const cleanNum = parseInt(targetAmountStr.replace(/\D/g, ""), 10);
    if (isNaN(cleanNum) || cleanNum <= 0) return;

    setSaving(true);
    try {
      await onSaveGoal({
        title: title.trim(),
        targetAmount: cleanNum,
        emoji: selectedEmoji,
      });
      setTitle("");
      setTargetAmountStr("500000");
      setTab("manage");
    } finally {
      setSaving(false);
    }
  };

  const handleCustomDeposit = async (isWithdraw = false) => {
    if (!activeGoal) return;
    const cleanNum = parseInt(customAmountStr.replace(/\D/g, ""), 10);
    if (isNaN(cleanNum) || cleanNum <= 0) return;

    const diff = isWithdraw ? -cleanNum : cleanNum;
    await onDepositOrWithdraw(activeGoal.id, diff);
    setCustomAmountStr("");
    setTab("manage");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {tab === "create"
                ? "🎯 Buat Celengan Impian"
                : tab === "custom_deposit"
                ? "💰 Setor / Tarik Tabungan"
                : "🐷 Kelola Celengan Impian"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Bar */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, tab === "manage" && styles.tabItemActive]}
              onPress={() => setTab("manage")}
            >
              <Text style={[styles.tabText, tab === "manage" && styles.tabTextActive]}>
                Daftar ({goals.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, tab === "create" && styles.tabItemActive]}
              onPress={() => setTab("create")}
            >
              <Text style={[styles.tabText, tab === "create" && styles.tabTextActive]}>
                + Target Baru
              </Text>
            </TouchableOpacity>

            {activeGoal && (
              <TouchableOpacity
                style={[styles.tabItem, tab === "custom_deposit" && styles.tabItemActive]}
                onPress={() => setTab("custom_deposit")}
              >
                <Text style={[styles.tabText, tab === "custom_deposit" && styles.tabTextActive]}>
                  Setor/Tarik
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.scrollArea}>
            {/* TAB: MANAGE / LIST */}
            {tab === "manage" && (
              <View>
                {goals.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🐷</Text>
                    <Text style={styles.emptyText}>Belum ada target celengan.</Text>
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={() => setTab("create")}
                    >
                      <Text style={styles.primaryBtnText}>+ Buat Target Pertamamu</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.goalsList}>
                    {goals.map((g) => {
                      const isActive = g.id === activeGoalId;
                      const pct = Math.min(
                        100,
                        Math.round((g.currentAmount / Math.max(1, g.targetAmount)) * 100)
                      );
                      return (
                        <View
                          key={g.id}
                          style={[styles.goalListItem, isActive && styles.goalListItemActive]}
                        >
                          <TouchableOpacity
                            style={styles.goalListLeft}
                            onPress={() => onSelectActiveGoal(g.id)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.goalListEmoji}>{g.emoji}</Text>
                            <View style={{ flex: 1 }}>
                              <View style={styles.goalTitleRow}>
                                <Text style={styles.goalListTitle}>{g.title}</Text>
                                {isActive && (
                                  <View style={styles.activeTag}>
                                    <Text style={styles.activeTagText}>Aktif di Beranda</Text>
                                  </View>
                                )}
                              </View>
                              <Text style={styles.goalListAmount}>
                                {formatRupiah(g.currentAmount)} / {formatRupiah(g.targetAmount)} ({pct}%)
                              </Text>
                            </View>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.deleteGoalBtn}
                            onPress={() => onDeleteGoal(g.id)}
                            accessibilityLabel="Hapus target"
                          >
                            <Text style={styles.deleteGoalBtnText}>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* TAB: CREATE */}
            {tab === "create" && (
              <View style={styles.formContainer}>
                {/* Emoji Selector */}
                <Text style={styles.inputLabel}>Pilih Ikon Target:</Text>
                <View style={styles.emojiRow}>
                  {EMOJI_OPTIONS.map((em) => (
                    <TouchableOpacity
                      key={em}
                      style={[
                        styles.emojiOption,
                        selectedEmoji === em && styles.emojiOptionSelected,
                      ]}
                      onPress={() => setSelectedEmoji(em)}
                    >
                      <Text style={styles.emojiOptionText}>{em}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Title Input */}
                <Text style={styles.inputLabel}>Nama Target Tabungan:</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Misal: Beli Sepatu, Liburan, Laptop Baru"
                  placeholderTextColor={C.muted}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={40}
                />

                {/* Target Amount */}
                <Text style={styles.inputLabel}>Target Dana Terkumpul (Rp):</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={targetAmountStr}
                  onChangeText={(val) => setTargetAmountStr(val.replace(/\D/g, ""))}
                  placeholder="500000"
                />

                {/* Presets */}
                <View style={styles.presetRow}>
                  {TARGET_PRESETS.map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      style={styles.presetChip}
                      onPress={() => setTargetAmountStr(String(amt))}
                    >
                      <Text style={styles.presetChipText}>{formatRupiah(amt)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, saving && styles.btnDisabled]}
                  onPress={handleCreateSubmit}
                  disabled={saving || !title.trim()}
                >
                  <Text style={styles.primaryBtnText}>
                    {saving ? "Menyimpan..." : "Simpan Celengan Baru"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* TAB: CUSTOM DEPOSIT */}
            {tab === "custom_deposit" && activeGoal && (
              <View style={styles.formContainer}>
                <Text style={styles.activeGoalSub}>
                  Celengan: {activeGoal.emoji} {activeGoal.title}
                </Text>
                <Text style={styles.activeGoalBal}>
                  Saldo Celengan Saat Ini: {formatRupiah(activeGoal.currentAmount)}
                </Text>

                <Text style={[styles.inputLabel, { marginTop: 12 }]}>
                  Masukkan Nominal (Rp):
                </Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="Misal: 50000"
                  placeholderTextColor={C.muted}
                  value={customAmountStr}
                  onChangeText={(val) => setCustomAmountStr(val.replace(/\D/g, ""))}
                />

                <View style={styles.actionBtnRow}>
                  <TouchableOpacity
                    style={[styles.primaryBtn, { flex: 1 }]}
                    onPress={() => handleCustomDeposit(false)}
                    disabled={!customAmountStr}
                  >
                    <Text style={styles.primaryBtnText}>+ Setor Tabungan</Text>
                  </TouchableOpacity>

                  {activeGoal.currentAmount > 0 && (
                    <TouchableOpacity
                      style={[styles.secondaryBtn, { flex: 1 }]}
                      onPress={() => handleCustomDeposit(true)}
                      disabled={!customAmountStr}
                    >
                      <Text style={styles.secondaryBtnText}>- Tarik Sebagian</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: C.white,
    borderRadius: 24,
    width: "100%",
    maxWidth: 420,
    maxHeight: "85%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.border,
    ...Platform.select({
      web: {
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      },
      default: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.ink,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: C.muted,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.cream,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: C.greenDark,
    backgroundColor: C.white,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.muted,
  },
  tabTextActive: {
    color: C.greenDark,
  },
  scrollArea: {
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: C.muted,
    marginBottom: 16,
  },
  goalsList: {
    gap: 10,
  },
  goalListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.cream,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  goalListItemActive: {
    borderColor: C.greenLight,
    backgroundColor: "#F0FDF4",
  },
  goalListLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  goalListEmoji: {
    fontSize: 24,
  },
  goalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  goalListTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: C.ink,
  },
  activeTag: {
    backgroundColor: C.greenSoft,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  activeTagText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: C.greenDark,
  },
  goalListAmount: {
    fontSize: 12,
    color: C.inkLight,
    marginTop: 2,
  },
  deleteGoalBtn: {
    padding: 8,
  },
  deleteGoalBtnText: {
    fontSize: 16,
  },
  formContainer: {
    gap: 12,
    paddingBottom: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.inkLight,
  },
  emojiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  emojiOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.cream,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  emojiOptionSelected: {
    borderColor: C.greenDark,
    backgroundColor: C.greenSoft,
  },
  emojiOptionText: {
    fontSize: 18,
  },
  textInput: {
    backgroundColor: C.cream,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: C.ink,
    borderWidth: 1,
    borderColor: C.border,
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  presetChip: {
    backgroundColor: C.cream,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.inkLight,
  },
  primaryBtn: {
    backgroundColor: C.greenDark,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.white,
  },
  secondaryBtn: {
    backgroundColor: C.cream,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.danger,
  },
  actionBtnRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  activeGoalSub: {
    fontSize: 14,
    fontWeight: "800",
    color: C.ink,
  },
  activeGoalBal: {
    fontSize: 12.5,
    color: C.greenDark,
    fontWeight: "700",
    marginTop: 2,
  },
});
