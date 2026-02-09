// CallScreen.tsx
import Gap from "@/components/Gap";
import {
  blueColor,
  darkGreyColor,
  darkOrangeColor,
  greenColor,
  greyColor,
  greyTextStyle,
  navyColor,
  redColor,
  strokeColor,
  text,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const participants = [
  { id: "1", tab: "Tab01", name: "Rahmad Prakoso", status: "idle" },
  // { id: "2", tab: "Tab02", name: "Dimas Arya Putra (You)", status: "speaking" },
  // { id: "3", tab: "Tab03", name: "Andika Wirawan", status: "idle" },
  // { id: "4", tab: "Tab04", name: "Yusuf Alamsyah", status: "muted" },
  // { id: "5", tab: "Tab05", name: "Galih Ginandar", status: "muted" },
  // { id: "6", tab: "Tab06", name: "Dani Sutejo", status: "idle" },
  // { id: "7", tab: "Tab07", name: "Andri Rayelo", status: "speaking" },
  // { id: "8", tab: "Tab08", name: "Ahmad Joko", status: "muted" },
  // { id: "9", tab: "Tab09", name: "Fajar Priyadi", status: "calling" },
  // { id: "10", tab: "Tab10", name: "Ahmad Sunandar", status: "calling" },
];

export default function CallScreen() {
  const totalParticipants = participants.length;
  const columns = Math.min(Math.max(totalParticipants, 1), 4);

  return (
    <View style={styles.main}>
      {/* Top header */}
      <View style={styles.mainHeader}>
        <View
          style={{ width: "85%", flexDirection: "row", alignItems: "center" }}
        >
          <View style={styles.groupIcon}>
            <Feather name="users" size={20} color={whiteColor} />
          </View>
          <Gap width={20} />
          <View style={{ width: "auto" }}>
            <Text style={[whiteTextStyle, text.label]}>VVIP Escort</Text>
            <Gap height={8} />
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[greyTextStyle]}>8 Connected</Text>
              <View style={styles.dot} />
              <Text style={[greyTextStyle]}>2 Calling</Text>
            </View>
          </View>
        </View>

        <View style={{ width: "15%", alignItems: "flex-end" }}>
          <Text style={[whiteTextStyle, text.label]}>00:45</Text>
        </View>
      </View>

      {totalParticipants === 1 ? (
        // 1 PARTICIPANT
        <View style={styles.singleWrapper}>
          <ParticipantCard {...participants[0]} mode="single" />
        </View>
      ) : totalParticipants === 2 ? (
        // 2 PARTICIPANTS → side-by-side, both fill width+height
        <View style={styles.doubleWrapper}>
          {participants.map((p) => (
            <ParticipantCard key={p.id} {...p} mode="double" />
          ))}
        </View>
      ) : totalParticipants === 3 ? (
        // 3 PARTICIPANTS: 2 on top, 1 centered below
        <View style={styles.tripleWrapper}>
          <View style={styles.tripleRowTop}>
            <ParticipantCard {...participants[0]} mode="tripleTop" />
            <ParticipantCard {...participants[1]} mode="tripleTop" />
          </View>
          <View style={styles.tripleRowBottom}>
            <ParticipantCard {...participants[2]} mode="tripleBottom" />
          </View>
        </View>
      ) : totalParticipants === 4 ? (
        // 4 PARTICIPANTS: 2x2 grid, fit width & height
        <View style={styles.quadWrapper}>
          <View style={styles.quadRow}>
            <ParticipantCard {...participants[0]} mode="quad" />
            <ParticipantCard {...participants[1]} mode="quad" />
          </View>
          <View style={styles.quadRow}>
            <ParticipantCard {...participants[2]} mode="quad" />
            <ParticipantCard {...participants[3]} mode="quad" />
          </View>
        </View>
      ) : (
        // 4+ PARTICIPANTS: scrollable grid
        <FlatList
          data={participants}
          key={columns} // force re-render when columns change
          numColumns={columns}
          columnWrapperStyle={styles.rowWrap}
          renderItem={({ item }) => <ParticipantCard {...item} mode="grid" />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatlistContent}
        />
      )}

      {/* Bottom call controls */}
      <View style={styles.bottomBar}>
        <View style={{ flex: 1 }} />

        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.roundControl}>
            <Ionicons name="mic-outline" size={24} color="#E5E7EB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roundControl, styles.hangupButton]}
            onPress={() => router.back()}
          >
            <Ionicons name="call" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.roundControl}>
            <MaterialIcons name="volume-up" size={24} color="#E5E7EB" />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />
      </View>
    </View>
  );
}

type CardMode =
  | "single"
  | "double"
  | "tripleTop"
  | "tripleBottom"
  | "quad"
  | "grid";

type CardProps = (typeof participants)[number] & {
  mode: CardMode;
};

