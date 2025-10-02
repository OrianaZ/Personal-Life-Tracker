import { Colors } from "@/components/theme/Colors";
import { StyleSheet } from "react-native";

export const indexStyles = StyleSheet.create({
  homePage: {flex: 1, justifyContent: "center", marginBottom: 50},
  
  FastingContainer: { marginHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderWidth: 1, borderColor: Colors.dark.borderGray, borderRadius: 10,},

  dinnerContainer: { margin: 20, padding: 12, borderWidth: 1, borderColor: Colors.dark.borderGray, borderRadius: 10,},
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, },
  WeekDay: { fontWeight: "bold", textDecorationLine: "underline", fontSize: 18, color: Colors.light.purple, },
  Out: { fontStyle: "italic", color: Colors.light.gray, fontSize: 14, },
  Main: { fontWeight: "bold", fontSize: 16, marginBottom: 2, },
  Side: { fontStyle: "italic", color: Colors.light.gray, fontSize: 14, marginLeft: 12, },

  medContainer: { marginHorizontal: 20, padding: 12, borderWidth: 1, borderColor: Colors.dark.borderGray, borderRadius: 10,},

  waterContainer: { margin: 20, padding: 12, borderWidth: 1, borderColor: Colors.dark.borderGray, borderRadius: 10,},
  sodawater:{ flexDirection: "row", justifyContent: "space-around", alignItems: "center", flexWrap: "wrap", marginTop:5, },
  soda:{ color: Colors.light.purple, fontSize: 16},
  water:{ color: Colors.light.blue, fontSize: 16},
    
    activityContainer: { marginHorizontal: 20, padding: 12, borderWidth: 1, borderColor: Colors.dark.borderGray, borderRadius: 10,},
    stepsWeight:{ flexDirection: "row", justifyContent: "space-around", alignItems: "center", flexWrap: "wrap", marginTop:5, },
    steps:{ color: Colors.light.purple, fontSize: 16},
    weight:{ color: Colors.light.blue, fontSize: 16},
});
