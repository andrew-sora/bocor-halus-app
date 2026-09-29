import { View, Text, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { strings } from "@/constants/strings";
import { C } from "@/constants/Colors";

export default function TabLayout() {
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
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600", marginTop: 2 },
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
            <SymbolView
              name={{ ios: "house.fill", android: "home", web: "home" }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="rekap"
        options={{
          title: strings.tabRekap,
          headerTitle: strings.rekap,
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "list.bullet.rectangle",
                android: "list",
                web: "list",
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="pengaturan"
        options={{
          title: strings.tabPengaturan,
          headerTitle: strings.tabPengaturan,
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "gearshape.fill",
                android: "settings",
                web: "settings",
              }}
              tintColor={color}
              size={24}
            />
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
