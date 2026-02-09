/* eslint-disable react-hooks/exhaustive-deps */
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { Alert, Button, Text, View } from "react-native";

export default function GPSStatusChecker() {
  const [gpsEnabled, setGpsEnabled] = useState(true);

  useEffect(() => {
    checkGPSStatus();
  }, []);

  const checkGPSStatus = async () => {
    const enabled = await Location.hasServicesEnabledAsync();
    setGpsEnabled(enabled);

    if (!enabled) {
      Alert.alert("GPS is OFF", "Please enable Location / GPS to continue.", [
        {
          text: "Open Settings",
          onPress: openDeviceLocationSettings,
        },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const openDeviceLocationSettings = () => {
    // Opens device Location Settings (Android only)
    Location.enableNetworkProviderAsync?.();
  };

  return (
    <View>
      <Text>GPS Enabled: {gpsEnabled ? "Yes" : "No"}</Text>
      <Button title="Recheck GPS" onPress={checkGPSStatus} />
    </View>
  );
}
