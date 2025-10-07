// general
import React, { useEffect, useState, useRef } from "react";
import { View, Button, Modal,TouchableOpacity, TextInput } from "react-native";
import dayjs from "dayjs";
import { FlatList } from "react-native";

//styles
import { activityStyles } from "@/components/styles/_activity.styles";

//context
import { useHealth } from "@/components/context/ActivityContext";

//theme
import { ThemedText } from "@/components/theme/ThemedText";
import { Colors } from "@/components/theme/Colors";

//functions
import { StepsProgress } from "@/components/functions/activity/StepsProgress";


export default function ActivityScreen() {
  const { steps, log, weightEntries, addWeight, fetchSteps, refreshData } = useHealth();

  const [modalVisible, setModalVisible] = useState(false);
  const [inputWeight, setInputWeight] = useState("");
    
    const calendarRef = useRef<FlatList<any>>(null);
    const todayKey = dayjs().format("YYYY-MM-DD");
    const [currentMonth, setCurrentMonth] = useState(dayjs().format("MMMM"));
    const [markedLog, setMarkedLog] = useState<{ [date: string]: { steps?: number; weight?: number } }>({});
    const [showTodayButton, setShowTodayButton] = useState(false);


    // auto-sync: occasionally update
    useEffect(() => {
      setMarkedLog(log); // refresh local state from context
    }, [log]);
    
    // auto-refresh every 5 min
     useEffect(() => {
       const interval = setInterval(() => {
         refreshData();
       }, 5 * 60 * 1000);
       return () => clearInterval(interval);
     }, [refreshData]);
    
    
    const handleScroll = (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / 105);
      setCurrentMonth(dayjs().subtract(365 - index, "day").format("MMMM"));
      setShowTodayButton(index !== 365);
    };
    
    const scrollToToday = () => {
      calendarRef.current?.scrollToIndex({ index: 365, animated: true });
    };


  return (
    <View style={activityStyles.container}>
          <View style={activityStyles.notCalendar}>
          {/* Refresh Steps Button */}
          {steps !== null && <StepsProgress steps={steps} max={12000} />}
          <TouchableOpacity style={activityStyles.refresh} onPress={() => fetchSteps && refreshData()}>
            <ThemedText style={{ color: '#fff' }}>Refresh Steps</ThemedText>
          </TouchableOpacity>

          <View style={activityStyles.weightContainer}>
            <ThemedText style={activityStyles.weightText}>Weight</ThemedText>

            {weightEntries[0] ? (
              <View style={activityStyles.weightRow}>
                <ThemedText style={activityStyles.weight}>
                  {weightEntries[0].weight.toFixed(1)} lbs
                </ThemedText>
                <ThemedText style={activityStyles.weightDate}>
                  {new Date(weightEntries[0].date).toLocaleDateString()}
                </ThemedText>
              </View>
            ) : (
              <ThemedText>Loading...</ThemedText>
            )}

            <ThemedText
              style={activityStyles.reportWeight}
              onPress={() => setModalVisible(true)}
            >
              Report Weight
            </ThemedText>
          </View>
      </View>

      {/* Modal for weight input */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={activityStyles.modalBackground}>
          <View style={activityStyles.modalContent}>
            <TextInput
              placeholder="Enter weight (lbs)"
              keyboardType="numeric"
              value={inputWeight}
              onChangeText={setInputWeight}
              style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />
          
          <View style={activityStyles.buttonRow}>
                <TouchableOpacity style={activityStyles.cancel} onPress={() => setModalVisible(false)}>
                    <ThemedText style={activityStyles.buttonText}>Cancel</ThemedText>
                </TouchableOpacity>
              <TouchableOpacity style={activityStyles.save}
                    onPress={() => {
                      if (inputWeight) {
                        addWeight(parseFloat(inputWeight));
                        setInputWeight("");
                        setModalVisible(false);
                        refreshData();
                      }
                    }}
                  >
                  <ThemedText style={activityStyles.buttonText}>Save</ThemedText>
              </TouchableOpacity>
          </View>
          </View>
        </View>
      </Modal>
          
          
          {/* Calendar */}
        <View style={activityStyles.calendarContainer}>
          <View style={activityStyles.header}>
            <ThemedText type="title">{currentMonth}</ThemedText>
            <TouchableOpacity onPress={scrollToToday}>
              <ThemedText style={activityStyles.todayButton}>Today</ThemedText>
            </TouchableOpacity>
          </View>

          <FlatList
            ref={calendarRef}
            data={Array.from({ length: 730 }, (_, i) => dayjs().subtract(365 - i, "day"))}
            horizontal
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={365}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({ length: 105, offset: 105 * index, index })}
            keyExtractor={(item) => item.format("YYYY-MM-DD")}
            renderItem={({ item }) => {
              const dateStr = item.format("YYYY-MM-DD");
              const dayData = markedLog[dateStr] || {};
              const isToday = dateStr === todayKey;
              const isFuture = item.isAfter(dayjs(), "day");

              return (
                <View
                  style={[
                    activityStyles.item,
                    isToday && activityStyles.todayItem,
                    isFuture && activityStyles.futureItem,
                  ]}
                >
                  <ThemedText style={activityStyles.itemText}>
                    {item.format("ddd")} {item.format("D")}
                  </ThemedText>
                  <ThemedText style={[ activityStyles.itemText, { color: isToday ? Colors.dark.purple : Colors.light.purple },]}>
                    {dayData.steps ? `${dayData.steps.toLocaleString()}` : "-"}
                  </ThemedText>
                  <ThemedText style={[ activityStyles.itemText, { color: isToday ? Colors.dark.blue : Colors.light.blue },]}>
                      {dayData.weight ? `${dayData.weight.toFixed(1)}` : ""}
                  </ThemedText>
                </View>
              );
            }}
          />
        </View>
    </View>
  );
}
