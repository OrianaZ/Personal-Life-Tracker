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
  View,
} from "react-native";

export default function MedsScreen() {
  const { medications, setMedications, takenTimes, toggleTaken } = useMeds();
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
    Alert.alert("Delete Medication", "Are you sure you want to delete this medication?", [
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
    ]);
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
      setMedications(medications.map((med) => (med.id === editingId ? medData : med)));
    } else {
      setMedications([...medications, medData]);
    }

    setModalVisible(false);
    resetModal();
  };

  return (
    <ScrollView
      style={{ flex: 1, width: "100%" }}
      contentContainerStyle={{ alignItems: "center", paddingBottom: 20 }}
    >
      {medications.map((med) => {
        const takenArray = takenTimes[med.id] || Array(med.times.length).fill(false);
        const allTaken = takenArray.every(Boolean);
        const now = new Date();

        // Split untaken and taken times
        const untakenTimes = med.times
          .map((t: Date, idx: number) => ({ time: t, idx }))
          .filter(({ idx }) => !takenTimes[med.id]?.[idx]);
        const takenTimesList = med.times
          .map((t: Date, idx: number) => ({ time: t, idx }))
          .filter(({ idx }) => takenTimes[med.id]?.[idx]);

        // Split untaken into past/future
        const pastUntaken = untakenTimes.filter(({ time }) => {
          const todayTime = new Date();
          todayTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
          return todayTime < now;
        });
        const futureUntaken = untakenTimes.filter(({ time }) => {
          const todayTime = new Date();
          todayTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
          return todayTime >= now;
        });

        const pastUntakenSorted = pastUntaken.sort((a, b) => a.time.getTime() - b.time.getTime());
        const futureUntakenSorted = futureUntaken.sort((a, b) => a.time.getTime() - b.time.getTime());

        // Determine top time
        let topTime: { time: Date; idx: number } | null = null;
        let remainingUntaken: { time: Date; idx: number }[] = [];

        if (pastUntakenSorted.length > 0) {
          topTime = pastUntakenSorted[0];
          remainingUntaken = [...pastUntakenSorted.slice(1), ...futureUntakenSorted];
        } else if (futureUntakenSorted.length > 0) {
          topTime = futureUntakenSorted[0];
          remainingUntaken = [...futureUntakenSorted.slice(1)];
        }

        return (
          <View key={med.id} style={[styles.card, allTaken && { opacity: 0.5 }]}>
            {/* LEFT SIDE: edit */}
            <TouchableOpacity style={{ flex: 1 }} onPress={() => openEditModal(med)}>
              <View style={styles.titleContainer}>
                <ThemedText style={styles.cardTitle}>{med.name}</ThemedText>
                <ThemedText style={styles.cardDosage}>
                  {med.pills} pills {med.times.length}x day
                </ThemedText>
              </View>
            </TouchableOpacity>

            {/* RIGHT SIDE: times */}
            <View style={styles.timeContainer}>
              {topTime && (
                <TouchableOpacity
                  onPress={() => toggleTaken(med.id, topTime!.idx)}
                  style={{ flexDirection: "row", alignItems: "center", marginVertical: 2 }}
                >
                  <ThemedText
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color:
                        topTime.time < now && !takenTimes[med.id]?.[topTime.idx]
                          ? "red"
                          : Colors.light.text,
                      textDecorationLine: takenTimes[med.id]?.[topTime.idx] ? "line-through" : "none",
                    }}
                  >
                    {topTime.time.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit" })}
                  </ThemedText>
                  {takenTimes[med.id]?.[topTime.idx] && <ThemedText style={{ marginLeft: 8 }}>✔️</ThemedText>}
                </TouchableOpacity>
              )}

              {remainingUntaken.map(({ time, idx }) => {
                const todayTime = new Date();
                todayTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
                const isOverdue = todayTime < now && !takenTimes[med.id]?.[idx];

                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => toggleTaken(med.id, idx)}
                    style={{ flexDirection: "row", alignItems: "center", marginVertical: 2 }}
                  >
                    <ThemedText
                      style={{
                        fontSize: 14,
                        color: isOverdue ? "red" : Colors.light.text,
                        textDecorationLine: takenTimes[med.id]?.[idx] ? "line-through" : "none",
                      }}
                    >
                      {time.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit" })}
                    </ThemedText>
                    {takenTimes[med.id]?.[idx] && <ThemedText style={{ marginLeft: 8 }}>✔️</ThemedText>}
                  </TouchableOpacity>
                );
              })}

              {takenTimesList.map(({ time, idx }) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => toggleTaken(med.id, idx)}
                  style={{ flexDirection: "row", alignItems: "center", marginVertical: 2 }}
                >
                  <ThemedText
                    style={{
                      fontSize: 14,
                      color: Colors.light.placeholder,
                      textDecorationLine: "line-through",
                    }}
                  >
                    {time.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit" })}
                  </ThemedText>
                  <ThemedText style={{ marginLeft: 8 }}>✔️</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
              <TouchableOpacity style={styles.deleteButtonModal} onPress={deleteMedication}>
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
  addButton: { backgroundColor: Colors.light.purple, padding: 15, borderRadius: 10, marginTop: 10 },
  saveButton: { backgroundColor: Colors.light.purple, padding: 15, borderRadius: 10, marginTop: 15, width: "100%", alignItems: "center" },
  cancelButton: { backgroundColor: "transparent", borderWidth: 1, borderColor: Colors.light.purple, borderRadius: 10, padding: 15, marginTop: 10, width: "100%", alignItems: "center" },
  deleteButtonModal: { backgroundColor: Colors.light.red, padding: 15, borderRadius: 10, marginTop: 10, width: "100%", alignItems: "center" },
  buttonText: { fontWeight: "bold" },

  card: { display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: Colors.dark.borderGray, borderRadius: 12, padding: 15, marginVertical: 10, width: "95%" },
  cardTitle: { fontWeight: "bold", fontSize: 18 },
  cardDosage: { color: Colors.light.borderGray, fontStyle: "italic", fontSize: 14, marginBottom: 10 },
  titleContainer: { marginBottom: 0 },
  timeContainer: { alignItems: "flex-end" },

  modalContainer: { flex: 1, backgroundColor: Colors.dark.gray, padding: 20, justifyContent: "center", alignItems: "center" },
  form: { width: "100%", maxWidth: 400, alignItems: "center" },
  input: { borderWidth: 1, borderColor: Colors.dark.borderGray, color: Colors.light.text, padding: 10, marginVertical: 10, borderRadius: 8, width: "100%" },
  timeRow: { flexDirection: "row", alignItems: "center", width: "100%", marginVertical: 5 },
});
