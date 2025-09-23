import { Colors } from "@/components/theme/Colors";
import { StyleSheet } from "react-native";

export const medsStyles = StyleSheet.create({
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
