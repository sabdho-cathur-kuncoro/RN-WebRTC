import {
  greenColor,
  greyColor,
  greyTextStyle,
  navyColor,
  redColor,
  strokeColor,
  whiteTextStyle,
} from "@/constants/theme";
import { useCallContext } from "@/contexts/CallContext";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

export function IncomingCallOverlay() {
  const { callState, callerId, acceptIncomingCall, rejectIncomingCall } =
    useCallContext();

  const visible = callState === "INCOMING";

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={[styles.title, whiteTextStyle]}>Incoming Call</Text>
          <Text style={[styles.subtitle, greyTextStyle]}>
            From user ID: {callerId}
          </Text>

          <View style={styles.actions}>
            <Pressable
              style={[styles.btn, styles.reject]}
              onPress={rejectIncomingCall}
            >
              <Text style={[styles.btnText, whiteTextStyle]}>Reject</Text>
            </Pressable>

            <Pressable
              style={[styles.btn, styles.accept]}
              onPress={acceptIncomingCall}
            >
              <Text style={[styles.btnText, whiteTextStyle]}>Accept</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "60%",
    backgroundColor: navyColor,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: strokeColor,
    // shadow
    shadowColor: greyColor,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 6,
    alignItems: "center",
  },
  accept: {
    backgroundColor: greenColor,
  },
  reject: {
    backgroundColor: redColor,
  },
  btnText: {
    fontWeight: "600",
  },
});
