import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { C } from "@/constants/Colors";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "other">("other");
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    if (typeof window !== "undefined") {
      // Periksa apakah sudah terpasang sebagai standalone app
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;

      if (isStandalone) return;

      // Cek apakah user menutup banner pada sesi ini
      const isDismissed = sessionStorage.getItem("bh_pwa_banner_dismissed");
      if (isDismissed) return;

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

      // Tangkap event instalasi PWA di Android / Chromium
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setInstallPrompt(e as BeforeInstallPromptEvent);
        setVisible(true);
      };

      const handleAppInstalled = () => {
        setVisible(false);
        setInstallPrompt(null);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.addEventListener("appinstalled", handleAppInstalled);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setVisible(false);
        }
        setInstallPrompt(null);
      } catch (err) {
        console.error("Install prompt error:", err);
      }
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("bh_pwa_banner_dismissed", "true");
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Pasang di Layar Utama HP</Text>
          <Text style={styles.desc}>
            {installPrompt
              ? "Klik tombol di bawah untuk memasang aplikasi Bocor Halus langsung ke HP Anda."
              : deviceType === "ios"
              ? "Ketuk tombol Bagikan ⎋ di Safari, lalu pilih 'Tambahkan ke Layar Utama'."
              : "Ketuk menu titik tiga (⋮) di pojok atas Chrome, lalu pilih 'Pasang aplikasi' atau 'Tambahkan ke Layar Utama'."}
          </Text>

          {installPrompt && (
            <TouchableOpacity
              onPress={handleInstallClick}
              style={styles.installBtn}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Pasang Aplikasi Sekarang"
            >
              <Text style={styles.installBtnText}>Pasang Aplikasi Sekarang</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Tutup pemberitahuan"
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.greenDark,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.12)",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: C.greenSoft,
    marginBottom: 3,
  },
  desc: {
    fontSize: 11,
    color: C.white,
    lineHeight: 16,
    opacity: 0.95,
  },
  installBtn: {
    marginTop: 8,
    backgroundColor: C.greenLight,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  installBtnText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "700",
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  closeText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "700",
  },
});
