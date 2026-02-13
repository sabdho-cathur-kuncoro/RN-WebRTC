import Button from "@/components/Button";
import FocusAwareStatusBar from "@/components/FocusAwareStatusbar";
import Gap from "@/components/Gap";
import {
  greenColor,
  greyTextStyle,
  line,
  mainContent,
  redColor,
  redRGBAColor,
  strokeColor,
  text,
  whiteTextStyle,
} from "@/constants/theme";
import { onGetDetailOperationsService } from "@/services/operations";
import { useOperationStore } from "@/stores/operation.store";
import { formatDate, formatTime } from "@/utils/dayjs";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const DetailOperation = () => {
  const operation = useOperationStore((s) => s.operation);
  const [headerOps, setHeaderOps] = useState<any>(null);
  const [detailOps, setDetailOps] = useState<any>([]);

  useEffect(() => {
    getDetailsOps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getDetailsOps() {
    try {
      const res = await onGetDetailOperationsService(operation!.id);
      // console.log(res);
      setHeaderOps(res?.hd_operation[0]);
      setDetailOps(res?.dt_operation);
    } catch (err) {
      if (__DEV__) {
        console.log(err);
      }
      // no op
    }
  }
  // console.log(detailOps?.hd_activity);
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <FocusAwareStatusBar barStyle={"light-content"} />
      <View style={[mainContent]}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: "70%" }}>
            <Text style={[whiteTextStyle, text.label]}>
              {headerOps?.activity_name ?? "-"}
            </Text>
            <Gap height={10} />
            <Text style={[whiteTextStyle, text.regular]}>-</Text>
          </View>
          <View
            style={{
              width: "29%",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ width: "59%" }}>
              <Button
                title="High Priority"
                height={31}
                bgColor={redRGBAColor}
                borderWidth={1}
                borderColor={redColor}
                borderRadius={6}
                titleColor={redColor}
              />
            </View>
            <View style={{ width: "36%" }}>
              <Button
                title="Active"
                height={31}
                bgColor={greenColor}
                borderRadius={46}
              />
            </View>
          </View>
        </View>
        <Gap height={20} />
        <View style={line} />
        <Gap height={20} />
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={{ width: "auto", marginRight: 10 }}>
            <Text style={[greyTextStyle, text.regular]}>Date</Text>
            <Text style={[whiteTextStyle, text.regular]}>
              {formatDate(headerOps?.start_date)}
            </Text>
          </View>
          <View style={{ width: "auto", marginRight: 10 }}>
            <Text style={[greyTextStyle, text.regular]}>Time</Text>
            <Text style={[whiteTextStyle, text.regular]}>
              {formatTime(headerOps?.start_date)}
            </Text>
          </View>
          <View style={{ width: "auto", marginRight: 10 }}>
            <Text style={[greyTextStyle, text.regular]}>Distance</Text>
            <Text style={[whiteTextStyle, text.regular]}>18.7 km</Text>
          </View>
          <View style={{ width: "auto", marginRight: 10 }}>
            <Text style={[greyTextStyle, text.regular]}>Member</Text>
            <Text style={[whiteTextStyle, text.regular]}>
              {operation?.personnel ?? "0"} Member
            </Text>
          </View>
        </View>
        <Gap height={20} />
        <View
          style={{
            width: "100%",
            padding: 10,
            borderWidth: 1,
            borderColor: strokeColor,
            borderRadius: 10,
          }}
        >
          <Text style={[greyTextStyle, text.regular]}>Operation Details</Text>
          <Gap height={10} />
          <Text
            style={[whiteTextStyle, text.regular, { textAlign: "justify" }]}
          >
            {headerOps?.description}
          </Text>
        </View>
      </View>
      <View style={{ width: "100%" }}>
        <Gap height={20} />
        <Text style={[whiteTextStyle, text.label, { fontSize: 18 }]}>
          Member
        </Text>
        <Gap height={20} />
        <View style={[mainContent]}>
          <View style={styles.headerContent}>
            <View style={[{ width: "15%" }, styles.center]}>
              <Text style={[whiteTextStyle]}>No</Text>
            </View>
            <View style={[{ width: "20%" }]}>
              <Text style={[whiteTextStyle]}>NRP</Text>
            </View>
            <View style={[{ width: "40%" }]}>
              <Text style={[whiteTextStyle]}>Name</Text>
            </View>
            <View style={[{ width: "15%" }]}>
              <Text style={[whiteTextStyle]}>Vehicle</Text>
            </View>
          </View>
          {detailOps.map((data: any, index: any) => {
            return (
              <View key={data.id} style={styles.listContent}>
                <View style={[{ width: "15%" }, styles.center]}>
                  <Text style={[whiteTextStyle]}>{index + 1}</Text>
                </View>
                <View style={[{ width: "20%" }]}>
                  <Text style={[whiteTextStyle]}>{data.nrp}</Text>
                </View>
                <View style={[{ width: "40%" }]}>
                  <Text style={[whiteTextStyle]}>{data.driver}</Text>
                </View>
                <View style={[{ width: "15%" }]}>
                  <Text style={[whiteTextStyle]}>{data.unit_id}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

export default DetailOperation;

const styles = StyleSheet.create({
  headerContent: {
    width: "100%",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: strokeColor,
    borderRadius: 5,
  },
  listContent: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: strokeColor,
  },
  center: {
    alignItems: "center",
  },
});
