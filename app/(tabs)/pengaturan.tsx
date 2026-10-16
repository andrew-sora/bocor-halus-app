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
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { exportBackup, importBackup } from "@/lib/backup";
import { getBudgetLimit, setBudgetLimit, getAppPin, setAppPin } from "@/lib/db";
import { isAppActivated } from "@/lib/license";
import { formatRupiah } from "@/lib/format";
import { SetPinModal } from "@/components/SetPinModal";
import { strings } from "@/constants/strings";
import { C } from "@/constants/Colors";

export default function PengaturanScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<"export" | "import" | null>(null);
  const [budgetInput, setBudgetInput] = useState("3000000");
  const [budgetSaved, setBudgetSaved] = useState(false);
  const [appPin, setAppPinState] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);

  const [activated, setActivated] = useState(false);

  useEffect(() => {
    getBudgetLimit().then((limit) => {
      setBudgetInput(limit.toString());
    });
    getAppPin().then((pin) => {
      setAppPinState(pin);
    });
    isAppActivated().then((act) => {
      setActivated(act);
    });
  }, []);

  const handleSavePin = async (newPin: string | null) => {
    await setAppPin(newPin);
    setAppPinState(newPin);
  };

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

        {/* Kunci Aplikasi PIN */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Kunci Aplikasi (PIN 4 Angka)</Text>
        <View style={styles.card}>
          <Text style={styles.infoTitle}>
            {appPin ? "Status: Kunci PIN Aktif" : "Status: Kunci PIN Belum Aktif"}
          </Text>
          <Text style={styles.infoText}>
            {appPin
              ? "Aplikasi terkunci dengan 4 angka rahasia agar catatan belanja aman dan tidak diutak-atik saat HP dimainkan anak."
              : "Lindungi catatan keuangan keluarga dengan 4 angka PIN rahasia saat membuka aplikasi."}
          </Text>
          <TouchableOpacity
            style={[styles.saveBudgetBtn, { marginTop: 8 }]}
            onPress={() => setShowPinModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBudgetBtnText}>
              {appPin ? "Ubah atau Hapus PIN" : "Aktifkan Kunci PIN"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bagian Cadangan */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Keamanan & Cadangan Data</Text>
        
        {/* Banner Penenang Privasi */}
        <View style={styles.privacyBanner}>
          <Text style={styles.privacyBannerTitle}>Data 100% Privat & Aman</Text>
          <Text style={styles.privacyBannerText}>
            Seluruh catatan belanja disimpan di memori HP Anda sendiri tanpa diunggah ke internet. Tidak ada pihak lain atau server luar yang bisa melihat keuangan rumah tangga Anda.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.infoTitle}>Panduan Pencadangan</Text>
          <Text style={styles.infoText}>
            Ketuk tombol di bawah untuk menyimpan cadangan. Anda bisa langsung mengirimkan file cadangannya ke obrolan WhatsApp pribadi Anda atau Google Drive agar catatan Anda tidak pernah hilang.
          </Text>
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
            <Text style={styles.btnPrimaryText}>Simpan & Kirim Cadangan</Text>
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
            <Text style={styles.btnSecondaryText}>Pulihkan Catatan dari File</Text>
          )}
        </TouchableOpacity>

        {/* Status Lisensi */}
        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>
          Status Lisensi
        </Text>
        <View style={styles.card}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={styles.infoTitle}>Kepemilikan Aplikasi</Text>
            <View style={{ backgroundColor: activated ? C.greenSoft : C.warningBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: activated ? C.greenDark : C.warning }}>
                {activated ? "LISENSI AKTIF" : "BELUM AKTIF"}
              </Text>
            </View>
          </View>
          <Text style={styles.infoText}>
            {activated
              ? "Aplikasi aktif permanen (Bebas Biaya Langganan). Seluruh data aman dan hanya tersimpan di perangkat ini."
              : "Aplikasi belum teraktivasi."}
          </Text>
        </View>

        {/* Bantuan & Masukan */}
        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>
          Bantuan & Kritik Saran
        </Text>
        <View style={styles.card}>
          <Text style={styles.infoTitle}>Ada Pertanyaan, Masukan, atau Keluhan?</Text>
          <Text style={styles.infoText}>
            Kami siap membantu dan sangat menghargai saran Anda. Hubungi kami langsung melalui WhatsApp atau Email resmi di bawah ini:
          </Text>

          {/* Tombol WhatsApp */}
          <TouchableOpacity
            style={styles.contactBtnWa}
            onPress={() => {
              const text = encodeURIComponent(
                "Halo Tim Bocor Halus, saya ingin menyampaikan saran/keluhan mengenai aplikasi: "
              );
              Linking.openURL(`https://wa.me/6285373313646?text=${text}`).catch(() => {});
            }}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Chat WhatsApp Pengembang"
          >
            <Text style={styles.contactBtnWaText}>WhatsApp CS: 0853-7331-3646</Text>
          </TouchableOpacity>

          {/* Tombol Email */}
          <TouchableOpacity
            style={styles.contactBtnEmail}
            onPress={() => {
              Linking.openURL("mailto:admin@soradev.id?subject=Kritik%20%26%20Saran%20Bocor%20Halus").catch(() => {});
            }}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Kirim Email ke admin@soradev.id"
          >
            <Text style={styles.contactBtnEmailText}>✉️ Email: admin@soradev.id</Text>
          </TouchableOpacity>
        </View>

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

      <SetPinModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSavePin={handleSavePin}
        currentPin={appPin}
      />
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
  privacyBanner: {
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  privacyBannerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#065F46",
    marginBottom: 6,
  },
  privacyBannerText: {
    fontSize: 13,
    color: "#047857",
    lineHeight: 19,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.ink,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: C.inkLight,
    lineHeight: 20,
    marginBottom: 4,
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
  contactBtnWa: {
    backgroundColor: "#25D366",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  contactBtnWaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  contactBtnEmail: {
    backgroundColor: C.cream,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  contactBtnEmailText: {
    color: C.ink,
    fontSize: 15,
    fontWeight: "600",
  },
});

