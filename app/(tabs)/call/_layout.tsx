import Gap from "@/components/Gap";
import { PermissionModal } from "@/components/PermissionModal";
import {
  bgColor,
  blueColor,
  dot,
  greenColor,
  line,
  navyColor,
  strokeColor,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { useCallPermissions } from "@/hooks/useCallPermissions";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, Slot } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export default function CallLayout() {
  const [showMicModal, setShowMicModal] = useState(false);
  const { requestMicrophonePermission, handlePermissionBlocked } =
    useCallPermissions();
  const { height } = useWindowDimensions();

  function handleCall() {
    router.push({
      pathname: "/(tabs)/call/[id]",
      params: { id: "123" },
    });
  }
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: bgColor,
          paddingHorizontal: 20,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.appTitle}>KOMANDO</Text>
        <TouchableOpacity>
          <Ionicons name="notifications" size={22} color={whiteColor} />
          <View style={dot} />
        </TouchableOpacity>
      </View>
      <View style={[line]} />
      <Gap height={20} />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          flex: 0.98,
        }}
      >
        <View style={styles.sidebarContainer}>
          <Text style={[whiteTextStyle]}>Active Operation</Text>
          <Gap height={8} />
          <TouchableOpacity
            onPress={handleCall}
            activeOpacity={0.7}
            style={[
              styles.roomChatContainer,
              {
                maxHeight: height * 0.11,
                backgroundColor: navyColor,
                borderBottomWidth: 0,
              },
            ]}
          >
            <View style={{ width: "20%" }}>
              <View style={styles.groupIcon}>
                <Feather name={"users"} size={20} color={whiteColor} />
              </View>
            </View>
            <View style={{ width: "65%" }}>
              <Text
                style={[whiteTextStyle, { fontWeight: "700" }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Kawal
              </Text>
            </View>
            <View style={styles.callContainer}>
              <View style={styles.btnCall}>
                <Ionicons name="call-outline" color={whiteColor} size={20} />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={[whiteTextStyle]}>All Messages</Text>
          <Gap height={8} />
          <View
            style={{
              height: height * 0.57,
            }}
          >
            <ScrollView
              contentContainerStyle={{
                backgroundColor: navyColor,
                flexGrow: 1,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: strokeColor,
              }}
              // refreshControl={
              //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              // }
            >
              <TouchableOpacity
                onPress={handleCall}
                activeOpacity={0.7}
                style={[
                  styles.roomChatContainer,
                  {
                    backgroundColor: "transparent",
                  },
                ]}
              >
                <View style={{ width: "20%" }}>
                  <View style={styles.groupIcon}>
                    <Feather name={"user"} size={20} color={whiteColor} />
                  </View>
                </View>
                <View style={{ width: "65%" }}>
                  <Text
                    style={[whiteTextStyle, { fontWeight: "700" }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Command Center
                  </Text>
                </View>
                <View style={styles.callContainer}>
                  <View style={styles.btnCall}>
                    <Ionicons
                      name="call-outline"
                      color={whiteColor}
                      size={20}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
        {/* Chat Room */}
        <View style={styles.mainContainer}>
          <Slot />
        </View>
      </View>
      <PermissionModal
        visible={showMicModal}
        title="Izin Mikrofon Diperlukan"
        description="Untuk memastikan suara Anda dapat terdengar oleh lawan bicara, mohon aktifkan izin mikrofon."
        primaryText="Buka Pengaturan"
        secondaryText="Batal"
        onPrimaryPress={() => {
          setShowMicModal(false);
          handlePermissionBlocked();
        }}
        onSecondaryPress={() => setShowMicModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: strokeColor,
  },
  header: {
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
  sidebarContainer: {
    width: "29%",
  },
  mainContainer: {
    width: "70%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: navyColor,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: strokeColor,
  },
  roomChatContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: strokeColor,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  groupIcon: {
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    backgroundColor: blueColor,
    alignItems: "center",
    justifyContent: "center",
  },
  btnCall: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: greenColor,
    alignItems: "center",
    justifyContent: "center",
  },
  callContainer: {
    width: "15%",
  },
  btnCallMain: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderRadius: 10,
    backgroundColor: greenColor,
  },
});
