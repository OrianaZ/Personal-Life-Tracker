import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import React, { useRef, useState } from "react";
import {
  FlatList, Modal,
  TouchableOpacity, TouchableWithoutFeedback, View
} from "react-native";

import { useFasting } from "@/components/context/FastingContext";
import { ThemedText } from "@/components/theme/ThemedText";
import { Colors } from "@/constants/Colors";

import FastingCalendar from "@/components/tabHelpers/Fasting/FastingCalendar";
import LastMealDateTimePicker from "@/components/tabHelpers/Fasting/LastMealDateTimePicker";
import ProgressBar from "@/components/tabHelpers/Fasting/ProgressBar";

import { styles } from "@/components/styles/_fasting.styles";


export default function FastingScreen() {
  const {
    isFasting, timerText, fastStart, lastMealTime, fastLog, pickerTime,
    editingDate, editingHours, editingMinutes, showEditModal,
    setLastMealTime, setPickerTime, setEditingDate, setEditingHours, setEditingMinutes, setShowEditModal,
    handleStartFast, handleEndFast, saveEditedFast
  } = useFasting();

  // ---------- Local UI state ----------
  const [endTempTime, setEndTempTime] = useState(new Date());
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(dayjs().format("MMMM"));
  const [showTodayButton, setShowTodayButton] = useState(false);
  const calendarRef = useRef<FlatList<any>>(null);

  // ---------- Helpers ----------
  const formatTime = (date: Date | dayjs.Dayjs) => {
    const d = dayjs(date);
    return `${d.hour().toString().padStart(2, "0")}:${d.minute().toString().padStart(2, "0")}`;
  };

  const handleEndPickerChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) setEndTempTime(selectedDate);
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / 105);
    setCurrentMonth(dayjs().subtract(365 - index, "day").format("MMMM"));
    setShowTodayButton(index !== 365);
  };

  const scrollToToday = () => calendarRef.current?.scrollToIndex({ index: 365, animated: true });

  const formatDateWithOrdinal = (dateStr: string) => {
  const date = dayjs(dateStr, "YYYY-MM-DD");
  if (!date.isValid()) return "";

  // Hide future dates
  if (date.isAfter(dayjs(), "day")) return "";

  const day = date.date();
  const ordinal = day === 1 || day === 21 || day === 31
    ? "st"
    : day === 2 || day === 22
    ? "nd"
    : day === 3 || day === 23
    ? "rd"
    : "th";

  return `${date.format("MMMM")} ${day}${ordinal}`;
};

  // ---------- Progress ----------
let progress = 0;
const fastStartRef = fastStart ?? lastMealTime;
if (fastStartRef) {
  const now = dayjs();
  if (isFasting) {
    const elapsed = now.diff(fastStartRef, "second");
    const totalFasting = 16 * 60 * 60;
    progress = Math.min(elapsed / totalFasting, 1);
  } else {
    const fastStartToday = dayjs().hour(20).minute(0).second(0);
    const eightHoursBefore = fastStartToday.subtract(8, "hour");
    const now = dayjs();
    const elapsed = now.diff(eightHoursBefore, "second");
    progress = Math.min(Math.max(elapsed / (8 * 60 * 60), 0), 1);
  }
}

  // ---------- JSX ----------
  return (
    <View style={styles.container}>
      {!isFasting && (
        <View style={styles.lastMealContainer}>
          <ThemedText type="subtitle">Last Meal:</ThemedText>
          <LastMealDateTimePicker
            value={pickerTime}
            setTempTime={setPickerTime}
            setLastMealTime={(d: Date) => setLastMealTime(dayjs(d))}
          />
        </View>
      )}

      <View style={styles.container2}>
        <View style={styles.topText}>
          <ThemedText type="subtitle">{isFasting ? "Fasted For" : "Time Until Fast"}</ThemedText>
          <ThemedText type="subtitle">{timerText}</ThemedText>
        </View>

        <ProgressBar
          progress={progress}
          isFasting={isFasting}
          lastMealTime={(fastStartRef ?? dayjs()).toDate()}
          formatTime={formatTime}
        />

        {!isFasting ? (
          <TouchableOpacity style={styles.button} onPress={() => handleStartFast(pickerTime)}>
            <ThemedText style={styles.buttonText}>Start Fast</ThemedText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={() => setShowEndPicker(true)}>
            <ThemedText style={styles.buttonText}>End Fast</ThemedText>
          </TouchableOpacity>
        )}

        <Modal visible={showEndPicker} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setShowEndPicker(false)}>
            <View style={styles.modalBackground}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <ThemedText type="default" style={styles.modalText}>Select fast end time</ThemedText>

                  <DateTimePicker
                    value={endTempTime}
                    mode="datetime"
                    display="default"
                    onChange={handleEndPickerChange}
                    maximumDate={new Date()}
                    textColor={Colors.dark.text}
                  />

                  <TouchableOpacity
                    style={[styles.button, styles.modalButton]}
                    onPress={() => {
                      handleEndFast(endTempTime);
                      setShowEndPicker(false);
                    }}
                  >
                    <ThemedText style={styles.buttonText}>End</ThemedText>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>

      <FastingCalendar
        fastLog={fastLog}
        currentMonth={currentMonth}
        showTodayButton={showTodayButton}
        scrollToToday={scrollToToday}
        calendarRef={calendarRef}
        handleScroll={handleScroll}
        editingDate={editingDate}
        editingHours={editingHours}
        editingMinutes={editingMinutes}
        setEditingDate={setEditingDate}
        setEditingHours={setEditingHours}
        setEditingMinutes={setEditingMinutes}
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        saveEditedFast={saveEditedFast}
        formatDateWithOrdinal={formatDateWithOrdinal}
      />
    </View>
  );
}