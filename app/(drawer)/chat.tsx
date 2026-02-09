import ChatBubble from "@/components/ChatBubble";
import Gap from "@/components/Gap";
import { PermissionModal } from "@/components/PermissionModal";
import {
  blueColor,
  greenColor,
  greyColor,
  mainContent,
  purpleColor,
  redColor,
  strokeColor,
  text,
  whiteColor,
  whiteTextStyle,
  yellowColor,
} from "@/constants/theme";
import { useCallPermissions } from "@/hooks/useCallPermissions";
import { useChat } from "@/hooks/useChat";
import { useChatAutoScroll } from "@/hooks/useChatAutoScroll";
import { useSocketStatus } from "@/hooks/useSocketStatus";
import { wait } from "@/utils/helpers";
import { storage } from "@/utils/storage";
import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import "react-native-get-random-values";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function ChatScreen() {
  const userId = storage.getString("user.id");
  // console.log(operation);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [apiLevel, setApiLevel] = useState<number>(35);
  const [showMicModal, setShowMicModal] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const { message, listMessages, selectedConvo, actions } = useChat();
  const status = useSocketStatus();

  const color =
    status === "connected"
      ? greenColor
      : status === "connecting"
      ? yellowColor
      : redColor;
  const { requestMicrophonePermission, handlePermissionBlocked } =
    useCallPermissions();

  const { listRef, handleScroll, handleContentSizeChange } =
    useChatAutoScroll();

  const bottomPosition = useSharedValue(0);

  const reanimatedStyle = useAnimatedStyle(() => {
    const bottom =
      Platform.OS === "android"
        ? bottomPosition.value
        : bottomPosition.value > 0
        ? bottomPosition.value - 32
        : bottomPosition.value;

    return {
      bottom,
    };
  });

  useEffect(() => {
    // actions.onHandleSelectedConvo();
    actions.onGetOpsConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keyboard listener
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      const height = e.endCoordinates.height;
      setKeyboardHeight(height);
      bottomPosition.value = withTiming(apiLevel >= 35 ? height : 0, {
        duration: 300,
      });
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
      bottomPosition.value = withTiming(0, { duration: 400 });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [apiLevel, bottomPosition, listRef]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    wait(1000).then(() => {
      setRefreshing(false);
    });
  }, []);

  const onAcceptCall = async () => {
    const res = await requestMicrophonePermission();

    if (!res.granted) {
      setShowMicModal(true);
      return;
    }

    // acceptIncomingCall(callId);
  };

  return (
    <View
      style={[mainContent, { flex: 0.98, padding: 0, flexDirection: "row" }]}
    >
      {/* Chat Room */}
      <View style={{ width: "100%", flex: 1 }}>
        {selectedConvo === null ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="chatbubble-outline" size={48} color={whiteColor} />
            <Gap height={8} />
            <Text style={[whiteTextStyle, { fontSize: 32 }]}>
              Belum ada percakapan.
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <View style={styles.header}>
              <View
                style={{
                  width: "85%",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View style={styles.groupIcon}>
                  <Feather
                    name={selectedConvo?.is_group ? "users" : "user"}
                    size={20}
                    color={whiteColor}
                  />
                </View>
                <Gap width={20} />
                <View style={{ width: "auto" }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={[whiteTextStyle, text.label]}>
                      {selectedConvo?.display_name}
                    </Text>
                    <Gap width={10} />
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        overflow: "hidden",
                        backgroundColor: color,
                      }}
                    />
                  </View>
                  {/* <Gap height={8} /> */}
                  {/* <Text style={[greyTextStyle]}>4 Member</Text> */}
                </View>
              </View>
              <View style={{ width: "15%", alignItems: "flex-end" }}>
                <TouchableOpacity activeOpacity={0.7} style={styles.btnCall}>
                  <Feather name="phone" size={20} color={whiteColor} />
                </TouchableOpacity>
              </View>
            </View>
            {/* <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior="padding"
              keyboardVerticalOffset={0}
            > */}
            <FlatList
              ref={listRef}
              data={listMessages}
              keyExtractor={(item: any) => item.id.toString()}
              renderItem={({ item }: any) => (
                <ChatBubble
                  message={item}
                  isMine={item.sender_id === parseInt(userId! ?? 0)}
                  isGroup={selectedConvo?.is_group}
                />
              )}
              onScroll={handleScroll}
              onContentSizeChange={handleContentSizeChange}
              scrollEventThrottle={16}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingVertical: 30,
                paddingHorizontal: 20,
                paddingBottom: apiLevel >= 35 ? keyboardHeight + 10 : 56,
              }}
              style={{ flex: 1 }}
            />
            <Animated.View style={[styles.footer, reanimatedStyle]}>
              <TextInput
                value={message}
                onChangeText={(text) => actions.onSetMessage(text)}
                placeholder="Type a message.."
                placeholderTextColor={greyColor}
                style={[{ width: "89%" }, whiteTextStyle]}
              />
              <View
                style={{
                  width: "10%",
                  alignItems: "flex-end",
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.sendIcon}
                  onPress={actions.onHandleSendMessage}
                >
                  <Feather name="send" size={24} color={whiteColor} />
                </TouchableOpacity>
              </View>
            </Animated.View>
            {/* </KeyboardAvoidingView> */}
          </View>
        )}
      </View>
      <PermissionModal
        visible={showMicModal}
        title="Izin Mikrofon Diperlukan"
        description="Untuk memastikan suara Anda dapat terdengar oleh lawan bicara, mohon aktifkan izin mikrofon."
        primaryText="Buka Pengaturan"
        secondaryText="Batal"
        onPrimaryPress={() => {
          setShowMicModal(false);
          handlePermissionBlocked();
        }}
        onSecondaryPress={() => setShowMicModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: strokeColor,
  },
  sidebarContainer: {
    width: "30%",
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: strokeColor,
  },
  footer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1421",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: strokeColor,
  },
  roomChatContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: strokeColor,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 40 / 2,
    backgroundColor: purpleColor,
    alignItems: "center",
    justifyContent: "center",
  },
  groupIcon: {
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    backgroundColor: blueColor,
    alignItems: "center",
    justifyContent: "center",
  },
  btnCall: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: greenColor,
    alignItems: "center",
    justifyContent: "center",
  },
  sendIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: blueColor,
    alignItems: "center",
    justifyContent: "center",
  },
});
