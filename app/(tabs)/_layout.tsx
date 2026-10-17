import { View, Text, StyleSheet, Platform } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabIcon } from "@/components/TabIcon";
import { strings } from "@/constants/strings";
import { C } from "@/constants/Colors";

export default function TabLayout() {
  const router = useRouter();
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

  // Jika iPhone standalone (PWA yang dipasang di layar utama), home indicator memerlukan ruang 34px
  const safeBottom = Math.max(
    insets.bottom,
    isIosWeb ? (isStandalone ? 34 : 16) : (insets.bottom > 0 ? insets.bottom : 8)
  );

  const bottomPadding = safeBottom;
  const tabHeight = 64 + safeBottom;

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
          paddingTop: 4,
          overflow: "visible",
        },
        tabBarItemStyle: {
          overflow: "visible",
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
          lineHeight: 14,
        },
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
        name="catat"
        options={{
          title: "Catat",
          tabBarLabel: "Catat",
          tabBarIcon: () => (
            <View style={styles.centerFabCircle}>
              <TabIcon name="catat" color="#FFFFFF" size={20} />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "700",
            color: C.greenDark,
            marginTop: 2,
          },
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push("/tambah");
          },
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
  centerFabCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.greenDark,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -8,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
