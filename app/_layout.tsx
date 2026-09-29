import "../global.css";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Platform, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initDb } from "@/lib/db";
import { C } from "@/constants/Colors";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDb()
      .then(() => setDbReady(true))
      .catch((err) => console.error("DB init error:", err))
      .finally(() => {
        SplashScreen.hideAsync().catch(() => {});
      });
  }, []);

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

  const content = (
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
  );

  if (Platform.OS === "web") {
    return (
      <View style={styles.webOuter}>
        <View style={styles.webInner}>{content}</View>
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  webOuter: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    height: "100vh" as any,
    width: "100vw" as any,
    boxSizing: "border-box" as any,
  },
  webInner: {
    width: "100%",
    maxWidth: 430,
    height: "94vh" as any,
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

