import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { C } from "@/constants/Colors";
import { activateLicense } from "@/lib/license";

type LicenseGateModalProps = {
  visible: boolean;
  onActivated: () => void;
  checkoutUrl?: string;
};

export function LicenseGateModal({
  visible,
  onActivated,
  checkoutUrl = "https://lynk.id/soradev/bocor-halus",
}: LicenseGateModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleActivate = async () => {
    if (!code.trim()) {
      setErrorMsg("Silakan masukkan kode lisensi Anda.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await activateLicense(code);
      if (res.success) {
        onActivated();
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg("Gagal melakukan aktivasi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = () => {
    if (Platform.OS === "web") {
      window.open(checkoutUrl, "_blank");
    } else {
      Linking.openURL(checkoutUrl).catch(() => {});
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Aktivasi Aplikasi</Text>
            </View>
            <Text style={styles.title}>Bocor Halus</Text>
            <Text style={styles.subtitle}>
              Pencatat keuangan rumah tangga bebas langganan bulanan. Cukup sekali beli, miliki seumur hidup.
            </Text>
          </View>

          {/* Form Input */}
          <View style={styles.form}>
            <Text style={styles.inputLabel}>Masukkan Kode Lisensi</Text>
            <TextInput
              style={[styles.input, !!errorMsg && styles.inputError]}
              placeholder="Contoh: BH-8921-A7K2"
              placeholderTextColor={C.muted}
              value={code}
              onChangeText={(text) => {
                setCode(text.toUpperCase());
                if (errorMsg) setErrorMsg(null);
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleActivate}
            />

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <TouchableOpacity
              style={[styles.activateBtn, loading && styles.disabledBtn]}
              onPress={handleActivate}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={C.white} size="small" />
              ) : (
                <Text style={styles.activateBtnText}>Aktifkan Sekarang</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Pembatas */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>atau</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Beli Lisensi Baru */}
          <View style={styles.buySection}>
            <Text style={styles.buyHelp}>Belum memiliki kode lisensi?</Text>
            <TouchableOpacity
              style={styles.buyBtn}
              onPress={handleBuy}
              activeOpacity={0.8}
            >
              <Text style={styles.buyBtnText}>Beli Akses Seumur Hidup (Rp 15.000)</Text>
            </TouchableOpacity>
            <Text style={styles.privacyNote}>
              Kode langsung dikirim otomatis setelah pembayaran QRIS/Transfer.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  tag: {
    backgroundColor: C.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  tagText: {
    color: C.greenDark,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
    lineHeight: 18,
  },
  form: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: C.inkLight,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: "700",
    color: C.ink,
    backgroundColor: "#F8FAFC",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  inputError: {
    borderColor: C.danger,
    backgroundColor: C.dangerBg,
  },
  errorText: {
    color: C.danger,
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
  activateBtn: {
    backgroundColor: C.greenDark,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  activateBtnText: {
    color: C.white,
    fontSize: 14,
    fontWeight: "700",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: C.muted,
  },
  buySection: {
    alignItems: "center",
  },
  buyHelp: {
    fontSize: 12,
    color: C.muted,
    marginBottom: 8,
  },
  buyBtn: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#F59E0B",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
  },
  buyBtnText: {
    color: "#92400E",
    fontSize: 13,
    fontWeight: "700",
  },
  privacyNote: {
    fontSize: 11,
    color: C.muted,
    textAlign: "center",
    lineHeight: 15,
  },
});
