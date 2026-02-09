/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { ColorValue, Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";
export const bgColor: ColorValue = "#030712";
export const navyColor: ColorValue = "#101828";
export const blueColor: ColorValue = "#155DFC";
export const strokeColor: ColorValue = "#1E2939";
export const blackColor: ColorValue = "#2A2E33";
export const orangeColor: ColorValue = "#F57C00";
export const darkOrangeColor: ColorValue = "#C78202";
export const tealColor: ColorValue = "#00A8A8";
export const whiteColor: ColorValue = "#FFF";
export const greyColor: ColorValue = "#B3B3B3";
export const darkGreyColor: ColorValue = "#364153";
export const greenColor: ColorValue = "#00A63E";
export const greenRGBAColor: ColorValue = "rgba(78, 191, 116, 0.2)";
export const redColor: ColorValue = "#FC1515";
export const redRGBAColor: ColorValue = "rgba(233, 24, 24, 0.2)";
export const yellowColor: ColorValue = "#FFBA52";
export const yellowRGBAColor: ColorValue = "rgba(255, 186, 82, 0.2)";
export const purpleColor: ColorValue = "#9810FA";
export const purpleRGBAColor: ColorValue = "rgba(152, 16, 250, 0.2)";
export const orangeRGBAColor: ColorValue = "rgba(250, 125, 9, 0.2)";
export const blueRGBAColor: ColorValue = "rgba(56, 149, 207, 0.1)";
export const blackRGBAColor: ColorValue = "rgba(0, 0, 0, 0.2)";

export const blackTextStyle = {
  color: blackColor,
};
export const whiteTextStyle = {
  color: whiteColor,
};
export const greyTextStyle = {
  color: greyColor,
};
export const blueTextStyle = {
  color: blueColor,
};

export const shadow = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 3,
};

export const mainContent = {
  backgroundColor: navyColor,
  padding: 16,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: strokeColor,
};

export const line: any = {
  width: "100%",
  height: 1,
  backgroundColor: strokeColor,
};

export const dot: any = {
  position: "absolute",
  top: 0,
  right: 0,
  backgroundColor: redColor,
  width: 9,
  height: 9,
  borderRadius: 9,
};

export const text: any = {
  label: { fontWeight: "700", fontSize: 16 },
  subLabel: { fontWeight: "600", fontSize: 14 },
  regular: { fontWeight: "400", fontSize: 14 },
};

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
