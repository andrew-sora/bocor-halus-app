import { Link, Stack } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { C } from "@/constants/Colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Halaman Tidak Ditemukan" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Halaman ini tidak ada.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Kembali ke Beranda</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: C.cream,
  },
  title: { fontSize: 18, fontWeight: "600", color: C.ink },
  link: { marginTop: 20 },
  linkText: { fontSize: 16, color: C.greenDark, fontWeight: "600" },
});
