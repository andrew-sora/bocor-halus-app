import { View, Text, StyleSheet, Platform } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabIcon } from "@/components/TabIcon";
import { strings } from "@/constants/strings";
import { C } from "@/constants/Colors";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  // Deteksi lingkungan device secara dinamis (iPhone, Android, Desktop)
  const isWeb = Platform.OS === "web";
  const isIosWeb =
    isWeb &&
    typeof window !== "undefined" &&
    /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

  const isStandalone =
    isWeb &&
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true);

  // Jika iPhone standalone (PWA yang dipasang di layar utama), home indicator memerlukan ruang minimal 32-34px
  const bottomInset = Math.max(
    insets.bottom,
    isIosWeb ? (isStandalone ? 32 : 16) : 0
  );

  const bottomPadding = bottomInset > 0 ? bottomInset + 4 : 8;
  const tabHeight = 52 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: C.cream },
        headerShadowVisible: false,
        headerTintColor: C.greenDark,
        headerTitleStyle: { fontWeight: "800", fontSize: 20, color: C.ink },
        tabBarActiveTintColor: C.greenDark,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: {
          backgroundColor: C.cream,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: strings.tabBeranda,
          headerTitle: "Bocor Halus",
          headerRight: () => (
            <View style={{ marginRight: 16 }}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>BH</Text>
              </View>
            </View>
          ),
          tabBarIcon: ({ color }) => (
            <TabIcon name="beranda" color={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="rekap"
        options={{
          title: strings.tabRekap,
          headerTitle: strings.rekap,
          tabBarIcon: ({ color }) => (
            <TabIcon name="rekap" color={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="pengaturan"
        options={{
          title: strings.tabPengaturan,
          headerTitle: strings.tabPengaturan,
          tabBarIcon: ({ color }) => (
            <TabIcon name="pengaturan" color={color} size={22} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.greenSoft,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
  },
  avatarText: {
    fontSize: 13,
    fontWeight: "800",
    color: C.greenDark,
  },
});
