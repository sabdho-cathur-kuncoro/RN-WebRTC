import { blueColor, whiteColor } from "@/constants/theme";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type PermissionModalProps = {
  visible: boolean;
  title: string;
  description: string;
  primaryText?: string;
  secondaryText?: string;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
};

export const PermissionModal = ({
  visible,
  title,
  description,
  primaryText = "Izinkan",
  secondaryText = "Batal",
  onPrimaryPress,
  onSecondaryPress,
}: PermissionModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          <View style={styles.actions}>
            {onSecondaryPress && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onSecondaryPress}
              >
                <Text style={styles.secondaryText}>{secondaryText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onPrimaryPress}
            >
              <Text style={styles.primaryText}>{primaryText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "50%",
    backgroundColor: whiteColor,
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  secondaryButton: {
    marginRight: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  secondaryText: {
    color: "#666",
  },
  primaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: blueColor,
    borderRadius: 6,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "600",
  },
});
