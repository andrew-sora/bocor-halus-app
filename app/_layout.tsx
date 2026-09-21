import "../global.css";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
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

  return (
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
}
