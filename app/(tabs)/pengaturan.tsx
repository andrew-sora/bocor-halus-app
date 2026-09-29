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

  const parsedBudgetVal = parseInt(budgetInput.replace(/\D/g, ""), 10) || 0;

  const handleSaveBudget = async () => {
    if (parsedBudgetVal <= 0) {
      Alert.alert("Gagal", "Batas budget harus angka positif.");
      return;
    }
    await setBudgetLimit(parsedBudgetVal);
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
      if (result === null) return;
      Alert.alert("Berhasil", strings.importBerhasil(result.added, result.skipped));
    } catch (err) {
      Alert.alert("Gagal", String(err));
    } finally {
      setLoading(null);
    }
  };

  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <View style={styles.container}>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
      >
        {/* Target Budget Manager */}
        <Text style={styles.sectionTitle}>{strings.targetBudgetTitle}</Text>
        <View style={styles.card}>
          <Text style={styles.infoText}>{strings.targetBudgetDesc}</Text>
          <TextInput
            style={styles.budgetInput}
            value={budgetInput}
            onChangeText={(t) => setBudgetInput(t.replace(/\D/g, ""))}
            keyboardType="numeric"
            placeholder="3000000"
            placeholderTextColor={C.muted}
          />
          {parsedBudgetVal > 0 && (
            <Text style={styles.formattedPreview}>
              Terformat: {formatRupiah(parsedBudgetVal)}
            </Text>
          )}
          <TouchableOpacity
            style={styles.saveBudgetBtn}
            onPress={handleSaveBudget}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBudgetBtnText}>
              {budgetSaved ? "Tersimpan" : strings.simpanBudget}
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
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: C.cream },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: C.muted,
    marginTop: 2,
  },
  content: { padding: 16 },
  sectionTitle: {
    fontSize: 12,
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
    marginBottom: 6,
  },
  formattedPreview: {
    fontSize: 13,
    color: C.greenDark,
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
