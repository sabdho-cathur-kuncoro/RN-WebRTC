import FocusAwareStatusBar from "@/components/FocusAwareStatusbar";
import MapComponent from "@/components/MapComponent";
import React from "react";
import { StyleSheet, View } from "react-native";

const LiveMap = () => {
  return (
    <View style={styles.container}>
      <FocusAwareStatusBar barStyle={"light-content"} />
      <MapComponent isOperation={true} />
    </View>
  );
};

export default LiveMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
