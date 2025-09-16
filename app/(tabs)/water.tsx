// WaterScreen.tsx
import { useWater } from "@/components/context/WaterContext";
import { ThemedText } from "@/components/theme/ThemedText";
import { Colors } from "@/constants/Colors";
import dayjs from "dayjs";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

type DailyIntake = {
  water: number;
  soda: number;
};

export default function WaterScreen() {
  const { log, addWater, addSoda, updateIntake, getTodayIntake } = useWater();
  const todayIntake = getTodayIntake();

  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingWater, setEditingWater] = useState("");
  const [editingSoda, setEditingSoda] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(dayjs().format("MMMM"));
  const [showTodayButton, setShowTodayButton] = useState(false);

  const [selectedWater, setSelectedWater] = useState<number | null>(null);
  const [selectedSoda, setSelectedSoda] = useState<number | null>(null);

  const calendarRef = useRef<FlatList<any>>(null);
  const todayKey = dayjs().format("YYYY-MM-DD");

  // Toggle selection
  const toggleWater = (oz: number) => {
    setSelectedWater((prev) => (prev === oz ? null : oz));
  };
  const toggleSoda = (oz: number) => {
    setSelectedSoda((prev) => (prev === oz ? null : oz));
  };

  const confirmSelection = () => {
    if (selectedWater) addWater(selectedWater);
    if (selectedSoda) addSoda(selectedSoda);
    setSelectedWater(null);
    setSelectedSoda(null);
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / 90);
    setCurrentMonth(dayjs().subtract(365 - index, "day").format("MMMM"));
    setShowTodayButton(index !== 365);
  };

  const scrollToToday = () => {
    calendarRef.current?.scrollToIndex({ index: 365, animated: true });
  };

  const formatDateWithOrdinal = (dateStr: string) => {
    const date = dayjs(dateStr, "YYYY-MM-DD");
    if (!date.isValid()) return "";
    const day = date.date();
    const ordinal =
      day === 1 || day === 21 || day === 31
        ? "st"
        : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
        ? "rd"
        : "th";
    return `${date.format("MMMM")} ${day}${ordinal}`;
  };

  const saveEditedIntake = () => {
    if (!editingDate) return;
    updateIntake(editingDate, {
      water: parseInt(editingWater) || 0,
      soda: parseInt(editingSoda) || 0,
    });
    setShowEditModal(false);
    setEditingDate(null);
    setEditingWater("");
    setEditingSoda("");
  };

  const waterOptions = [4, 8, 10, 16, 24];
  const sodaOptions = [
    { name: "Soda", oz: 12 },
    { name: "Diet Coke", oz: 32 },
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* <ThemedText type="title">Water Tracker</ThemedText> */}

        <View style={styles.totalContainer}>
          <ThemedText style={styles.totalTitle}>Total Today:</ThemedText>
          <View style={styles.totalRow}>
            <ThemedText style={[styles.totalValue, { color: Colors.light.purple }]}>
              Soda: {todayIntake.soda}oz
            </ThemedText>
            <ThemedText style={styles.totalSeparator}> | </ThemedText>
            <ThemedText style={[styles.totalValue, { color: Colors.light.blue }]}>
              Water: {todayIntake.water}oz
            </ThemedText>
          </View>
        </View>

        {/* Middle content */}
        <View style={styles.middleContent}>
          <ThemedText style={styles.header}>Soda</ThemedText>
          <View style={styles.buttonRow}>
            {sodaOptions.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      selectedSoda === item.oz ? Colors.light.purple : "transparent",
                    borderColor: Colors.light.purple,
                  },
                ]}
                onPress={() => toggleSoda(item.oz)}
              >
                <ThemedText>
                  {item.name} ({item.oz}oz)
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <ThemedText style={styles.header}>Water</ThemedText>
          <View style={styles.buttonRow}>
            {waterOptions.map((oz) => (
              <TouchableOpacity
                key={oz}
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      selectedWater === oz ? Colors.light.blue : "transparent",
                    borderColor: Colors.light.blue,
                  },
                ]}
                onPress={() => toggleWater(oz)}
              >
                <ThemedText>{oz}oz</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={confirmSelection}>
            <ThemedText style={styles.confirmText}>Confirm</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Calendar */}
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
            getItemLayout={(_, index) => ({ length: 90, offset: 90 * index, index })}
            keyExtractor={(item) => item.format("YYYY-MM-DD")}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => {
              const dateStr = item.format("YYYY-MM-DD");
              const dayLog = log[dateStr] || { water: 0, soda: 0 };
              const isToday = dateStr === todayKey;
              const isFuture = item.isAfter(dayjs(), "day");

              return (
                <TouchableOpacity
                  onPress={() => {
                    if (isFuture) return;
                    setEditingDate(dateStr);
                    setEditingWater(dayLog.water.toString());
                    setEditingSoda(dayLog.soda.toString());
                    setShowEditModal(true);
                  }}
                  disabled={isFuture}
                >
                  <View style={[styles.item, isToday && styles.todayItem, isFuture && styles.futureItem]}>
                    <ThemedText style={styles.itemText}>
                      {item.format("ddd")} {item.format("D")}
                    </ThemedText>
                    <ThemedText style={styles.itemoz}>
                      {dayLog.soda > 0 && (
                        <ThemedText style={{ color: isToday ? Colors.dark.purple : Colors.light.purple }}>
                          {dayLog.soda}
                        </ThemedText>
                      )}
                      {dayLog.soda > 0 && dayLog.water > 0 && <ThemedText>, </ThemedText>}
                      {dayLog.water > 0 && (
                        <ThemedText style={{ color: isToday ? Colors.dark.blue : Colors.light.blue }}>
                          {dayLog.water}
                        </ThemedText>
                      )}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Edit Modal */}
        <Modal visible={showEditModal} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setShowEditModal(false)}>
            <View style={styles.modalBackground}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <ThemedText type="default" style={styles.modalText}>
                    {editingDate
                      ? `Edit intake on\n${formatDateWithOrdinal(editingDate)}`
                      : "Edit intake"}
                  </ThemedText>

                  <View style={styles.inputRow}>
                    <ThemedText style={[styles.label, { color: Colors.light.purple }]}>Soda</ThemedText>
                    <TextInput
                      keyboardType="decimal-pad"
                      value={editingSoda}
                      onChangeText={setEditingSoda}
                      style={[styles.editInput, { borderColor: Colors.light.purple }]}
                      placeholder="soda ounces"
                      placeholderTextColor={Colors.dark.text}
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <ThemedText style={[styles.label, { color: Colors.light.blue }]}>Water</ThemedText>
                    <TextInput
                      keyboardType="decimal-pad"
                      value={editingWater}
                      onChangeText={setEditingWater}
                      style={[styles.editInput, { borderColor: Colors.light.blue }]}
                      placeholder="water ounces"
                      placeholderTextColor={Colors.dark.text}                      
                    />
                  </View>

                  <TouchableOpacity style={[styles.button, styles.modalButton]} onPress={saveEditedIntake}>
                    <ThemedText style={styles.buttonText}>Save</ThemedText>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 2, padding: 20, justifyContent: 'center' },

  // Total Today
  totalContainer: { alignItems: "center", justifyContent: 'center', marginBottom: 30, },
  totalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 8, },
  totalRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "wrap", },
  totalValue: { fontSize: 20, fontWeight: "600", marginHorizontal: 10, },
  totalSeparator: { fontSize: 20, fontWeight: "bold", color: Colors.light.text, },

  // Buttons
  middleContent: { justifyContent: "center", marginBottom: 150,},
  buttonRow: { flexDirection: "row", flexWrap: "wrap", gap:5 },
  button: { padding: 12, borderWidth: 1, borderRadius: 8, margin: 5 },
  confirmButton: { backgroundColor: Colors.light.purple, borderColor: Colors.light.purple, padding: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
  confirmText: { fontWeight: "bold", color: "#fff", fontSize: 16, },

  // Calendar
  container3: { paddingVertical: 20, position: "absolute", bottom: 50, left: 0, right: 0 },
  header: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10, marginTop:10 },
  todayButton: { color: Colors.light.purple, fontWeight: "bold" },
  item: { width: 80, height: 90, marginHorizontal: 5, borderRadius: 8, padding: 10, paddingTop: 15, alignItems: "center", borderWidth: 1, borderColor: Colors.light.borderGray },
  todayItem: { backgroundColor: Colors.light.purple, borderWidth: 0 },
  futureItem: { opacity: 0.6 },
  itemText: { fontWeight: "bold" },
  itemoz: { marginTop: 5, fontWeight: "bold" },

  // Modal
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: Colors.light.background, padding: 20, borderRadius: 12, width: "80%", alignItems: "center" },
  modalText: { marginBottom: 10, color: Colors.dark.text, textAlign: "center" },
  inputRow: { flexDirection: "row", alignItems: "center", marginVertical: 8, width: "100%", justifyContent: "space-between", },
  label: { fontWeight: "bold", fontSize: 16, marginRight: 10, width: 50, textAlign: "right", },
  editInput: { borderWidth: 1, padding: 10, width: "75%", textAlign: "center", borderRadius: 8, marginVertical: 5 },
  modalButton: { marginTop: 20, backgroundColor: Colors.light.purple, borderColor: Colors.light.purple, width: 100},
  buttonText: { fontWeight: "bold", textAlign: "center" },
});
