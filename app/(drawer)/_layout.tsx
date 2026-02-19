import Gap from "@/components/Gap";
import Sidebar from "@/components/Sidebar";
import { bgColor, dot, line, whiteColor } from "@/constants/theme";
import { useOperationStore } from "@/stores/operation.store";
import { Ionicons } from "@expo/vector-icons";
import { router, Slot } from "expo-router";
import { useEffect } from "react";
import {
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DrawerLayout() {
  const backAction = () => {
    const hasOperation = useOperationStore.getState().getOperation();

    if (hasOperation) {
      useOperationStore.getState().clearOperation();
      router.back();
      return true;
    }

    return false;
  };
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => subscription.remove();
  }, []);
  return (
    <View style={styles.root}>
      {/* App title */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>KOMANDO</Text>
        <TouchableOpacity>
          <Ionicons name="notifications" size={22} color={whiteColor} />
          <View style={dot} />
        </TouchableOpacity>
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <View style={[line]} />
      </View>
      <Gap height={20} />
      <View style={styles.container}>
        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN CONTENT */}
        <View style={styles.main}>
          <Slot />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 16,
    backgroundColor: bgColor,
  },
  container: {
    flex: 1,
    flexDirection: "row",
  },
  main: {
    flex: 1,
    paddingRight: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appTitle: {
    color: "#F9FAFB",
    fontSize: 18,
    fontWeight: "600",
  },
});
