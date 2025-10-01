// screens/ActivityScreen.tsx
import React, { useState } from "react";
import { View, Button, Modal, TextInput } from "react-native";
import { activityStyles } from "@/components/styles/_activity.styles";
import { ThemedText } from "@/components/theme/ThemedText";
import { StepsProgress } from "@/components/functions/activity/StepsProgress";
import { useHealth } from "@/components/context/ActivityContext";

export default function ActivityScreen() {
  const { steps, weightEntries, addWeight } = useHealth();
  const [modalVisible, setModalVisible] = useState(false);
  const [inputWeight, setInputWeight] = useState("");

  return (
    <View style={activityStyles.container}>

      {steps !== null && <StepsProgress steps={steps} max={12000} />}

          <View style={activityStyles.metricContainer}>
            <ThemedText style={activityStyles.metricLabel}>Weight</ThemedText>

            {weightEntries[0] ? (
              <View style={{ flexDirection: "row", justifyContent: "space-between", width: 140 }}>
                <ThemedText style={{ fontSize: 14, color: "white" }}>
                  {weightEntries[0].weight.toFixed(1)} lbs
                </ThemedText>
                <ThemedText style={{ fontSize: 14, color: "white" }}>
                  {new Date(weightEntries[0].date).toLocaleDateString()}
                </ThemedText>
              </View>
            ) : (
              <ThemedText style={{ fontSize: 14 }}>Loading...</ThemedText>
            )}

            <ThemedText
              style={{ fontSize: 14, marginTop: 4, color: "#4DA6FF" }}
              onPress={() => setModalVisible(true)}
            >
              Report Weight
            </ThemedText>
          </View>

      {/* Modal for weight input */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#00000077" }}>
          <View style={{ backgroundColor: "white", padding: 20, borderRadius: 12 }}>
            <TextInput
              placeholder="Enter weight (lbs)"
              keyboardType="numeric"
              value={inputWeight}
              onChangeText={setInputWeight}
              style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />
            <Button
              title="Save"
              onPress={() => {
                if (inputWeight) {
                  addWeight(parseFloat(inputWeight));
                  setInputWeight("");
                  setModalVisible(false);
                }
              }}
            />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
