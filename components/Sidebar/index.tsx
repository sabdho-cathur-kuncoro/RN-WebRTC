// components/Sidebar.tsx
import {
  blueColor,
  blueRGBAColor,
  line,
  navyColor,
  redColor,
  redRGBAColor,
  strokeColor,
  whiteColor,
} from "@/constants/theme";
// import { useToast } from "@/hooks/useToast";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Gap from "../Gap";

type MenuItemConfig = {
  label: string;
  route: string;
  icon: React.ReactNode;
};

const MENU_ITEMS: MenuItemConfig[] = [
  {
    label: "Detail Operation",
    route: "/",
    icon: (
      <Image
        source={require("@/assets/icons/ic-file.png")}
        style={{ width: 20, height: 20 }}
      />
    ),
  },
  {
    label: "CCTV",
    route: "/cctv",
    icon: (
      <Image
        source={require("@/assets/icons/ic-cctv.png")}
        style={{ width: 20, height: 20 }}
      />
    ),
  },
  {
    label: "Map",
    route: "/live-map",
    icon: (
      <Image
        source={require("@/assets/icons/ic-map.png")}
        style={{ width: 20, height: 20 }}
      />
    ),
  },
  {
    label: "Chat",
    route: "/chat",
    icon: (
      <Image
        source={require("@/assets/icons/ic-chat.png")}
        style={{ width: 20, height: 20 }}
      />
    ),
  },
  {
    label: "Voice Call",
    route: "/voice-call",
    icon: (
      <Image
        source={require("@/assets/icons/ic-phone.png")}
        style={{ width: 20, height: 20 }}
      />
    ),
  },
  {
    label: "Camera",
    route: "/camera",
    icon: (
      <Image
        source={require("@/assets/icons/ic-camera.png")}
        style={{ width: 20, height: 20 }}
      />
    ),
  },
];

export default function Sidebar() {
  // const { logout } = useAuthStore();
  // const toast = useToast();
  const pathname = usePathname();

  const handlePress = (route: string) => {
    if (pathname === route) return;
    router.replace(route as any);
  };

  const isActive = (route: string) => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  };

  return (
    <View style={styles.container}>
      {/* Menu */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          // disabled
          onPress={() => {
            // toast.info("Info", "Your changes were saved successfully");
            // logout();
            // storage.clearAll();
            router.back();
          }}
          style={[styles.menuItem, { flexDirection: "row" }]}
        >
          <Ionicons name="arrow-back" size={18} color={whiteColor} />
          <Gap width={10} />
          <Text style={[styles.menuLabel]}>Active Operation</Text>
        </TouchableOpacity>
        <View style={[line]} />
        <Gap height={10} />
        {MENU_ITEMS.map((item) => {
          const active = isActive(item.route);
          // const isActive = segments[1] === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              onPress={() => handlePress(item.route)}
              style={[styles.menuItem, active && styles.menuItemActive]}
            >
              <View style={styles.menuIcon}>
                {React.cloneElement(item.icon as any, {
                  color: active ? whiteColor : "#9CA3AF",
                })}
              </View>
              <Text
                style={[styles.menuLabel, active && styles.menuLabelActive]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Gap height={20} />
      {pathname === "/cctv" ? (
        <>
          <TouchableOpacity style={styles.refreshBtn} activeOpacity={0.8}>
            <Feather name="refresh-cw" size={20} color={blueColor} />
            <Gap width={10} />
            <Text style={{ color: blueColor, fontWeight: "700" }}>
              Refresh All Camera
            </Text>
          </TouchableOpacity>
          <Gap height={16} />
        </>
      ) : (
        <></>
      )}
      {/* <TouchableOpacity
        style={styles.logoutBtn}
        onPress={logout}
        activeOpacity={0.8}
      >
        <Feather name="log-out" size={20} color={redColor} />
        <Gap width={10} />
        <Text style={{ color: redColor, fontWeight: "700" }}>Logout</Text>
      </TouchableOpacity> */}

      {/* Bottom section (e.g. user, version, etc.) */}
      {/* <View style={styles.footer}>
        <Text style={styles.footerText}>v1.0.0</Text>
      </View> */}
    </View>
  );
}

const SIDEBAR_WIDTH = 260;

const styles = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    paddingHorizontal: 20,
  },
  menuContainer: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: navyColor,
    borderWidth: 1,
    borderColor: strokeColor,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: blueColor,
  },
  menuIcon: {
    width: 24,
    alignItems: "center",
    marginRight: 10,
  },
  menuLabel: {
    color: whiteColor,
    fontSize: 14,
    fontWeight: "500",
  },
  menuLabelActive: {
    color: whiteColor,
    fontWeight: "600",
  },
  refreshBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: blueColor,
    backgroundColor: blueRGBAColor,
  },
  logoutBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: redColor,
    backgroundColor: redRGBAColor,
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#111827",
  },
  footerText: {
    color: "#6B7280",
    fontSize: 12,
  },
});
