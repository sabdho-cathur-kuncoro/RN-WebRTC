import { useCallContext } from "@/contexts/CallContext";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function CallDebugPanel() {
  const call = useCallContext();

  if (!__DEV__) return null;

  return (
    <View style={styles.container}>
      <Pressable style={styles.btn} onPress={() => call.__simulateOutgoing?.()}>
        <Text style={styles.text}>Outgoing Call</Text>
      </Pressable>

      <Pressable style={styles.btn} onPress={() => call.__simulateMissed?.()}>
        <Text style={styles.text}>Force Missed</Text>
      </Pressable>

      <Pressable
        style={styles.btn}
        onPress={() => call.__simulateIncomingCall?.(42)}
      >
        <Text style={styles.text}>Simulate Incoming</Text>
      </Pressable>

      <Pressable
        style={styles.btn}
        onPress={() => call.__simulateConnected?.()}
      >
        <Text style={styles.text}>Simulate Connected</Text>
      </Pressable>

      <Pressable style={styles.btn} onPress={() => call.__simulateEnd?.()}>
        <Text style={styles.text}>End Call</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 60,
    right: 12,
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 8,
    zIndex: 9999,
  },
  btn: {
    paddingVertical: 6,
  },
  text: {
    color: "#fff",
    fontSize: 12,
  },
});
