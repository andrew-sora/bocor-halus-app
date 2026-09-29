import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { exportBackup, importBackup } from "@/lib/backup";
import { getBudgetLimit, setBudgetLimit } from "@/lib/db";
import { formatRupiah } from "@/lib/format";
import { strings } from "@/constants/strings";
import { C } from "@/constants/Colors";

export default function PengaturanScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<"export" | "import" | null>(null);
  const [budgetInput, setBudgetInput] = useState("3000000");
  const [budgetSaved, setBudgetSaved] = useState(false);

  useEffect(() => {
    getBudgetLimit().then((limit) => {
      setBudgetInput(limit.toString());
    });
  }, []);

  const handleSaveBudget = async () => {
    const val = parseInt(budgetInput.replace(/\D/g, ""), 10);
    if (isNaN(val) || val <= 0) {
      Alert.alert("Gagal", "Batas budget harus angka positif.");
      return;
    }
    await setBudgetLimit(val);
    setBudgetSaved(true);
    setTimeout(() => setBudgetSaved(false), 2000);
  };

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
      {/* Target Budget Manager */}
      <Text style={styles.sectionTitle}>{strings.targetBudgetTitle}</Text>
      <View style={styles.card}>
        <Text style={styles.infoText}>{strings.targetBudgetDesc}</Text>
        <TextInput
          style={styles.budgetInput}
          value={budgetInput}
          onChangeText={setBudgetInput}
          keyboardType="numeric"
          placeholder="3000000"
          placeholderTextColor={C.muted}
        />
        <TouchableOpacity
          style={styles.saveBudgetBtn}
          onPress={handleSaveBudget}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBudgetBtnText}>
            {budgetSaved ? "✓ Tersimpan!" : strings.simpanBudget}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bagian Cadangan */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Data & Cadangan</Text>
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
      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    color: C.muted,
    lineHeight: 21,
    marginBottom: 10,
  },
  budgetInput: {
    backgroundColor: C.cream,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: C.ink,
    fontWeight: "700",
    marginBottom: 12,
  },
  saveBudgetBtn: {
    backgroundColor: C.greenDark,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBudgetBtnText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "700",
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
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 10,
    minHeight: 52,
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
