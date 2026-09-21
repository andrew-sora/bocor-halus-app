import { Text, type TextProps, StyleSheet } from "react-native";
import { formatRupiah } from "@/lib/format";
import { C } from "@/constants/Colors";

type Size = "sm" | "md" | "lg" | "xl";

type Props = TextProps & {
  amount: number;
  size?: Size;
  color?: string;
};

export function MoneyText({ amount, size = "md", color, style, ...props }: Props) {
  return (
    <Text
      style={[styles.base, styles[size], color ? { color } : null, style]}
      {...props}
    >
      {formatRupiah(amount)}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontWeight: "700",
    color: C.ink,
  },
  sm: { fontSize: 16 },
  md: { fontSize: 20 },
  lg: { fontSize: 26 },
  xl: { fontSize: 32 },
});
