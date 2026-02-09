import {
  blueColor,
  navyColor,
  strokeColor,
  whiteColor,
} from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname } from "expo-router";
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
} from "react-native";

type PillTabButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  focused: boolean;
} & PressableProps;

export function PillTabButton({
  icon,
  label,
  focused,
  ...props
}: PillTabButtonProps) {
  return (
    <Pressable {...props} style={styles.buttonWrapper}>
      <View style={[styles.pill, focused && styles.pillActive]}>
        <Ionicons name={icon} size={22} color={whiteColor} />
        <Text style={[styles.label, focused && styles.labelActive]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export default function TabsLayout() {
  const pathname = usePathname();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarButton: (props) => {
            const isFocused = pathname === "/" || pathname === "/index";

            return (
              <PillTabButton
                {...props}
                icon="home-outline"
                label="Home"
                focused={isFocused}
              />
            );
          },
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          tabBarButton: (props) => {
            const isFocused = pathname === "/map";
            return (
              <PillTabButton
                {...props}
                icon="map-outline"
                label="Map"
                focused={isFocused}
              />
            );
          },
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          tabBarButton: (props) => {
            const isFocused = pathname === "/chat";
            return (
              <PillTabButton
                {...props}
                icon="chatbubble-outline"
                label="Chat"
                focused={isFocused}
              />
            );
          },
        }}
      />

      <Tabs.Screen
        name="call"
        options={{
          tabBarButton: (props) => {
            const isFocused = pathname === "/call";
            return (
              <PillTabButton
                {...props}
                icon="call-outline"
                label="Call"
                focused={isFocused}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          tabBarButton: (props) => {
            const isFocused = pathname === "/log";
            return (
              <PillTabButton
                {...props}
                icon="document-text-outline"
                label="Log"
                focused={isFocused}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarButton: (props) => {
            const isFocused = pathname === "/profile";
            return (
              <PillTabButton
                {...props}
                icon="person-outline"
                label="Profile"
                focused={isFocused}
              />
            );
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: navyColor,
    borderTopColor: strokeColor,
    alignItems: "center",
    justifyContent: "space-between",
    height: 78,
    paddingVertical: 10,
    paddingHorizontal: 150,
  },

  buttonWrapper: {
    minWidth: 100,
    minHeight: 72,
    alignItems: "center",
    justifyContent: "center",
  },

  pill: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 8,
  },

  pillActive: {
    backgroundColor: blueColor,
    borderRadius: 10,
  },

  label: {
    fontSize: 11,
    marginTop: 4,
    color: whiteColor,
  },

  labelActive: {
    color: whiteColor,
    fontWeight: "600",
  },
});
