import { Pressable, Text, View } from "react-native";

export function VehicleCard({
  data,
  onClose,
}: {
  data: any;
  onClose: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
      }}
    >
      <Text style={{ fontWeight: "600", fontSize: 16 }}>
        Vehicle {data?.device_id ?? "-"}
      </Text>

      {/* <Text style={{ marginTop: 4, color: "#666" }}>
        Speed: {Math.round((data?.speed ?? 0) * 3.6)} km/h
      </Text> */}

      <Pressable onPress={onClose} style={{ marginTop: 12 }}>
        <Text style={{ color: "#007AFF" }}>Close</Text>
      </Pressable>
    </View>
  );
}
