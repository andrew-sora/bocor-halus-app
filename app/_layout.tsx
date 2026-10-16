import "../global.css";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Platform, StyleSheet, Pressable, DimensionValue } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initDb, getAppPin } from "@/lib/db";
import { isAppActivated } from "@/lib/license";
import { C } from "@/constants/Colors";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PinLockScreen } from "@/components/PinLockScreen";
import { LicenseGateModal } from "@/components/LicenseGateModal";
import { LandingPage } from "@/components/LandingPage";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [appPin, setAppPin] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [isActivated, setIsActivated] = useState(true);
  const [isMobileWeb, setIsMobileWeb] = useState(false);


  const startDb = () => {
    setDbError(null);
    initDb()
      .then(async () => {
        const [pin, activated] = await Promise.all([
          getAppPin(),
          isAppActivated(),
        ]);
        setAppPin(pin);
        setIsUnlocked(!pin);
        setIsActivated(activated);
        setDbReady(true);
      })
      .catch((err) => {
        console.error("DB init error:", err);
        setDbError(err?.message || "Gagal menginisialisasi database.");
      })
      .finally(() => {
        SplashScreen.hideAsync().catch(() => {});
      });
  };

  useEffect(() => {
    startDb();
  }, []);

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const updateSize = () => {
        const isStandalone =
          window.matchMedia("(display-mode: standalone)").matches ||
          (window.navigator as unknown as { standalone?: boolean }).standalone === true;
        setIsMobileWeb(window.innerWidth <= 480 || isStandalone);
      };
      updateSize();
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }
  }, []);

  if (dbError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: C.cream,
          padding: 24,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700", color: C.ink, marginBottom: 8, textAlign: "center" }}>
          Gagal Memuat Aplikasi
        </Text>
        <Text style={{ fontSize: 14, color: "#64748B", marginBottom: 20, textAlign: "center" }}>
          {dbError}
        </Text>
        <Pressable
          onPress={startDb}
          style={{
            backgroundColor: C.greenDark,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Coba Lagi</Text>
        </Pressable>
      </View>
    );
  }

  if (!dbReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: C.cream,
        }}
      >
        <ActivityIndicator color={C.greenDark} size="large" />
      </View>
    );
  }

  const content =
    !isUnlocked && appPin ? (
      <PinLockScreen
        correctPin={appPin}
        onUnlock={() => setIsUnlocked(true)}
      />
    ) : (
      <ErrorBoundary>
        <SafeAreaProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="tambah"
              options={{
                presentation: "modal",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="rekap/[ym]"
              options={{
                title: "Detail Bulan",
                headerStyle: { backgroundColor: C.cream },
                headerTintColor: C.greenDark,
                headerTitleStyle: { fontWeight: "700", color: C.ink },
                headerShadowVisible: false,
              }}
            />
          </Stack>
        </SafeAreaProvider>
      </ErrorBoundary>
    );

  if (!isActivated) {
    return (
      <LandingPage
        onActivated={() => setIsActivated(true)}
        checkoutUrl="https://lynk.id/soradev/bocor-halus"
        supportPhone="0853-7331-3646"
        supportEmail="andrewchivas.ar@gmail.com"
      />
    );
  }

  if (Platform.OS === "web") {
    if (isMobileWeb) {
      return <View style={styles.webMobileOuter}>{content}</View>;
    }

    return (
      <View style={styles.webOuter}>
        <View style={styles.webInner}>{content}</View>
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  webMobileOuter: {
    flex: 1,
    backgroundColor: C.cream,
    height: "100vh" as unknown as DimensionValue,
    width: "100vw" as unknown as DimensionValue,
    boxSizing: "border-box" as unknown as "border-box",
  },
  webOuter: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    height: "100vh" as unknown as DimensionValue,
    width: "100vw" as unknown as DimensionValue,
    boxSizing: "border-box" as unknown as "border-box",
  },
  webInner: {
    width: "100%",
    maxWidth: 430,
    height: "94vh" as unknown as DimensionValue,
    maxHeight: 860,
    backgroundColor: C.cream,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
  },
});
