import { useCallContext } from "@/contexts/CallContext";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

export function MissedCallOverlay() {
  const { callState, callerId, dismissMissedCall } = useCallContext();

  if (callState !== "MISSED") return null;

  return (
    <Modal transparent visible>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Missed Call</Text>
          <Text style={styles.subtitle}>From user {callerId}</Text>

          <Pressable style={styles.btn} onPress={dismissMissedCall}>
            <Text style={styles.text}>Dismiss</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#111827",
    padding: 20,
    borderRadius: 14,
    width: "80%",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: "#9ca3af",
    marginVertical: 8,
  },
  btn: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
  },
});
