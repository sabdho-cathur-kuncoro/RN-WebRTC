import {
  dot,
  greenColor,
  greyColor,
  redColor,
  redRGBAColor,
  strokeColor,
  whiteColor,
} from "@/constants/theme";
import { onGetOperationsService } from "@/services/operations";
import { useOperationStore } from "@/stores/operation.store";
import { formatDateTime } from "@/utils/dayjs";
import { wait } from "@/utils/helpers";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [operations, setOperations] = useState<any>([]);
  useEffect(() => {
    getOperations();
  }, []);

  async function getOperations() {
    try {
      const res = await onGetOperationsService();
      setOperations(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  function handleNavigate(item: any) {
    try {
      useOperationStore.getState().setOperation(item);
      router.push("/(drawer)");
    } catch (err) {
      if (__DEV__) {
        console.log(err);
      }
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    wait(1000).then(() => {
      getOperations();
      setRefreshing(false);
    });
  }, []);
  return (
    <View style={styles.safe}>
      <LinearGradient colors={["#050B18", "#020617"]} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>KOMANDO</Text>
          <TouchableOpacity>
            <Ionicons name="notifications" size={22} color="#E5E7EB" />
            <View style={dot} />
          </TouchableOpacity>
        </View>

        {/* Welcome */}
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>Welcome back, Officer!</Text>
          <Text style={styles.welcomeSub}>
            Your unit is now online and ready for assignment.
          </Text>
        </View>

        {/* Active Operation */}
        <Text style={styles.sectionTitle}>Active Operation</Text>
        {/* Upcoming */}
        <Text style={styles.sectionTitle}>Upcoming Operation</Text>

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

          <View style={styles.dateBox}>
            <Text style={styles.dateText}>Select a date</Text>
            <Ionicons name="calendar-outline" size={18} color="#9CA3AF" />
          </View>
        </View>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {operations
            ? operations?.map((item: any) => {
                return (
                  <TouchableOpacity
                    key={item.activity_id}
                    activeOpacity={0.7}
                    onPress={() => handleNavigate(item)}
                    style={styles.activeCard}
                  >
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.cardTitle}>
                          {item.activity_name}
                        </Text>
                        <Text style={styles.cardSubtitle}>-</Text>
                      </View>

                      <View style={styles.badgeRow}>
                        <Text style={styles.badgeHigh}>High Priority</Text>
                        <Text style={styles.badgeActive}>Active</Text>
                      </View>
                    </View>

                    <View style={styles.cardInfoRow}>
                      <Info
                        label="Start Date"
                        value={formatDateTime(item.start_date)}
                      />
                      <Info
                        label="End Date"
                        value={formatDateTime(item.end_date)}
                      />
                      <Info label="Member" value={`${item.personnel} Member`} />
                    </View>
                  </TouchableOpacity>
                );
              })
            : null}
          {/* Upcoming Cards */}
          <UpcomingCard
            title="VVIP Escort"
            route="Halim Perdana Kusuma International Airport → Istana Negara"
            start="30 November 2025, 10:30"
            end="30 November 2025, 12:30"
            onPress={() => router.push("/(drawer)")}
          />

          <UpcomingCard
            title="VVIP Escort"
            route="Istana Negara → Monas"
            start="30 November 2025, 14:30"
            end="30 November 2025, 16:30"
            onPress={() => router.push("/(drawer)")}
          />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function UpcomingCard({
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
  safe: { flex: 1, backgroundColor: "#020617" },
  container: { flex: 1, paddingHorizontal: 16 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  appTitle: { color: "#E5E7EB", fontSize: 16, fontWeight: "600" },

  welcome: { marginBottom: 10 },
  welcomeTitle: { color: "#F9FAFB", fontSize: 22, fontWeight: "700" },
  welcomeSub: { color: "#9CA3AF", marginTop: 4 },

  sectionTitle: {
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 12,
  },

  activeCard: {
    backgroundColor: "#0B1220",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1D4ED8",
    // marginBottom: 10,
  },

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

  badgeRow: { flexDirection: "row", gap: 8 },

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

  badgeActive: {
    alignItems: "center",
    justifyContent: "center",
    color: whiteColor,
    backgroundColor: greenColor,
    borderWidth: 1,
    borderRadius: 46,
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

  dateBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: strokeColor,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
  },

  dateText: { color: greyColor },
});
