import Gap from "@/components/Gap";
import OperationCard from "@/components/OperationCard";
import { bgColor, dot, line, strokeColor, whiteColor } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LogScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: bgColor,
        paddingHorizontal: 20,
      }}
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
      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Operation Cards */}
        <OperationCard
          title="VVIP Escort"
          route="Halim Perdana Kusuma International Airport → Istana Negara"
          start="30 November 2025, 10:30"
          end="30 November 2025, 12:30"
          onPress={() => router.push("/(drawer)")}
        />

        <OperationCard
          title="VVIP Escort"
          route="Istana Negara → Monas"
          start="30 November 2025, 14:30"
          end="30 November 2025, 16:30"
          onPress={() => router.push("/(drawer)")}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  searchRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: strokeColor,
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#1F2937",
  },

  searchInput: { color: whiteColor, flex: 1 },
});
