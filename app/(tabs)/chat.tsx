import ChatBubble from "@/components/ChatBubble";
import Gap from "@/components/Gap";
import { PermissionModal } from "@/components/PermissionModal";
import {
  bgColor,
  blueColor,
  blueRGBAColor,
  dot,
  greenColor,
  greyColor,
  greyTextStyle,
  line,
  navyColor,
  purpleColor,
  redColor,
  strokeColor,
  text,
  whiteColor,
  whiteTextStyle,
  yellowColor,
} from "@/constants/theme";
import { useCallContext } from "@/contexts/CallContext";
import { useCallPermissions } from "@/hooks/useCallPermissions";
import { useChat } from "@/hooks/useChat";
import { useChatAutoScroll } from "@/hooks/useChatAutoScroll";
import { useSocketStatus } from "@/hooks/useSocketStatus";
import { formatTime } from "@/utils/dayjs";
import { wait } from "@/utils/helpers";
import { storage } from "@/utils/storage";
import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Keyboard,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import "react-native-get-random-values";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const Chat = () => {
  const userId = storage.getString("user.id");
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [apiLevel, setApiLevel] = useState<number>(35);
  const [showMicModal, setShowMicModal] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const { message, listConversations, listMessages, selectedConvo, actions } =
    useChat();
  const status = useSocketStatus();
  const { startOutgoingCall } = useCallContext();

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

  const { height } = useWindowDimensions();

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
    actions.onGetConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    actions.onGetMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConvo]);

  // keyboard listener
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      const height = e.endCoordinates.height;
      setKeyboardHeight(height);
      bottomPosition.value = withTiming(apiLevel >= 35 ? height - 88 : 0, {
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
      actions.onGetConversations();
      setRefreshing(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onStartCall = async (call: any) => {
    // console.log(call);
    const res = await requestMicrophonePermission();

    if (!res.granted) {
      setShowMicModal(true);
      return;
    }

    startOutgoingCall(call.id, call.conversation_id);
  };

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: bgColor,
          paddingHorizontal: 20,
        },
      ]}
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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          flex: 0.98,
        }}
      >
        <View style={styles.sidebarContainer}>
          <Text style={[whiteTextStyle]}>Active Operation</Text>
          <Gap height={8} />
          <TouchableOpacity
            // onPress={() => actions.onHandleSelectedConvo(room)}
            activeOpacity={0.7}
            style={[
              styles.roomChatContainer,
              {
                maxHeight: height * 0.11,
                backgroundColor: navyColor,
                borderBottomWidth: 0,
              },
            ]}
          >
            <View style={{ width: "22%" }}>
              <View style={styles.groupIcon}>
                <Feather name={"users"} size={20} color={whiteColor} />
              </View>
            </View>
            <Gap width={10} />
            <View style={{ width: "65%" }}>
              <Text
                style={[whiteTextStyle, { fontWeight: "700" }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Kawal
              </Text>
              <Text
                style={[whiteTextStyle, { fontWeight: "300" }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                asdasd
              </Text>
            </View>
            <View
              style={{
                width: "10%",
                alignItems: "flex-end",
              }}
            >
              <Text style={[greyTextStyle, { fontSize: 10 }]}>
                {formatTime(new Date())}
              </Text>
            </View>
          </TouchableOpacity>
          <Text style={[whiteTextStyle]}>All Messages</Text>
          <Gap height={8} />
          <View
            style={{
              height: height * 0.57,
            }}
          >
            <ScrollView
              contentContainerStyle={{
                backgroundColor: navyColor,
                flexGrow: 1,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: strokeColor,
              }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {listConversations?.length === 0 ? (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    paddingTop: 100,
                  }}
                >
                  <Ionicons name="list-outline" size={48} color={whiteColor} />
                  <Gap height={8} />
                  <Text style={[whiteTextStyle]}>
                    Daftar percakapan masih kosong.
                  </Text>
                </View>
              ) : (
                listConversations?.map((room: any) => {
                  return (
                    <TouchableOpacity
                      key={`${room?.id} - ${room.conversation_id}`}
                      onPress={() => actions.onHandleSelectedConvo(room)}
                      activeOpacity={0.7}
                      style={[
                        styles.roomChatContainer,
                        {
                          backgroundColor: room.is_open
                            ? blueRGBAColor
                            : "transparent",
                        },
                      ]}
                    >
                      <View style={{ width: "22%" }}>
                        <View style={styles.groupIcon}>
                          <Feather
                            name={room?.is_group ? "users" : "user"}
                            size={20}
                            color={whiteColor}
                          />
                        </View>
                      </View>
                      <Gap width={10} />
                      <View style={{ width: "65%" }}>
                        <Text
                          style={[whiteTextStyle, { fontWeight: "700" }]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {room?.display_name}
                        </Text>
                        <Text
                          style={[whiteTextStyle, { fontWeight: "300" }]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {room?.last_message}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: "10%",
                          alignItems: "flex-end",
                        }}
                      >
                        <Text style={[greyTextStyle, { fontSize: 10 }]}>
                          {formatTime(room?.last_time)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
        {/* Chat Room */}
        <View style={styles.mainContainer}>
          {selectedConvo === null ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="chatbubble-outline"
                size={48}
                color={whiteColor}
              />
              <Gap height={8} />
              <Text style={[whiteTextStyle, { fontSize: 24 }]}>
                Silakan pilih percakapan untuk menampilkan isi pesan.
              </Text>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <View style={styles.headerContent}>
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
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
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
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.btnCall}
                    onPress={() => onStartCall(selectedConvo)}
                  >
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
};

export default Chat;

const styles = StyleSheet.create({
  headerContent: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: strokeColor,
  },
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
  sidebarContainer: {
    width: "29%",
  },
  mainContainer: {
    width: "70%",
    backgroundColor: navyColor,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: strokeColor,
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
