// general
import React, { useState } from "react";
import { View, Button, Modal,TouchableOpacity, TextInput } from "react-native";

//styles
import { activityStyles } from "@/components/styles/_activity.styles";

//context
import { useHealth } from "@/components/context/ActivityContext";

//theme
import { ThemedText } from "@/components/theme/ThemedText";

//functions
import { StepsProgress } from "@/components/functions/activity/StepsProgress";


export default function ActivityScreen() {
  const { steps, weightEntries, addWeight } = useHealth();
  const [modalVisible, setModalVisible] = useState(false);
  const [inputWeight, setInputWeight] = useState("");

  return (
    <View style={activityStyles.container}>

      {steps !== null && <StepsProgress steps={steps} max={12000} />}

          <View style={activityStyles.weightContainer}>
            <ThemedText style={activityStyles.weightText}>Weight</ThemedText>

            {weightEntries[0] ? (
              <View style={activityStyles.weightRow}>
                <ThemedText>
                  {weightEntries[0].weight.toFixed(1)} lbs
                </ThemedText>
                <ThemedText>
                  {new Date(weightEntries[0].date).toLocaleDateString()}
                </ThemedText>
              </View>
            ) : (
              <ThemedText>Loading...</ThemedText>
            )}

            <ThemedText
              style={activityStyles.reportWeight}
              onPress={() => setModalVisible(true)}
            >
              Report Weight
            </ThemedText>
          </View>

      {/* Modal for weight input */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={activityStyles.modalBackground}>
          <View style={activityStyles.modalContent}>
            <TextInput
              placeholder="Enter weight (lbs)"
              keyboardType="numeric"
              value={inputWeight}
              onChangeText={setInputWeight}
              style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />
          
          <View style={activityStyles.buttonRow}>
                <TouchableOpacity style={activityStyles.cancel} onPress={() => setModalVisible(false)}>
                    <ThemedText style={activityStyles.buttonText}>Cancel</ThemedText>
                </TouchableOpacity>
              <TouchableOpacity style={activityStyles.save}
                    onPress={() => {
                      if (inputWeight) {
                        addWeight(parseFloat(inputWeight));
                        setInputWeight("");
                        setModalVisible(false);
                      }
                    }}
                  >
                  <ThemedText style={activityStyles.buttonText}>Save</ThemedText>
              </TouchableOpacity>
          </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
