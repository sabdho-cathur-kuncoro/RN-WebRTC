import { blueColor, shadow, whiteColor } from "@/constants/theme";
import React from "react";
import { ColorValue, Text, TouchableHighlight } from "react-native";

type btnType = {
  borderWidth?: number;
  borderColor?: ColorValue;
  borderRadius?: number;
  bgColor?: ColorValue;
  title?: string;
  titleColor?: ColorValue;
  titleWeight?: string;
  indicatorColor?: ColorValue;
  underlayColor?: ColorValue;
  isShadow?: boolean;
  fontSize?: number;
  height?: number;
  onPress?: () => void;
};

const Button = ({
  borderWidth = 0,
  borderColor = blueColor,
  borderRadius = 10,
  bgColor = blueColor,
  title,
  titleColor = whiteColor,
  indicatorColor = whiteColor,
  isShadow = false,
  fontSize = 14,
  height = 50,
  onPress,
}: btnType) => {
  //   const { btnLoading } = useSelector((state: RootState) => state.globalReducer);
  return (
    <TouchableHighlight
      onPress={onPress}
      //   underlayColor={underlayColor}
      activeOpacity={0.7}
      style={[
        isShadow && shadow,
        {
          width: "100%",
          height: height,
          backgroundColor: bgColor,
          borderRadius: borderRadius,
          borderWidth: borderWidth,
          borderColor: borderColor,
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
    >
      <Text
        style={{
          color: titleColor,
          fontSize: fontSize,
          fontWeight: "700",
        }}
      >
        {title}
      </Text>
      {/* {btnLoading ? (
        <ActivityIndicator style={{ marginLeft: 6 }} color={indicatorColor} />
      ) : (
        <Text
          style={{
            color: titleColor,
            fontSize: fontSize,
          }}
        >
          {title}
        </Text>
      )} */}
    </TouchableHighlight>
  );
};

export default Button;
