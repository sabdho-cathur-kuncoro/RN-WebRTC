import {
  blackTextStyle,
  blueColor,
  blueTextStyle,
  text,
  whiteColor,
} from "@/constants/theme";
import { storage } from "@/utils/storage";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import Gap from "../Gap";

type VehicleItemProps = {
  item: any;
  index: number;
  selectedId: number | null;
  highlight: any;
  onPress: () => void;
};

export const VehicleItem: React.FC<VehicleItemProps> = ({
  item,
  selectedId,
  highlight,
  onPress,
}) => {
  const device_id = item?.popup.split(" ")[1];
  const uname = storage.getString("user.username");
  const currentUser = device_id === uname;
  const isSelected = selectedId === item.id;

  const animatedStyle = useAnimatedStyle(() => {
    if (!isSelected) {
      return {
        opacity: 1,
        transform: [{ scale: 1 }],
      };
    }

    const scale = 1 + 0.03 * highlight.value;

    return {
      transform: [{ scale }],
    };
  }, [isSelected]);

  return (
    <Animated.View
      style={[
        styles.cardVehicle,
        isSelected && styles.cardVehicleSelected,
        animatedStyle,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        style={{ flexDirection: "row", alignItems: "center" }}
        onPress={onPress}
      >
        <Image
          source={
            currentUser
              ? require("@/assets/images/vehicle-user.png")
              : require("@/assets/images/vehicle.png")
          }
          style={{ width: 40, height: 40, resizeMode: "cover" }}
        />
        <Gap width={14} />
        <View>
          <Text style={[blackTextStyle, text.label]}>{device_id}</Text>
          {currentUser ? <Text style={[blueTextStyle]}>(You)</Text> : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardVehicle: {
    borderRadius: 5,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: whiteColor,
    marginRight: 12,
    minWidth: 158,
  },

  cardVehicleSelected: {
    borderColor: blueColor,
    backgroundColor: "#E8F2FF",
  },
});
