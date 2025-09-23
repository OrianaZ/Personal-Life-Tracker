import { Colors } from "@/components/theme/Colors";
import { StyleSheet } from "react-native";

export const waterStyles = StyleSheet.create({
  container: { flex: 2, padding: 20, justifyContent: 'center' },

  // Total Today
  totalContainer: { alignItems: "center", justifyContent: 'center', marginBottom: 30, },
  totalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 8, },
  totalRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "wrap", },
  totalValue: { fontSize: 20, fontWeight: "600", marginHorizontal: 10, },
  totalSeparator: { fontSize: 20, fontWeight: "bold", color: Colors.light.text, },

  // Buttons
  middleContent: { justifyContent: "center", marginBottom: 150,},
  buttonRow: { flexDirection: "row", flexWrap: "wrap", gap:5 },
  button: { padding: 12, borderWidth: 1, borderRadius: 8, margin: 5 },
  confirmButton: { backgroundColor: Colors.light.purple, borderColor: Colors.light.purple, padding: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
  confirmText: { fontWeight: "bold", color: "#fff", fontSize: 16, },

  // Calendar
  container3: { paddingVertical: 20, position: "absolute", bottom: 50, left: 0, right: 0 },
  header: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10, marginTop:10 },
  todayButton: { color: Colors.light.purple, fontWeight: "bold" },
  item: { width: 85, height: 90, marginHorizontal: 5, borderRadius: 8, padding: 10, paddingTop: 15, alignItems: "center", borderWidth: 1, borderColor: Colors.light.borderGray },
  todayItem: { backgroundColor: Colors.light.purple, borderWidth: 0 },
  futureItem: { opacity: 0.6 },
  itemText: { fontWeight: "bold" },
  itemoz: { marginTop: 5, fontWeight: "bold" },

  // Modal
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: Colors.light.background, padding: 20, borderRadius: 12, width: "80%", alignItems: "center" },
  modalText: { marginBottom: 10, color: Colors.dark.text, textAlign: "center" },
  inputRow: { flexDirection: "row", alignItems: "center", marginVertical: 8, width: "100%", justifyContent: "space-between", },
  label: { fontWeight: "bold", fontSize: 16, marginRight: 10, width: 50, textAlign: "right", },
  editInput: { borderWidth: 1, padding: 10, width: "75%", textAlign: "center", borderRadius: 8, marginVertical: 5 },
  modalButton: { marginTop: 20, backgroundColor: Colors.light.purple, borderColor: Colors.light.purple, width: 100},
  buttonText: { fontWeight: "bold", textAlign: "center" },
});
