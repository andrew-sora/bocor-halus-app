import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { C } from "@/constants/Colors";
import { formatRupiah } from "@/lib/format";

type Props = {
  visible: boolean;
  onSave: (budget: number) => Promise<void> | void;
  onDismiss?: () => void;
};

const PRESET_BUDGETS = [
  { label: "2 Juta", value: 2000000 },
  { label: "3 Juta", value: 3000000 },
  { label: "5 Juta", value: 5000000 },
  { label: "7.5 Juta", value: 7500000 },
];

export function BudgetOnboardingModal({ visible, onSave, onDismiss }: Props) {
  const [budgetVal, setBudgetVal] = useState("3000000");

  const numericValue = parseInt(budgetVal.replace(/\D/g, ""), 10) || 0;

  const handleSelectPreset = (amount: number) => {
    setBudgetVal(amount.toString());
  };

  const handleTextChange = (text: string) => {
    const raw = text.replace(/\D/g, "");
    setBudgetVal(raw);
  };

  const handleConfirm = () => {
    const finalAmount = numericValue > 0 ? numericValue : 3000000;
    onSave(finalAmount);
  };

  const handleUseDefault = () => {
    if (onDismiss) {
      onDismiss();
    } else {
      onSave(3000000);
    }
  };

  const inputRef = React.useRef<TextInput>(null);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoid}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Tentukan Anggaran Belanja</Text>
            <Text style={styles.subtitle}>
              Atur perkiraan jatah belanja bulanan yang ingin Anda pantau.
            </Text>

            {/* Display Formatted Amount */}
            <View style={styles.displayBox}>
              <Text style={styles.displayLabel}>Target Jatah Bulanan</Text>
              <Text style={styles.displayAmount}>
                {formatRupiah(numericValue)}
              </Text>
            </View>

            {/* Input Field */}
            <TouchableOpacity
              style={styles.inputContainer}
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
            >
              <Text style={styles.rpPrefix}>Rp</Text>
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                keyboardType="numeric"
                value={budgetVal}
                onChangeText={handleTextChange}
                placeholder="3000000"
                placeholderTextColor={C.muted}
                selectTextOnFocus
              />
            </TouchableOpacity>

            {/* Preset Chips */}
            <Text style={styles.presetHeading}>Pilihan Cepat:</Text>
            <View style={styles.presetRow}>
              {PRESET_BUDGETS.map((preset) => {
                const isSelected = numericValue === preset.value;
                return (
                  <TouchableOpacity
                    key={preset.value}
                    style={[
                      styles.presetChip,
                      isSelected && styles.presetChipActive,
                    ]}
                    onPress={() => handleSelectPreset(preset.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        isSelected && styles.presetChipTextActive,
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.note}>
              Angka ini dapat diubah sewaktu-waktu melalui menu Pengaturan.
            </Text>

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>Simpan & Mulai Catat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.defaultBtn}
              onPress={handleUseDefault}
              activeOpacity={0.7}
            >
              <Text style={styles.defaultBtnText}>Gunakan Rp 3.000.000 Dulu</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  keyboardAvoid: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  card: {
    width: "100%",
    backgroundColor: C.white,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: C.ink,
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  displayBox: {
    width: "100%",
    backgroundColor: C.cream,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  displayLabel: {
    fontSize: 11,
    color: C.muted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  displayAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: C.greenDark,
    letterSpacing: -0.5,
  },
  inputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  rpPrefix: {
    fontSize: 15,
    fontWeight: "700",
    color: C.muted,
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "700",
    color: C.ink,
  },
  presetHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: C.muted,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 6,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: C.cream,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  presetChipActive: {
    backgroundColor: C.greenDark,
    borderColor: C.greenDark,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.inkLight,
  },
  presetChipTextActive: {
    color: C.white,
  },
  note: {
    fontSize: 11,
    color: C.muted,
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 16,
  },
  saveBtn: {
    width: "100%",
    backgroundColor: C.greenDark,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  saveBtnText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  defaultBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  defaultBtnText: {
    fontSize: 12,
    color: C.muted,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
