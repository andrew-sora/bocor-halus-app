import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { C } from "@/constants/Colors";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSavePin: (pin: string | null) => Promise<void> | void;
  currentPin: string | null;
};

export function SetPinModal({
  visible,
  onClose,
  onSavePin,
  currentPin,
}: Props) {
  const [step, setStep] = useState<"new" | "confirm">("new");
  const [firstPin, setFirstPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetState = () => {
    setStep("new");
    setFirstPin("");
    setConfirmPin("");
    setErrorMsg(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handlePressKey = (key: string) => {
    if (errorMsg) setErrorMsg(null);

    if (step === "new") {
      if (firstPin.length >= 4) return;
      const next = firstPin + key;
      setFirstPin(next);
      if (next.length === 4) {
        setTimeout(() => {
          setStep("confirm");
        }, 200);
      }
    } else {
      if (confirmPin.length >= 4) return;
      const next = confirmPin + key;
      setConfirmPin(next);
      if (next.length === 4) {
        if (next === firstPin) {
          onSavePin(next);
          handleClose();
        } else {
          setErrorMsg("PIN konfirmasi tidak cocok. Coba lagi.");
          setTimeout(() => {
            setConfirmPin("");
            setErrorMsg(null);
          }, 700);
        }
      }
    }
  };

  const handleBackspace = () => {
    if (step === "new") {
      if (firstPin.length > 0) setFirstPin((p) => p.slice(0, -1));
    } else {
      if (confirmPin.length > 0) {
        setConfirmPin((p) => p.slice(0, -1));
      } else {
        setStep("new");
        setFirstPin("");
      }
    }
  };

  const handleRemovePin = () => {
    Alert.alert(
      "Nonaktifkan Kunci PIN",
      "Apakah Bunda yakin ingin menghapus kunci PIN aplikasi ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus PIN",
          style: "destructive",
          onPress: () => {
            onSavePin(null);
            handleClose();
          },
        },
      ]
    );
  };

  const activePin = step === "new" ? firstPin : confirmPin;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {step === "new"
              ? currentPin
                ? "Ubah Kunci PIN"
                : "Pasang Kunci PIN"
              : "Konfirmasi PIN"}
          </Text>
          <Text style={styles.subtitle}>
            {step === "new"
              ? "Masukkan 4 angka rahasia untuk melindungi catatan keuangan"
              : "Masukkan sekali lagi PIN yang sama"}
          </Text>

          {/* Dots */}
          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map((idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  activePin.length > idx && styles.dotFilled,
                  errorMsg ? styles.dotError : null,
                ]}
              />
            ))}
          </View>

          {errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : (
            <View style={{ height: 20 }} />
          )}

          {/* Keypad */}
          <View style={styles.keypad}>
            {[
              ["1", "2", "3"],
              ["4", "5", "6"],
              ["7", "8", "9"],
              ["", "0", "⌫"],
            ].map((row, rIdx) => (
              <View key={rIdx} style={styles.keyRow}>
                {row.map((item, cIdx) => {
                  if (item === "") {
                    return <View key={cIdx} style={styles.emptyKey} />;
                  }
                  const isBack = item === "⌫";
                  return (
                    <TouchableOpacity
                      key={cIdx}
                      style={styles.keyBtn}
                      onPress={() => (isBack ? handleBackspace() : handlePressKey(item))}
                      activeOpacity={0.65}
                    >
                      <Text style={[styles.keyText, isBack && styles.keyBackText]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.footerRow}>
            <TouchableOpacity onPress={handleClose} style={styles.actionBtn}>
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>

            {Boolean(currentPin) && (
              <TouchableOpacity onPress={handleRemovePin} style={styles.actionBtn}>
                <Text style={styles.deletePinText}>Nonaktifkan PIN</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
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
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: C.greenDark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: C.muted,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
    lineHeight: 18,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 10,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.border,
  },
  dotFilled: {
    backgroundColor: C.greenDark,
    borderColor: C.greenDark,
  },
  dotError: {
    backgroundColor: C.dangerBg,
    borderColor: C.danger,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.danger,
    height: 20,
    marginBottom: 6,
  },
  keypad: {
    width: "100%",
    gap: 10,
    marginBottom: 14,
  },
  keyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  keyBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.cream,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  emptyKey: {
    width: 64,
    height: 64,
  },
  keyText: {
    fontSize: 22,
    fontWeight: "700",
    color: C.ink,
  },
  keyBackText: {
    fontSize: 18,
    color: C.muted,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cancelText: {
    fontSize: 13,
    color: C.muted,
    fontWeight: "600",
  },
  deletePinText: {
    fontSize: 13,
    color: C.danger,
    fontWeight: "700",
  },
});
