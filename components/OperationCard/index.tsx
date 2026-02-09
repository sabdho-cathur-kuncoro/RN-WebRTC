import {
  greyColor,
  redColor,
  redRGBAColor,
  whiteColor,
} from "@/constants/theme";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function OperationCard({
  title,
  route,
  start,
  end,
  onPress,
}: {
  title: string;
  route: string;
  start: string;
  end: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push("/(drawer)")}
      style={styles.upcomingCard}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{route}</Text>
        </View>
        <Text style={styles.badgeHigh}>High Priority</Text>
      </View>

      <View style={styles.cardInfoRow}>
        <Info label="Start Date" value={start} />
        <Info label="End Date" value={end} />
        <Info label="Member" value="10 Member" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  upcomingCard: {
    backgroundColor: "#0B1220",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  cardTitle: { color: "#F9FAFB", fontWeight: "600", fontSize: 15 },
  cardSubtitle: { color: "#9CA3AF", fontSize: 13, marginTop: 4 },

  badgeHigh: {
    alignItems: "center",
    justifyContent: "center",
    color: redColor,
    borderColor: redColor,
    backgroundColor: redRGBAColor,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
  },

  cardInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  infoLabel: { color: greyColor, fontSize: 12 },
  infoValue: { color: whiteColor, fontSize: 13, marginTop: 2 },
});
