import React from "react";
import { Platform } from "react-native";
import { SymbolView } from "expo-symbols";

interface TabIconProps {
  name: "beranda" | "rekap" | "pengaturan" | "catat";
  color: any;
  size?: number;
}

export function TabIcon({ name, color, size = 24 }: TabIconProps) {
  // Di Web: Gunakan inline SVG murni yang 100% tajam, ringan, dan tidak pernah rusak/tofu
  if (Platform.OS === "web") {
    if (name === "beranda") {
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: "block" }}
        >
          <path d="M3 9.5L12 3l9 6.5v11a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-11z" />
        </svg>
      );
    }

    if (name === "rekap") {
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: "block" }}
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <circle cx="4" cy="6" r="1.5" fill={color} />
          <circle cx="4" cy="12" r="1.5" fill={color} />
          <circle cx="4" cy="18" r="1.5" fill={color} />
        </svg>
      );
    }

    if (name === "pengaturan") {
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: "block" }}
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    }
    if (name === "catat") {
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: "block" }}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    }
  }

  // Pada platform iOS Native / Android Native: fallback ke SymbolView
  if (name === "beranda") {
    return (
      <SymbolView
        name={{ ios: "house.fill", android: "home", web: "home" }}
        tintColor={color}
        size={size}
      />
    );
  }

  if (name === "catat") {
    return (
      <SymbolView
        name={{
          ios: "plus",
          android: "add",
          web: "add",
        }}
        tintColor={color}
        size={size}
      />
    );
  }

  if (name === "rekap") {
    return (
      <SymbolView
        name={{
          ios: "list.bullet.rectangle",
          android: "list",
          web: "list",
        }}
        tintColor={color}
        size={size}
      />
    );
  }

  return (
    <SymbolView
      name={{
        ios: "gearshape.fill",
        android: "settings",
        web: "settings",
      }}
      tintColor={color}
      size={size}
    />
  );
}
