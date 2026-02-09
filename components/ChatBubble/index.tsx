/* eslint-disable react/display-name */
import {
  blueColor,
  greyTextStyle,
  purpleColor,
  strokeColor,
  whiteTextStyle,
} from "@/constants/theme";
import { formatTime } from "@/utils/dayjs";
import { formatUnit } from "@/utils/helpers";
import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Gap from "../Gap";

const ChatBubble = memo(({ message, isMine, isGroup }: any) => {
  const msg = message;
  // console.log(msg);
  return (
    <View
      key={msg.id}
      style={{
        flexDirection: "row",
        width: "50%",
        alignItems: "center",
        alignSelf: isMine ? "flex-end" : "flex-start",
        justifyContent: isMine ? "flex-end" : "flex-start",
        marginBottom: 32,
      }}
    >
      {!isGroup ? (
        <></>
      ) : (
        <>
          <View style={styles.userIcon}>
            <Text style={[whiteTextStyle]}>
              {formatUnit(msg?.username)}
              {/* {extractFirstAndEndingNumber(msg.username)} */}
            </Text>
          </View>
          <Gap width={20} />
        </>
      )}
      <View>
        {isMine ? (
          <></>
        ) : (
          <>
            <Text style={[whiteTextStyle, { fontSize: 16 }]}>
              {msg.username}
            </Text>
            <Gap height={10} />
          </>
        )}
        <View
          style={{
            backgroundColor: isMine ? blueColor : strokeColor,
            padding: 14,
            borderTopStartRadius: isMine ? 5 : 0,
            borderTopEndRadius: isMine ? 0 : 5,
            borderBottomStartRadius: 5,
            borderBottomEndRadius: 5,
          }}
        >
          <Text style={[whiteTextStyle, { fontSize: 16 }]}>{msg.content}</Text>
        </View>
        <Gap height={6} />
        <Text style={[greyTextStyle]}>{formatTime(msg.created_at)}</Text>
      </View>
    </View>
  );
});

export default memo(ChatBubble);

const styles = StyleSheet.create({
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 40 / 2,
    backgroundColor: purpleColor,
    alignItems: "center",
    justifyContent: "center",
  },
});