function ParticipantCard({ tab, name, status, mode }: CardProps) {
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });

  const isSingle = mode === "single";
  const isDouble = mode === "double";
  const isTripleTop = mode === "tripleTop";
  const isTripleBottom = mode === "tripleBottom";
  const isQuad = mode === "quad";

  const isSpeaking = status === "speaking";
  const isCalling = status === "calling";
  const isMuted = status === "muted";

  const borderColor = isSpeaking
    ? greenColor
    : isCalling
    ? darkOrangeColor
    : "transparent";

  const circleBg = isSpeaking
    ? greenColor
    : isCalling
    ? darkOrangeColor
    : blueColor;

  const BASE_WIDTH = 260;
  const BASE_HEIGHT = 320;

  const scale = useMemo(() => {
    if (!cardSize.width || !cardSize.height) return 1;

    const wRatio = cardSize.width / BASE_WIDTH;
    const hRatio = cardSize.height / BASE_HEIGHT;
    // clamp biar ga terlalu kecil/besar
    return Math.max(0.6, Math.min(Math.min(wRatio, hRatio), 1.4));
  }, [cardSize]);

  const avatarSize = 72 * scale;
  const nameFontSize = 14 * scale;
  const tagFontSize = 12 * scale;
  const micSize = 24 * scale;

  return (
    <View
      style={[
        styles.card,
        isSingle && styles.cardSingle,
        isDouble && styles.cardDouble,
        (isTripleTop || isQuad) && styles.cardQuadLike,
        isTripleBottom && styles.cardTripleBottom,
        { borderColor },
      ]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setCardSize({ width, height });
      }}
    >
      <View
        style={[
          styles.avatarCircle,
          {
            backgroundColor: circleBg,
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          },
        ]}
      >
        <Text style={[styles.avatarText, { fontSize: tagFontSize }]}>
          {tab}
        </Text>
      </View>

      <Text
        style={[styles.cardName, { fontSize: nameFontSize }]}
        numberOfLines={1}
      >
        {name}
      </Text>

      <View style={styles.cardFooter}>
        {isCalling ? (
          <Text style={[styles.callingText, { fontSize: tagFontSize }]}>
            Calling...
          </Text>
        ) : (
          <Ionicons
            name={isMuted ? "mic-off-outline" : "mic-outline"}
            size={micSize}
            color={isMuted ? redColor : isSpeaking ? greenColor : whiteColor}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 0.95,
    backgroundColor: navyColor,
    borderRadius: 10,
  },
  mainHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: strokeColor,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: greyColor,
    marginHorizontal: 10,
  },
  roomTitle: {
    color: "#E5E7EB",
    fontSize: 18,
    fontWeight: "600",
  },
  roomSubtitle: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 2,
  },
  // 1 participant
  singleWrapper: {
    flex: 1,
    padding: 20,
  },
  // 2 participants side-by-side, fill height
  doubleWrapper: {
    flex: 1,
    flexDirection: "row",
    padding: 12,
    gap: 12,
  },
  // 3 participants: 2 top, 1 bottom centered
  tripleWrapper: {
    flex: 1,
    paddingHorizontal: 12,
  },
  tripleRowTop: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  tripleRowBottom: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "stretch",
  },
  // 4 participants → 2x2 grid, full area
  quadWrapper: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 6,
  },
  quadRow: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  // 4+ participants grid
  flatlistContent: {
    padding: 12,
    paddingBottom: 20,
  },
  rowWrap: {
    justifyContent: "center",
    gap: 12,
  },
  // base card
  card: {
    // width: "23%", // 4 per row on tablet-ish
    alignItems: "center",
    minWidth: 190,
    minHeight: 250,
    // aspectRatio: 3 / 4,
    backgroundColor: strokeColor,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    justifyContent: "center",
  },
  // 1 participant → full
  cardSingle: {
    flex: 1,
    width: "100%",
    aspectRatio: undefined,
  },
  // 2 participants → each fill half row + full height
  cardDouble: {
    flex: 1,
    aspectRatio: undefined,
  },
  // 3 top & 4-grid → perilaku sama: bagi rata row & tinggi
  cardQuadLike: {
    flex: 1,
    aspectRatio: undefined,
  },
  // 3 participants bottom → centered, a bit narrower
  cardTripleBottom: {
    flex: 0.6,
    alignSelf: "stretch",
    aspectRatio: undefined,
  },
  avatarCircle: {
    // width: 100,
    // height: 100,
    // borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  avatarText: {
    color: whiteColor,
    fontWeight: "600",
  },
  cardName: {
    color: whiteColor,
    fontSize: 16,
  },
  cardFooter: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  callingText: {
    color: darkOrangeColor,
    // fontSize: 12,
  },

  // BOTTOM BAR
  bottomBar: {
    height: 72,
    borderTopWidth: 1,
    borderTopColor: strokeColor,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  roundControl: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: darkGreyColor,
    alignItems: "center",
    justifyContent: "center",
  },
  hangupButton: {
    backgroundColor: redColor,
  },
  groupIcon: {
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    backgroundColor: blueColor,
    alignItems: "center",
    justifyContent: "center",
  },
});
