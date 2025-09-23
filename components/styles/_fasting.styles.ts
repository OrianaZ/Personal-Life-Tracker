// FastingCalendar.styles.ts
import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 150, justifyContent: 'center',},

  // Last Meal Section
  lastMealContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 12, gap: 10 },
  inputText: { textAlign: "center", fontSize: 16 },

  // Timer & Progress
  container2: { justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: Colors.dark.gray, margin: 20, borderRadius: 12 },
  topText: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, width: "100%" },
  button: { backgroundColor: Colors.light.purple, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, marginTop: 20, width: "100%" },
  buttonText: { fontWeight: "bold", textAlign: "center" },
  
  // Calendar
  container3: { paddingVertical: 20, position: "absolute", bottom: 50, left: 0, right: 0 },  
  header: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10 },
  todayButton: { color: Colors.light.purple, fontWeight: "bold" },
  item: { width: 95, height: 90, marginHorizontal: 5, borderRadius: 8, padding: 10, paddingTop: 15, alignItems: "center", borderWidth: 1, borderColor: Colors.light.borderGray },
  todayItem: { backgroundColor: Colors.light.purple, borderWidth: 0 },
  futureItem: { opacity: 0.6 },
  itemText: { fontWeight: "bold" },
  itemHours: { marginTop: 5, fontWeight: "bold", color: Colors.light.purple },

  todayHours: { color: Colors.dark.purple },
  todayLowFast: { color: Colors.dark.red },
  normalHours: { color: Colors.light.purple },
  lowFastHours: { color: Colors.light.red },

  // Progress Bar
  progressContainer: { flexDirection: "row", alignItems: "center", width: "100%" },
  iconContainer: { alignItems: "center", width: 50 },
  iconTime: { fontSize: 12, marginTop: 4 },
  progressBackground: { flexDirection: "row", width: "68%", height: 12, borderRadius: 6, overflow: "hidden" },

  // Modals
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: Colors.light.background, padding: 20, borderRadius: 12, width: "80%", alignItems: "center" },
  modalText: { marginBottom: 10, color: Colors.dark.text, textAlign: "center" },
  modalButton: { marginTop: 20 },
  inputRow: { flexDirection: "row", alignItems: "center", marginVertical: 8, width: "100%", justifyContent: "space-between", },
  editInput: { borderWidth: 1, borderColor: Colors.light.borderGray, padding: 10, width: "70%", textAlign: "center", borderRadius: 8 },
});
