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
  onClose: () => void;
  onAdd: (amount: number) => Promise<void> | void;
  monthName: string;
  currentBudget: number;
};

const PRESETS = [200000, 500000, 1000000, 2000000];

export function AddExtraBudgetModal({
  visible,
  onClose,
  onAdd,
  monthName,
  currentBudget,
}: Props) {
  const [val, setVal] = useState("");

  const numericVal = parseInt(val.replace(/\D/g, ""), 10) || 0;

  const handleSelectPreset = (amount: number) => {
    setVal(amount.toString());
  };

  const handleTextChange = (text: string) => {
    setVal(text.replace(/\D/g, ""));
  };

  const handleConfirm = () => {
    if (numericVal <= 0) return;
    onAdd(numericVal);
    setVal("");
    onClose();
  };

  const inputRef = React.useRef<TextInput>(null);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoid}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Catat Pemasukan / Uang Masuk</Text>
            <Text style={styles.subtitle}>
              Dapat gaji, transferan, bonus, atau pemasukan tambahan di bulan {monthName}? Masukkan di sini agar sisa uang belanja Anda otomatis bertambah.
            </Text>

            {/* Info Jatah Saat Ini */}
            <View style={styles.currentInfoBox}>
              <Text style={styles.currentLabel}>Total Pemasukan / Jatah Saat Ini:</Text>
              <Text style={styles.currentVal}>{formatRupiah(currentBudget)}</Text>
            </View>

            {/* Input Nominal Tambahan */}
            <TouchableOpacity
              style={styles.inputContainer}
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
            >
              <Text style={styles.prefix}>+ Rp</Text>
              <TextInput
                ref={inputRef}
                style={styles.input}
                keyboardType="numeric"
                value={val}
                onChangeText={handleTextChange}
                placeholder="500.000"
                placeholderTextColor={C.muted}
                autoFocus
              />
            </TouchableOpacity>

            {/* Presets */}
            <View style={styles.presetRow}>
              {PRESETS.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={styles.presetChip}
                  onPress={() => handleSelectPreset(amt)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetChipText}>+{amt / 1000}rb</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                numericVal <= 0 && styles.confirmBtnDisabled,
              ]}
              onPress={handleConfirm}
              disabled={numericVal <= 0}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmBtnText}>
                {numericVal > 0
                  ? `Tambahkan ${formatRupiah(numericVal)}`
                  : "Masukkan Nominal"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Batal</Text>
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
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: C.ink,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  currentInfoBox: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.cream,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  currentLabel: {
    fontSize: 12,
    color: C.muted,
    fontWeight: "600",
  },
  currentVal: {
    fontSize: 14,
    fontWeight: "800",
    color: C.greenDark,
  },
  inputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.greenDark,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  prefix: {
    fontSize: 16,
    fontWeight: "700",
    color: C.greenDark,
    marginRight: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: "800",
    color: C.ink,
  },
  presetRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 6,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: C.cream,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.inkLight,
  },
  confirmBtn: {
    width: "100%",
    backgroundColor: C.greenDark,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  confirmBtnDisabled: {
    backgroundColor: C.mutedBg,
  },
  confirmBtnText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "700",
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    fontSize: 13,
    color: C.muted,
    fontWeight: "600",
  },
});
