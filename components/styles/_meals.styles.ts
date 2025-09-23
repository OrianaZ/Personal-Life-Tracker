import { Colors } from "@/components/theme/Colors";
import { StyleSheet } from "react-native";

export const mealsStyles = StyleSheet.create({
  tabContainer: { marginBottom: 0 },
  scrollContainer: { padding: 20 },

  // Meals
  dayContainer: { marginBottom: 20, padding: 12, borderWidth: 1, borderColor: Colors.dark.borderGray, borderRadius: 10 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  WeekDay: { fontWeight: "bold", textDecorationLine: "underline", fontSize: 18, color: Colors.light.purple },
  Out: { fontStyle: "italic", color: Colors.light.gray, fontSize: 14 },
  Main: { fontWeight: "bold", fontSize: 16, marginBottom: 2 },
  Side: { fontStyle: "italic", color: Colors.light.gray, fontSize: 14, marginLeft: 12 },

  modalContainer: { flex: 1, backgroundColor: Colors.dark.backgroundOpacity, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: Colors.dark.gray, padding: 20, borderRadius: 10 },
  modalInput: { borderBottomWidth: 1, borderBottomColor: Colors.dark.borderGray, color: Colors.light.text, marginBottom: 12, fontSize: 16, paddingVertical: 4 },

  button: { padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontWeight: 'bold' },

  // Grocery
  groceryItemContainer: { flexDirection: "row", alignItems: "center", justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 7, height: 50 },
  activeItem: { backgroundColor: Colors.dark.gray },
  groceryItemText: { fontSize: 16, color: Colors.light.text, borderBottomColor: Colors.light.borderGray, borderBottomWidth: 1, padding:5, marginHorizontal: 10},
  checkedText: { textDecorationLine: "line-through", color: Colors.light.placeholder },
  quantityInput: { width: 50, height: 36, backgroundColor: Colors.dark.gray, borderRadius: 6, textAlign: "center", color: Colors.light.text },

  dragHandle: { justifyContent: "center", alignItems: "center", marginRight: 8 },
  inputWrapper: { flexDirection: "row", marginVertical: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: Colors.light.borderGray, borderRadius: 8, paddingHorizontal: 12, color: Colors.light.text, height: 44, },
  addButton: { marginLeft: 10, backgroundColor: Colors.light.purple, paddingHorizontal: 16, justifyContent: "center", borderRadius: 8,},
  addButtonText: { fontWeight: "bold"},
  
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 15, paddingHorizontal: 30, borderTopWidth: StyleSheet.hairlineWidth, borderColor: Colors.light.borderGray, marginTop: 10 },
  totalLabel: { fontWeight: "bold", fontSize: 16 },
  totalValue: { fontWeight: "bold", fontSize: 16 },

  deleteButton: { alignSelf: "center", backgroundColor: Colors.light.red, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, },

  accessoryContainer: { backgroundColor: Colors.dark.gray, paddingVertical: 8, paddingHorizontal: 12, alignItems: "flex-end", },
  doneText: { color: Colors.light.purple, fontWeight: "600", fontSize: 16, },

  // scan
  container: { flex: 1, alignItems: "center", justifyContent: "center", marginBottom: 50,},
  imageWrapper: { width: "90%", height: 325, resizeMode: "contain", },
  image: { width: "100%", aspectRatio: 1.2, overflow: "hidden",  marginBottom: 10, borderRadius: 20,  },
});
