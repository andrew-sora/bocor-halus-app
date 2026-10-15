import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { C } from "@/constants/Colors";

export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    if (Platform.OS !== "web") return;

    if (typeof window !== "undefined") {
      // Periksa apakah sudah terpasang sebagai standalone app
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;

      if (isStandalone) return;

      const ua = window.navigator.userAgent.toLowerCase();
      const isIos = /iphone|ipad|ipod/.test(ua);
      const isAndroid = /android/.test(ua);

      if (isIos) {
        setDeviceType("ios");
        setVisible(true);
      } else if (isAndroid) {
        setDeviceType("android");
        setVisible(true);
      }
    }
  }, []);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Pasang di Layar Utama HP</Text>
        <Text style={styles.desc}>
          {deviceType === "ios"
            ? "Ketuk tombol Bagikan (ikon kotak panah ke atas) di bawah, lalu pilih 'Tambahkan ke Layar Utama'."
            : "Ketuk menu titik tiga (⋮) di Chrome, lalu pilih 'Tambahkan ke Layar Utama'."}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => setVisible(false)}
        style={styles.closeBtn}
        accessibilityRole="button"
        accessibilityLabel="Tutup pemberitahuan"
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.greenDark,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    color: C.greenSoft,
    marginBottom: 2,
  },
  desc: {
    fontSize: 11,
    color: C.white,
    lineHeight: 15,
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "700",
  },
});
