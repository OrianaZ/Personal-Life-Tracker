//general
import dayjs from "dayjs";
import React, { useRef, useState } from "react";
import { FlatList, Modal, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

//styles
import { waterStyles } from "@/components/styles/_water.styles";

//context
import { useWater } from "@/components/context/WaterContext";

//theme
import { Colors } from "@/components/theme/Colors";
import { ThemedText } from "@/components/theme/ThemedText";

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
    const index = Math.round(offsetX / 95);
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
      <View style={waterStyles.container}>
        {/* <ThemedText type="title">Water Tracker</ThemedText> */}

        <View style={waterStyles.totalContainer}>
          <ThemedText style={waterStyles.totalTitle}>Total Today:</ThemedText>
          <View style={waterStyles.totalRow}>
            <ThemedText style={[waterStyles.totalValue, { color: Colors.light.purple }]}>
              Soda: {todayIntake.soda}oz
            </ThemedText>
            <ThemedText style={waterStyles.totalSeparator}> | </ThemedText>
            <ThemedText style={[waterStyles.totalValue, { color: Colors.light.blue }]}>
              Water: {todayIntake.water}oz
            </ThemedText>
          </View>
        </View>

        {/* Middle content */}
        <View style={waterStyles.middleContent}>
          <ThemedText style={waterStyles.header}>Soda</ThemedText>
          <View style={waterStyles.buttonRow}>
            {sodaOptions.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[
                  waterStyles.button,
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

          <ThemedText style={waterStyles.header}>Water</ThemedText>
          <View style={waterStyles.buttonRow}>
            {waterOptions.map((oz) => (
              <TouchableOpacity
                key={oz}
                style={[
                  waterStyles.button,
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

          <TouchableOpacity style={waterStyles.confirmButton} onPress={confirmSelection}>
            <ThemedText style={waterStyles.confirmText}>Confirm</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={waterStyles.container3}>
          <View style={waterStyles.header}>
            <ThemedText type="title">{currentMonth}</ThemedText>
            {showTodayButton && (
              <TouchableOpacity onPress={scrollToToday}>
                <ThemedText style={waterStyles.todayButton}>Today</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            ref={calendarRef}
            data={Array.from({ length: 730 }, (_, i) => dayjs().subtract(365 - i, "day"))}
            horizontal
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={365}
            getItemLayout={(_, index) => ({ length: 95, offset: 95 * index, index })}
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
                  <View style={[waterStyles.item, isToday && waterStyles.todayItem, isFuture && waterStyles.futureItem]}>
                    <ThemedText style={waterStyles.itemText}>
                      {item.format("ddd")} {item.format("D")}
                    </ThemedText>
                    <ThemedText style={waterStyles.itemoz}>
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
            <View style={waterStyles.modalBackground}>
              <TouchableWithoutFeedback>
                <View style={waterStyles.modalContent}>
                  <ThemedText type="default" style={waterStyles.modalText}>
                    {editingDate
                      ? `Edit intake on\n${formatDateWithOrdinal(editingDate)}`
                      : "Edit intake"}
                  </ThemedText>

                  <View style={waterStyles.inputRow}>
                    <ThemedText style={[waterStyles.label, { color: Colors.light.purple }]}>Soda</ThemedText>
                    <TextInput
                      keyboardType="decimal-pad"
                      value={editingSoda}
                      onChangeText={setEditingSoda}
                      style={[waterStyles.editInput, { borderColor: Colors.light.purple }]}
                      placeholder="soda ounces"
                      placeholderTextColor={Colors.dark.text}
                    />
                  </View>

                  <View style={waterStyles.inputRow}>
                    <ThemedText style={[waterStyles.label, { color: Colors.light.blue }]}>Water</ThemedText>
                    <TextInput
                      keyboardType="decimal-pad"
                      value={editingWater}
                      onChangeText={setEditingWater}
                      style={[waterStyles.editInput, { borderColor: Colors.light.blue }]}
                      placeholder="water ounces"
                      placeholderTextColor={Colors.dark.text}                      
                    />
                  </View>

                  <TouchableOpacity style={[waterStyles.button, waterStyles.modalButton]} onPress={saveEditedIntake}>
                    <ThemedText style={waterStyles.buttonText}>Save</ThemedText>
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
