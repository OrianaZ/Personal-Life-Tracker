import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useMeds } from "@/context/MedsContext";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function MedsScreen() {
  const { medications, setMedications } = useMeds();
  const [modalVisible, setModalVisible] = useState(false);

  const [name, setName] = useState("");
  const [pills, setPills] = useState("");
  const [timesPerDay, setTimesPerDay] = useState("");
  const [timeInputs, setTimeInputs] = useState<{ time: string }[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleTimesPerDayChange = (val: string) => {
    setTimesPerDay(val);
    const num = parseInt(val) || 0;
    const newTimes = [];
    for (let i = 0; i < num; i++) {
      newTimes.push(timeInputs[i] || { time: "" });
    }
    setTimeInputs(newTimes);
  };

  const formatTimeInput = (input: string) => {
    const digits = input.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    return digits.slice(0, 2) + ":" + digits.slice(2, 4);
  };

  const parseTime = (t: { time: string }): Date | null => {
    const val = t.time;
    if (!val) return null;
    const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(val);
    if (!match) return null;
    const [, hh, mm] = match;
    const d = new Date();
    d.setHours(parseInt(hh), parseInt(mm), 0, 0);
    return d;
  };

  const openEditModal = (med: any) => {
    setName(med.name);
    setPills(med.pills);
    setTimesPerDay(med.times.length.toString());
    setTimeInputs(
      med.times.map((t: Date) => ({
        time: t.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit" }),
      }))
    );
    setEditingId(med.id);
    setModalVisible(true);
  };

  const deleteMedication = () => {
    if (!editingId) return;
    Alert.alert(
      "Delete Medication",
      "Are you sure you want to delete this medication?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setMedications(medications.filter((med) => med.id !== editingId));
            setModalVisible(false);
            resetModal();
          },
        },
      ]
    );
  };

  const resetModal = () => {
    setName("");
    setPills("");
    setTimesPerDay("");
    setTimeInputs([]);
    setEditingId(null);
  };

  const saveMedication = () => {
    const parsedTimes = timeInputs
      .map((t) => parseTime(t))
      .filter((t): t is Date => t !== null);

    if (!name || !pills || parsedTimes.length === 0) {
      Alert.alert("Error", "Please fill all fields and times.");
      return;
    }

    const medData = {
      id: editingId || Date.now().toString(),
      name,
      pills,
      times: parsedTimes,
    };

    if (editingId) {
      setMedications(
        medications.map((med) => (med.id === editingId ? medData : med))
      );
    } else {
      setMedications([...medications, medData]);
    }

    setModalVisible(false);
    resetModal();
  };

  const getSortedTimes = (med: any) => {
    const now = new Date();
    const upcoming = [...med.times].sort((a, b) => a.getTime() - b.getTime());
    const nextIndex = upcoming.findIndex(
      (t) =>
        t.getHours() > now.getHours() ||
        (t.getHours() === now.getHours() && t.getMinutes() > now.getMinutes())
    );
    if (nextIndex === -1) return upcoming;
    return [...upcoming.slice(nextIndex), ...upcoming.slice(0, nextIndex)];
  };

  return (
    <ScrollView
      style={{ flex: 1, width: "100%" }}
      contentContainerStyle={{ alignItems: "center", paddingBottom: 20 }}
    >
      {medications.map((item) => {
        const sortedTimes = getSortedTimes(item);
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => openEditModal(item)}
          >
            <View style={styles.titleContainer}>
              <ThemedText style={styles.cardTitle}>{item.name}</ThemedText>
              <ThemedText style={styles.cardDosage}>
                {item.pills} pills {sortedTimes.length}x day
              </ThemedText>
            </View>
            <View style={styles.timeContainer}>
              {sortedTimes.map((time: Date, idx: number) => (
                <ThemedText
                  key={idx}
                  style={idx === 0 ? styles.nextTime : styles.otherTime}
                >
                  {time.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit" })}
                </ThemedText>
              ))}
            </View>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          resetModal();
          setModalVisible(true);
        }}
      >
        <ThemedText style={styles.buttonText}>Add Medication</ThemedText>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Medication name"
              placeholderTextColor={Colors.light.placeholder}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="# of pills"
              placeholderTextColor={Colors.light.placeholder}
              value={pills}
              keyboardType="numeric"
              onChangeText={setPills}
            />
            <TextInput
              style={styles.input}
              placeholder="Times per day"
              placeholderTextColor={Colors.light.placeholder}
              value={timesPerDay}
              keyboardType="numeric"
              onChangeText={handleTimesPerDayChange}
            />

            {timeInputs.map((t, idx) => (
              <View key={idx} style={styles.timeRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder={`Time ${idx + 1} (HH:mm)`}
                  placeholderTextColor={Colors.light.placeholder}
                  value={t.time}
                  keyboardType="numeric"
                  onChangeText={(val) => {
                    const newTimes = [...timeInputs];
                    newTimes[idx].time = formatTimeInput(val);
                    setTimeInputs(newTimes);
                  }}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.saveButton} onPress={saveMedication}>
              <ThemedText style={styles.buttonText}>Save</ThemedText>
            </TouchableOpacity>

            {editingId && (
              <TouchableOpacity
                style={styles.deleteButtonModal}
                onPress={deleteMedication}
              >
                <ThemedText style={styles.buttonText}>Delete</ThemedText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                resetModal();
                setModalVisible(false);
              }}
            >
              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  addButton: { backgroundColor: Colors.light.purple, padding: 15, borderRadius: 10, marginTop: 10},
  saveButton: { backgroundColor: Colors.light.purple, padding: 15, borderRadius: 10, marginTop: 15, width: "100%", alignItems: "center",},
  cancelButton: { backgroundColor: "transparent", borderWidth: 1, borderColor: Colors.light.purple, borderRadius: 10, padding: 15, marginTop: 10, width: "100%", alignItems: "center",},
  deleteButtonModal: { backgroundColor: Colors.light.red, padding: 15, borderRadius: 10, marginTop: 10, width: "100%", alignItems: "center", },
  buttonText: { fontWeight: "bold" },
  
  card: { display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: Colors.dark.borderGray, borderRadius: 12, padding: 15, marginVertical: 10, width: "95%",},
  cardTitle: { fontWeight: "bold", fontSize: 18 },
  cardDosage: { color: Colors.light.borderGray, fontStyle: "italic", fontSize: 14, marginBottom: 10 },
  titleContainer: { marginBottom: 0 },
  timeContainer: { alignItems: "flex-end" },
  nextTime: { fontSize: 18, fontWeight: "bold" },
  otherTime: { color: Colors.light.placeholder, fontSize: 14 },

  modalContainer: { flex: 1, backgroundColor: Colors.dark.gray, padding: 20, justifyContent: "center",alignItems: "center", },
  form: { width: "100%", maxWidth: 400, alignItems: "center" },
  input: { borderWidth: 1, borderColor: Colors.dark.borderGray,  color:  Colors.light.text, padding: 10, marginVertical: 10, borderRadius: 8, width: "100%",},
  timeRow: { flexDirection: "row", alignItems: "center", width: "100%", marginVertical: 5 },
});
