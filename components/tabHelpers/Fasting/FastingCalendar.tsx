import { Colors } from "@/constants/Colors";
import dayjs from "dayjs";
import { FlatList, Modal, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { ThemedText } from "../../theme/ThemedText";

import { styles } from "@/components/styles/_fasting.styles";


export default function FastingCalendar({
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
        getItemLayout={(_, index) => ({ length: 105, offset: 105 * index, index })}
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

                  <View style={styles.inputRow}>
                    <ThemedText style={{color: Colors.light.purple, fontWeight: 'bold'}}>Hours: </ThemedText>
                    <TextInput
                      keyboardType="decimal-pad"
                      value={editingHours}
                      onChangeText={setEditingHours}
                      style={styles.editInput}
                      placeholder="Hours"
                      placeholderTextColor={Colors.dark.text}
                    />
                  </View>
                  
                  <View style={styles.inputRow}>
                    <ThemedText style={{color: Colors.light.blue, fontWeight: 'bold'}}>Minutes: </ThemedText>
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