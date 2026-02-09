import Gap from "@/components/Gap";
import {
  bgColor,
  blueColor,
  greenColor,
  greyTextStyle,
  navyColor,
  redColor,
  redRGBAColor,
  strokeColor,
  whiteTextStyle,
} from "@/constants/theme";
import { useAuthStore } from "@/stores/auth.store";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Profile = () => {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: bgColor,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View style={styles.mainContent}>
        <Feather name="tablet" color={blueColor} size={40} />
        <Gap height={20} />
        <View style={styles.row}>
          <View style={{ width: "49%" }}>
            <Text style={[greyTextStyle]}>Username</Text>
          </View>
          <View style={{ width: "49%", alignItems: "flex-end" }}>
            <Text style={[whiteTextStyle]}>Device 01</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ width: "49%" }}>
            <Text style={[greyTextStyle]}>Device Name</Text>
          </View>
          <View style={{ width: "49%", alignItems: "flex-end" }}>
            <Text style={[whiteTextStyle]}>Tablet</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ width: "49%" }}>
            <Text style={[greyTextStyle]}>Model</Text>
          </View>
          <View style={{ width: "49%", alignItems: "flex-end" }}>
            <Text style={[whiteTextStyle]}>Samsung Android</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ width: "49%" }}>
            <Text style={[greyTextStyle]}>Item No</Text>
          </View>
          <View style={{ width: "49%", alignItems: "flex-end" }}>
            <Text style={[whiteTextStyle]}>7870</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ width: "49%" }}>
            <Text style={[greyTextStyle]}>Serial Number</Text>
          </View>
          <View style={{ width: "49%", alignItems: "flex-end" }}>
            <Text style={[whiteTextStyle]}>SN987654321</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ width: "49%" }}>
            <Text style={[greyTextStyle]}>IP Address</Text>
          </View>
          <View style={{ width: "49%", alignItems: "flex-end" }}>
            <Text style={[whiteTextStyle]}>192.168.100.20</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ width: "49%" }}>
            <Text style={[greyTextStyle]}>Mac Address</Text>
          </View>
          <View style={{ width: "49%", alignItems: "flex-end" }}>
            <Text style={[whiteTextStyle]}>b0:be:83:78:78:0d</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ width: "49%" }}>
            <Text style={[greyTextStyle]}>Power</Text>
          </View>
          <View style={{ width: "49%", alignItems: "flex-end" }}>
            <Text style={[whiteTextStyle]}>5 Volt</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ width: "49%" }}>
            <Text style={[greyTextStyle]}>Status</Text>
          </View>
          <View
            style={{
              width: "49%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <View style={[styles.dotContainer]} />
            <Gap width={10} />
            <Text style={[whiteTextStyle]}>Active</Text>
          </View>
        </View>
        <Gap height={20} />
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={20} color={redColor} />
          <Gap width={10} />
          <Text style={{ color: redColor, fontWeight: "700" }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  mainContent: {
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: navyColor,
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: strokeColor,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: strokeColor,
  },
  logoutBtn: {
    width: "25%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: redColor,
    backgroundColor: redRGBAColor,
  },
  dotContainer: {
    width: 12,
    height: 12,
    borderRadius: 12,
    backgroundColor: greenColor,
  },
});
