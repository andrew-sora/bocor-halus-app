import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { exportBackup, importBackup } from "@/lib/backup";
import { strings } from "@/constants/strings";
import { C } from "@/constants/Colors";

export default function PengaturanScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<"export" | "import" | null>(null);

  const handleExport = async () => {
    setLoading("export");
    try {
      await exportBackup();
    } catch (err) {
      Alert.alert("Gagal", String(err));
    } finally {
      setLoading(null);
    }
  };

  const handleImport = () => {
    Alert.alert(
      strings.pulihkanData,
      "Pilih cara menggabungkan data:",
      [
        { text: strings.batal, style: "cancel" },
        {
          text: strings.gabungkanData,
          onPress: () => doImport("merge"),
        },
        {
          text: strings.gantiSemuaData,
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Konfirmasi",
              strings.gantiKonfirmasi,
              [
                { text: strings.batal, style: "cancel" },
                {
                  text: "Lanjutkan",
                  style: "destructive",
                  onPress: () => doImport("replace"),
                },
              ]
            );
          },
        },
      ]
    );
  };

  const doImport = async (mode: "replace" | "merge") => {
    setLoading("import");
    try {
      const result = await importBackup(mode);
      if (result === null) return; // user batal
      Alert.alert("Berhasil", strings.importBerhasil(result.added, result.skipped));
    } catch (err) {
      Alert.alert("Gagal", String(err));
    } finally {
      setLoading(null);
    }
  };

  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
    >
      {/* Bagian Cadangan */}
      <Text style={styles.sectionTitle}>Data & Cadangan</Text>
      <View style={styles.card}>
        <Text style={styles.infoText}>{strings.bantuanBackup}</Text>
      </View>

      <TouchableOpacity
        style={[styles.btn, styles.btnPrimary]}
        onPress={handleExport}
        disabled={loading !== null}
        accessibilityRole="button"
      >
        {loading === "export" ? (
          <ActivityIndicator color={C.white} />
        ) : (
          <Text style={styles.btnPrimaryText}>{strings.cadangkanData}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.btnSecondary]}
        onPress={handleImport}
        disabled={loading !== null}
        accessibilityRole="button"
      >
        {loading === "import" ? (
          <ActivityIndicator color={C.greenDark} />
        ) : (
          <Text style={styles.btnSecondaryText}>{strings.pulihkanData}</Text>
        )}
      </TouchableOpacity>

      {/* Tentang */}
      <Text style={[styles.sectionTitle, { marginTop: 32 }]}>
        {strings.tentang}
      </Text>
      <View style={styles.card}>
        <Text style={styles.appName}>Bocor Halus</Text>
        <Text style={styles.version}>Versi {version}</Text>
        <Text style={styles.infoText}>
          Aplikasi pencatat pengeluaran pribadi. Seluruh data hanya tersimpan di
          perangkat Anda — aman, privat, dan bekerja tanpa internet.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  content: { padding: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  infoText: {
    fontSize: 15,
    color: C.muted,
    lineHeight: 22,
  },
  appName: {
    fontSize: 20,
    fontWeight: "700",
    color: C.ink,
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: C.muted,
    marginBottom: 10,
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 10,
    minHeight: 54,
    justifyContent: "center",
  },
  btnPrimary: {
    backgroundColor: C.greenDark,
  },
  btnSecondary: {
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.greenDark,
  },
  btnPrimaryText: {
    color: C.white,
    fontSize: 16,
    fontWeight: "700",
  },
  btnSecondaryText: {
    color: C.greenDark,
    fontSize: 16,
    fontWeight: "700",
  },
});
