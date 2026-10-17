import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View } from "react-native";

export default function CatatTabPlaceholder() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/tambah");
  }, [router]);

  return <View style={{ flex: 1 }} />;
}
