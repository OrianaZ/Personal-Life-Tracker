//general
import dayjs from "dayjs";
import { FlatList, Modal, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

//styles
import { fastingStyles } from "@/components/styles/_fasting.styles";

//theme
import { Colors } from "@/components/theme/Colors";
import { ThemedText } from "@/components/theme/ThemedText";


export default function FastingCalendar({
  fastLog, currentMonth, showTodayButton, scrollToToday, calendarRef, handleScroll,
  editingDate, editingHours, editingMinutes, setEditingDate, setEditingHours, setEditingMinutes, showEditModal, setShowEditModal,
  saveEditedFast, formatDateWithOrdinal
}: any) {
  const today = dayjs();

  return (
    <View style={fastingStyles.container3}>
      <View style={fastingStyles.header}>
        <ThemedText type="title">{currentMonth}</ThemedText>
        {showTodayButton && (
          <TouchableOpacity onPress={scrollToToday}>
            <ThemedText style={fastingStyles.todayButton}>Today</ThemedText>
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
              <View style={[fastingStyles.item, isToday && fastingStyles.todayItem, isFuture && fastingStyles.futureItem]}>
                <ThemedText style={fastingStyles.itemText}>{item.format("ddd")} {item.format("D")}</ThemedText>
                  <ThemedText
                    style={[ fastingStyles.itemHours,
                      isToday
                        ? hours >= 16 ? fastingStyles.todayHours : fastingStyles.todayLowFast
                        : hours >= 16 ? fastingStyles.normalHours : fastingStyles.lowFastHours
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
          <View style={fastingStyles.modalBackground}>
            <TouchableWithoutFeedback>
              <View style={fastingStyles.modalContent}>
                <ThemedText type="default" style={fastingStyles.modalText}>
                  {editingDate ? `How long did you fast on\n${formatDateWithOrdinal(editingDate)}?` : "How long did you fast?"}
                </ThemedText>

                  <View style={fastingStyles.inputRow}>
                    <ThemedText style={{color: Colors.light.purple, fontWeight: 'bold'}}>Hours: </ThemedText>
                    <TextInput
                      keyboardType="decimal-pad"
                      value={editingHours}
                      onChangeText={setEditingHours}
                      style={fastingStyles.editInput}
                      placeholder="Hours"
                      placeholderTextColor={Colors.dark.text}
                    />
                  </View>
                  
                  <View style={fastingStyles.inputRow}>
                    <ThemedText style={{color: Colors.light.blue, fontWeight: 'bold'}}>Minutes: </ThemedText>
                    <TextInput
                      keyboardType="decimal-pad"
                      value={editingMinutes}
                      onChangeText={setEditingMinutes}
                      style={fastingStyles.editInput}
                      placeholder="Minutes"
                      placeholderTextColor={Colors.dark.text}
                    />
                  </View>

                <TouchableOpacity style={[fastingStyles.button, fastingStyles.modalButton]} onPress={saveEditedFast}>
                  <ThemedText style={fastingStyles.buttonText}>Save</ThemedText>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}