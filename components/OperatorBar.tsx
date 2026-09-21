import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { C } from "@/constants/Colors";

type Props = {
  onInsert: (char: string) => void;
  onBackspace: () => void;
};

type OpButton = {
  label: string;
  char: string;
};

const OPERATORS: OpButton[] = [
  { label: "+", char: "+" },
  { label: "−", char: "-" },
  { label: "×", char: "*" },
  { label: "÷", char: "/" },
  { label: "(", char: "(" },
  { label: ")", char: ")" },
];

export function OperatorBar({ onInsert, onBackspace }: Props) {
  return (
    <View style={styles.container}>
      {OPERATORS.map((op) => (
        <TouchableOpacity
          key={op.char}
          style={styles.btn}
          onPress={() => onInsert(op.char)}
          activeOpacity={0.7}
          accessibilityLabel={op.label}
          accessibilityRole="button"
        >
          <Text style={styles.btnText}>{op.label}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.btn, styles.backspaceBtn]}
        onPress={onBackspace}
        activeOpacity={0.7}
        accessibilityLabel="Hapus karakter"
        accessibilityRole="button"
      >
        <Text style={[styles.btnText, styles.backspaceText]}>⌫</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: C.mutedBg,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  btn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    borderRadius: 8,
    marginHorizontal: 2,
    backgroundColor: C.white,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  btnText: {
    fontSize: 20,
    fontWeight: "600",
    color: C.ink,
  },
  backspaceBtn: {
    backgroundColor: C.mutedBg,
    elevation: 0,
    shadowOpacity: 0,
  },
  backspaceText: {
    color: C.muted,
    fontSize: 22,
  },
});
