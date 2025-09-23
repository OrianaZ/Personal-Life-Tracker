//general
import React, { useState } from "react";
import { Modal, Pressable, TouchableOpacity, View } from "react-native";

//styles
import { fastingStyles } from "@/components/styles/_fasting.styles";

//theme
import { ThemedText } from "@/components/theme/ThemedText";

//functions
import InlineNumberPicker from "./InlineNumberPicker";

export default function LastMealDateTimePicker({
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
            <ThemedText style={fastingStyles.inputText}>{value.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</ThemedText>
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
            <ThemedText style={fastingStyles.inputText}>{value.getHours().toString().padStart(2, "0")}</ThemedText>
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
            <ThemedText style={fastingStyles.inputText}>{value.getMinutes().toString().padStart(2, "0")}</ThemedText>
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