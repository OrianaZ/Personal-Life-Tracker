//general
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, TextInput, TouchableOpacity, View } from "react-native";

//styles
import { medsStyles } from "@/components/styles/_meds.styles";

//context
import { Medication, useMeds, } from "@/components/context/MedsContext";

//theme
import { Colors } from "@/components/theme/Colors";
import { ThemedText } from "@/components/theme/ThemedText";


export default function MedsScreen() {
  const { medications, setMedications, takenTimes, toggleTaken, setTakenTimes } = useMeds();
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

  const openEditModal = (med: any) => {
    setName(med.name);
    setPills(med.pills);
    setTimesPerDay(med.times.length.toString());

    setTimeInputs(
      med.times.map((t: string) => {
        const d = new Date(t); // handles ISO
        if (isNaN(d.getTime())) {
        return { time: "" };
      }
        return {
          time: d.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit" }),
        };
      })
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
          setTakenTimes((prev) => {
            const updated = { ...prev };
            delete updated[editingId];
            return updated;
          });
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
    function localTimeToUTCISO(hhmm: string) {
      const [hh, mm] = hhmm.split(":").map(Number);
      const local = new Date();
      local.setHours(hh, mm, 0, 0);
      return local.toISOString();
    }

    const parsedTimes = timeInputs
      .map((t) => {
        const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(t.time);
        if (!match) return null;
        return localTimeToUTCISO(match[0]);
      })
      .filter((t): t is string => t !== null);


    if (!name || !pills || parsedTimes.length === 0) {
      Alert.alert("Error", "Please fill all fields and times.");
      return;
    }

    const medData: Medication = {
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
        
        const getTodayTime = (isoString: string) => new Date(isoString);

        // Split untaken and taken times
        const untakenTimes = med.times
          .map((t, idx) => ({ time: getTodayTime(t), idx }))
          .filter(({ idx }) => !takenTimes[med.id]?.[idx]);

        const takenTimesList = med.times
          .map((t, idx) => ({ time: getTodayTime(t), idx }))
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
          <View key={med.id} style={[medsStyles.card, allTaken && { opacity: 0.5 }]}>
            {/* LEFT SIDE: edit */}
            <TouchableOpacity style={{ flex: 1 }} onPress={() => openEditModal(med)}>
              <View style={medsStyles.titleContainer}>
                <ThemedText style={medsStyles.cardTitle}>{med.name}</ThemedText>
                <ThemedText style={medsStyles.cardDosage}>
                  {med.pills} pills {med.times.length}x day
                </ThemedText>
              </View>
            </TouchableOpacity>

            {/* RIGHT SIDE: times */}
            <View style={medsStyles.timeContainer}>
              {topTime && (
                <TouchableOpacity
                  onPress={() => toggleTaken(med.id, topTime!.idx)}
                  style={{ flexDirection: "row", alignItems: "center", marginVertical: 2 }}
                >
                  <ThemedText
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                        color: topTime.time < now && !takenTimes[med.id]?.[topTime.idx]
                          ? Colors.light.red
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
                const isOverdue = time < now && !takenTimes[med.id]?.[idx];

                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => toggleTaken(med.id, idx)}
                    style={{ flexDirection: "row", alignItems: "center", marginVertical: 2 }}
                  >
                    <ThemedText
                      style={{
                        fontSize: 14,
                        color: isOverdue ? Colors.light.red : Colors.light.text,
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
        style={medsStyles.addButton}
        onPress={() => {
          resetModal();
          setModalVisible(true);
        }}
      >
        <ThemedText style={medsStyles.buttonText}>Add Medication</ThemedText>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <KeyboardAvoidingView
          style={medsStyles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={medsStyles.form}>
            <TextInput
              style={medsStyles.input}
              placeholder="Medication name"
              placeholderTextColor={Colors.light.placeholder}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={medsStyles.input}
              placeholder="# of pills"
              placeholderTextColor={Colors.light.placeholder}
              value={pills}
              keyboardType="numeric"
              onChangeText={setPills}
            />
            <TextInput
              style={medsStyles.input}
              placeholder="Times per day"
              placeholderTextColor={Colors.light.placeholder}
              value={timesPerDay}
              keyboardType="numeric"
              onChangeText={handleTimesPerDayChange}
            />

            {timeInputs.map((t, idx) => (
              <View key={idx} style={medsStyles.timeRow}>
                <TextInput
                  style={[medsStyles.input, { flex: 1 }]}
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

            <TouchableOpacity style={medsStyles.saveButton} onPress={saveMedication}>
              <ThemedText style={medsStyles.buttonText}>Save</ThemedText>
            </TouchableOpacity>

            {editingId && (
              <TouchableOpacity style={medsStyles.deleteButtonModal} onPress={deleteMedication}>
                <ThemedText style={medsStyles.buttonText}>Delete</ThemedText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={medsStyles.cancelButton}
              onPress={() => {
                resetModal();
                setModalVisible(false);
              }}
            >
              <ThemedText style={medsStyles.buttonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}
