import FocusAwareStatusBar from "@/components/FocusAwareStatusbar";
import Gap from "@/components/Gap";
import {
  greyColor,
  greyTextStyle,
  strokeColor,
  whiteTextStyle,
} from "@/constants/theme";
import { SimpleLineIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

const CIRCLE = 104;

const Call = () => {
  return (
    <View style={[{ flex: 1, alignItems: "center", justifyContent: "center" }]}>
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
      <Text style={[whiteTextStyle, { fontSize: 24, fontWeight: "500" }]}>
        No Active Call
      </Text>
      <Gap height={10} />
      <Text style={[greyTextStyle, { fontSize: 20 }]}>
        Select a contact to start a call
      </Text>
    </View>
  );
};

export default Call;
