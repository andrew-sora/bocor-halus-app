import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { strings } from "@/constants/strings";
import { C } from "@/constants/Colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
