import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import React, { useRef, useState } from "react";
import {
  FlatList, Modal,
  Pressable,
  StyleSheet,
  TextInput, TouchableOpacity, TouchableWithoutFeedback, View
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useFasting } from "@/context/FastingContext";

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
    const index = Math.round(offsetX / 100);
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
          <TimePickerInline
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

      <Calendar
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

// ---------- TimePickerInline ----------
function TimePickerInline({
  value,
  setTempTime,
  setLastMealTime,
}: { 
  value: Date,
  setTempTime: (d: Date) => void;
  setLastMealTime?: (d: Date) => void;

}) {
  const [editingPart, setEditingPart] = useState<"hours" | "minutes" | "date" | null>(null);

  const handleHourChange = (val: string | number) => {
    if (typeof val === "number") {
      const newTime = new Date(value);
      newTime.setHours(val);
      setTempTime(newTime);
      setEditingPart(null);
    }
  };

  const handleMinuteChange = (val: string | number) => {
    if (typeof val === "number") {
      const newTime = new Date(value);
      newTime.setMinutes(val);
      setTempTime(newTime);
      setEditingPart(null);
    }
  };

  const today = new Date()
  const temptoday = new Date();
  temptoday.setDate(temptoday.getDate() + 1);
  const start = new Date(temptoday);

  const dateArray: { date: Date; label: string }[] = [];
  let curr = new Date(start.setFullYear(start.getFullYear() - 1));

  while (curr <= today) {
    dateArray.push({
      date: new Date(curr),
      label: curr.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
      curr.setDate(curr.getDate() + 1);
  }

  return (
    <View style={{ alignItems: "center", position: "relative" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>

        <View style={{ position: "relative" }}>
          <TouchableOpacity onPress={() => setEditingPart(editingPart === "date" ? null : "date")}>
            <ThemedText style={styles.inputText}>{value.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</ThemedText>
          </TouchableOpacity>
          <Modal transparent visible={editingPart === "date"} animationType="fade" onRequestClose={() => setEditingPart(null)}>
            <Pressable style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.3)" }} onPress={() => setEditingPart(null)}>
              <View style={{ position: "absolute", top: 250, left: 240 }}>
                <InlineNumberPicker
                  type="date"
                  data={dateArray}
                  value={value}
                  onChange={(item) => {
                    if (typeof item === "object" && item.date instanceof Date) {
                      setTempTime(item.date);
                      setEditingPart(null);
                    }
                  }}
                  visible={editingPart === "date"}
                />
              </View>
            </Pressable>
          </Modal>
        </View>
        
        <ThemedText style={{fontSize: 18 }}>,</ThemedText>        
        
        <View style={{ position: "relative" }}>
          <TouchableOpacity onPress={() => setEditingPart(editingPart === "hours" ? null : "hours")}>
            <ThemedText style={styles.inputText}>{value.getHours().toString().padStart(2, "0")}</ThemedText>
          </TouchableOpacity>
          <Modal transparent visible={editingPart === "hours"} animationType="fade" onRequestClose={() => setEditingPart(null)}>
            <Pressable style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.3)" }} onPress={() => setEditingPart(null)}>
              <View style={{ position: "absolute", top: 250, left: 280 }}>
                <InlineNumberPicker
                  type="hours"
                  data={Array.from({ length: 24 }, (_, i) => i)}
                  value={value.getHours()}
                  onChange={handleHourChange}
                  visible={editingPart === "hours"}
                />
              </View>
            </Pressable>
          </Modal>
        </View>

        <ThemedText style={{fontSize: 18 }}>:</ThemedText>

        <View style={{ position: "relative" }}>
          <TouchableOpacity onPress={() => setEditingPart(editingPart === "minutes" ? null : "minutes")}>
            <ThemedText style={styles.inputText}>{value.getMinutes().toString().padStart(2, "0")}</ThemedText>
          </TouchableOpacity>
          <Modal transparent visible={editingPart === "minutes"} animationType="fade" onRequestClose={() => setEditingPart(null)}>
            <Pressable style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.3)" }} onPress={() => setEditingPart(null)}>
              <View style={{ position: "absolute", top: 250, left: 320 }}>
                <InlineNumberPicker
                  type="minutes"
                  data={Array.from({ length: 60 }, (_, i) => i)}
                  value={value.getMinutes()}
                  onChange={handleMinuteChange}
                  visible={editingPart === "minutes"}
                />
              </View>
            </Pressable>
          </Modal>
        </View>
      </View>
    </View>
  );
}

// ---------- TimePickerModal Component ----------
function InlineNumberPicker({ 
  type, data, value, onChange, visible,
}: { 
  type: "hours" | "minutes" | "date"; 
  data: any[];
  value: any;
  onChange: (n: any) => void;
  visible: boolean;
}) {
  if (!visible) return null;

  const itemHeight = 40;

  return (
    <View style={{ position: "absolute", top: -itemHeight * 2, width: 80, alignItems: "center", zIndex: 100 }}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => type === "date" ? item.date.toISOString() : item.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        initialScrollIndex={Math.max(0, data.findIndex(d => {
          if (type === "date") {
            return d.date.toDateString() === value.toDateString();
          }
          return d === value;
        }))}
        getItemLayout={(_, index) => ({ length: itemHeight, offset: itemHeight * index, index })}
        style={{ maxHeight: itemHeight * 5, backgroundColor: Colors.dark.gray, borderRadius: 6, paddingVertical: 5, width: 70 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onChange(item)} style={{ height: itemHeight, justifyContent: "center", alignItems: "center"}}>
            <ThemedText style={[
              { fontSize: 16 },
              (type === "date" ? item.date.toDateString() === value.toDateString() : item === value) && { fontWeight: "bold", color: Colors.light.purple }
            ]}>
              {type === "date" ? item.label : item.toString().padStart(2, "0")}
            </ThemedText>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ---------- ProgressBar ----------
function ProgressBar({ progress, isFasting, lastMealTime, formatTime }: any) {
  return (
    <View style={styles.progressContainer}>
      {/* Start Icon */}
      <View style={styles.iconContainer}>
        {isFasting ? (
          <>
            <MaterialCommunityIcons name="clock-outline" size={24} color={Colors.light.blue} />
            <ThemedText style={styles.iconTime}>{formatTime(lastMealTime)}</ThemedText>
          </>
        ) : (
          <>
            <MaterialCommunityIcons name="silverware-fork-knife" size={24} color={Colors.light.orange} />
            <ThemedText style={styles.iconTime}>{formatTime(lastMealTime)}</ThemedText>
          </>
        )}
      </View>

      {/* Progress */}
      <View style={styles.progressBackground}>
        <View style={{ flex: progress, backgroundColor: isFasting ? Colors.light.blue : Colors.light.orange }} />
        <View style={{ flex: 1 - progress, backgroundColor: Colors.light.gray }} />
      </View>

      {/* End Icon */}
      <View style={styles.iconContainer}>
        {isFasting ? (
          <>
            <MaterialCommunityIcons name="silverware-fork-knife" size={24} color={Colors.light.orange} />
            <ThemedText style={styles.iconTime}>
              {formatTime(new Date(lastMealTime.getTime() + 16 * 60 * 60 * 1000))}
            </ThemedText>
          </>
        ) : (
          <>
            <MaterialCommunityIcons name="clock-outline" size={24} color={Colors.light.blue} />
            <ThemedText style={styles.iconTime}>20:00</ThemedText>
          </>
        )}
      </View>
    </View>
  );
}

// ---------- Calendar ----------
function Calendar({
  fastLog, currentMonth, showTodayButton, scrollToToday, calendarRef, handleScroll,
  editingDate, editingHours, editingMinutes, setEditingDate, setEditingHours, setEditingMinutes, showEditModal, setShowEditModal,
  saveEditedFast, formatDateWithOrdinal
}: any) {
  const today = dayjs();

  return (
    <View style={styles.container3}>
      <View style={styles.header}>
        <ThemedText type="title">{currentMonth}</ThemedText>
        {showTodayButton && (
          <TouchableOpacity onPress={scrollToToday}>
            <ThemedText style={styles.todayButton}>Today</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={calendarRef}
        data={Array.from({ length: 730 }, (_, i) => dayjs().subtract(365 - i, "day"))}
        horizontal
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={365}
        getItemLayout={(_, index) => ({ length: 100, offset: 100 * index, index })}
        keyExtractor={(item) => item.format("YYYY-MM-DD")}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          const dateStr = item.format("YYYY-MM-DD");
          const hours = fastLog[dateStr] || 0;
          const isToday = dateStr === today.format("YYYY-MM-DD");
          const isFuture = item.isAfter(today, "day");

          return (
            <TouchableOpacity
              onPress={() => {
                if (isFuture) return;
                const total = fastLog[dateStr] || 0;
                const h = Math.floor(total);
                const m = Math.round((total - h) * 60);

                setEditingDate(dateStr);
                setEditingHours(h.toString());
                setEditingMinutes(m.toString());
                setShowEditModal(true);
              }}
              disabled={isFuture}
            >
              <View style={[styles.item, isToday && styles.todayItem, isFuture && styles.futureItem]}>
                <ThemedText style={styles.itemText}>{item.format("ddd")} {item.format("D")}</ThemedText>
                  <ThemedText
                    style={[ styles.itemHours,
                      isToday
                        ? hours >= 16 ? styles.todayHours : styles.todayLowFast
                        : hours >= 16 ? styles.normalHours : styles.lowFastHours
                    ]}>
                    {fastLog[dateStr] && fastLog[dateStr] > 0
                        ? `${Math.floor(fastLog[dateStr])}h ${Math.round((fastLog[dateStr] - Math.floor(fastLog[dateStr])) * 60)}m` : ""}
                    </ThemedText>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Edit Modal */}
      <Modal visible={showEditModal} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowEditModal(false)}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <ThemedText type="default" style={styles.modalText}>
                  {editingDate ? `How long did you fast on\n${formatDateWithOrdinal(editingDate)}?` : "How long did you fast?"}
                </ThemedText>
                <View style={styles.editInputWrapper}>
                  <ThemedText style={{color: Colors.dark.text, fontWeight: 'bold'}}>h: </ThemedText>
                  <TextInput
                    keyboardType="decimal-pad"
                    value={editingHours}
                    onChangeText={setEditingHours}
                    style={styles.editInput}
                    placeholder="Hours"
                    placeholderTextColor={Colors.dark.text}
                  />
                  <ThemedText style={{color: Colors.dark.text, fontWeight: 'bold'}}>  m: </ThemedText>
                  <TextInput
                    keyboardType="decimal-pad"
                    value={editingMinutes}
                    onChangeText={setEditingMinutes}
                    style={styles.editInput}
                    placeholder="Minutes"
                    placeholderTextColor={Colors.dark.text}
                  />
                </View>
                <TouchableOpacity style={[styles.button, styles.modalButton]} onPress={saveEditedFast}>
                  <ThemedText style={styles.buttonText}>Save</ThemedText>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 150, justifyContent: 'center',},
  lastMealContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 12, gap: 10 },
  inputText: { textAlign: "center", fontSize: 16 },

  // Timer & Progress
  container2: { justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: Colors.dark.gray, margin: 20, borderRadius: 12 },
  topText: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, width: "100%" },
  progressContainer: { flexDirection: "row", alignItems: "center", width: "100%" },
  iconContainer: { alignItems: "center", width: 50 },
  iconTime: { fontSize: 12, marginTop: 4 },
  progressBackground: { flexDirection: "row", width: "68%", height: 12, borderRadius: 6, overflow: "hidden" },
  button: { backgroundColor: Colors.light.purple, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, marginTop: 20, width: "100%" },
  buttonText: { fontWeight: "bold", textAlign: "center" },

  // Calendar
  container3: { paddingVertical: 20, position: "absolute", bottom: 50, left: 0, right: 0 },  
  header: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10 },
  todayButton: { color: Colors.light.purple, fontWeight: "bold" },
  item: { width: 90, height: 90, marginHorizontal: 5, borderRadius: 8, padding: 10, paddingTop: 15, alignItems: "center", borderWidth: 1, borderColor: Colors.light.borderGray },
  todayItem: { backgroundColor: Colors.light.purple, borderWidth: 0 },
  futureItem: { opacity: 0.6 },
  itemText: { fontWeight: "bold" },
  itemHours: { marginTop: 5, fontWeight: "bold", color: Colors.light.purple },

  todayHours: { color: Colors.dark.purple },
  todayLowFast: { color: Colors.dark.red },
  normalHours: { color: Colors.light.purple },
  lowFastHours: { color: Colors.light.red },


  lowFastText: {color: "red", fontWeight: "bold",},
  editInputWrapper: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  editInput: { borderWidth: 1, borderColor: Colors.light.borderGray, padding: 10, width: "40%", textAlign: "center", borderRadius: 8 },

  // Modals
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: Colors.light.background, padding: 20, borderRadius: 12, width: "80%", alignItems: "center" },
  modalText: { marginBottom: 10, color: Colors.dark.text, textAlign: "center" },
  modalButton: { marginTop: 20 },
});
