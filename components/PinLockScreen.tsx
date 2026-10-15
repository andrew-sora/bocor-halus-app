import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { C } from "@/constants/Colors";

type Props = {
  correctPin: string;
  onUnlock: () => void;
};

export function PinLockScreen({ correctPin, onUnlock }: Props) {
  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePressKey = (key: string) => {
    if (errorMsg) setErrorMsg(null);
    if (pin.length >= 4) return;

    const nextPin = pin + key;
    setPin(nextPin);

    if (nextPin.length === 4) {
      if (nextPin === correctPin) {
        onUnlock();
      } else {
        setErrorMsg("PIN salah, coba lagi.");
        setTimeout(() => {
          setPin("");
          setErrorMsg(null);
        }, 700);
      }
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin((p) => p.slice(0, -1));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>Bocor Halus</Text>
          <Text style={styles.instruction}>
            Masukkan 4 angka PIN untuk membuka catatan keuangan
          </Text>
        </View>

        {/* PIN Dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  isFilled && styles.dotFilled,
                  errorMsg ? styles.dotError : null,
                ]}
              />
            );
          })}
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
                    <Text
                      style={[
                        styles.keyText,
                        isBack && styles.keyBackText,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.cream,
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 32,
    maxWidth: 380,
    alignSelf: "center",
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  lockCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: C.greenSoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
  },
  lockEmoji: {
    fontSize: 30,
  },
  appName: {
    fontSize: 24,
    fontWeight: "800",
    color: C.greenDark,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  instruction: {
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.border,
  },
  dotFilled: {
    backgroundColor: C.greenDark,
    borderColor: C.greenDark,
  },
  dotError: {
    borderColor: C.danger,
    backgroundColor: C.dangerBg,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.danger,
    height: 20,
    marginBottom: 12,
  },
  keypad: {
    width: "100%",
    marginTop: 10,
    gap: 14,
  },
  keyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  keyBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyKey: {
    width: 72,
    height: 72,
  },
  keyText: {
    fontSize: 24,
    fontWeight: "700",
    color: C.ink,
  },
  keyBackText: {
    fontSize: 20,
    color: C.muted,
  },
});
