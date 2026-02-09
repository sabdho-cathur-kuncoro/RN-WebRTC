import FocusAwareStatusBar from "@/components/FocusAwareStatusbar";
import Gap from "@/components/Gap";
import {
  greenColor,
  greyColor,
  greyTextStyle,
  mainContent,
  strokeColor,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { SimpleLineIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CIRCLE = 104;

const VoiceCall = () => {
  return (
    <View
      style={[
        mainContent,
        { flex: 0.95, alignItems: "center", justifyContent: "center" },
      ]}
    >
      <FocusAwareStatusBar barStyle={"light-content"} />
      <View
        style={{
          width: CIRCLE,
          height: CIRCLE,
          borderRadius: CIRCLE / 2,
          backgroundColor: strokeColor,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SimpleLineIcons name="phone" size={60} color={greyColor} />
      </View>
      <Gap height={10} />
      <Text style={[greyTextStyle, { fontSize: 20, fontWeight: "500" }]}>
        No Active Call
      </Text>
      <Gap height={32} />
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.btnCall}
        onPress={() =>
          router.push({
            pathname: "/(drawer)/voice-call/[id]",
            params: { id: "123" },
          })
        }
      >
        <SimpleLineIcons name="phone" size={26} color={whiteColor} />
        <Gap width={10} />
        <Text
          style={[
            whiteTextStyle,
            { fontSize: 20, fontWeight: "500", letterSpacing: 1 },
          ]}
        >
          Start a call
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default VoiceCall;

const styles = StyleSheet.create({
  btnCall: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderRadius: 10,
    backgroundColor: greenColor,
  },
});
