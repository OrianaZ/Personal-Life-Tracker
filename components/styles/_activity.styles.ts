import { Colors } from "@/components/theme/Colors";
import { StyleSheet } from "react-native";

export const activityStyles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, },
    
    notCalendar: {marginBottom:80,},
    
    
    //steps display
    stepsContainer: { alignItems: "center", justifyContent: "center",  },
    stepsText: { position: "absolute", fontSize: 24, fontWeight: "bold", color: Colors.light.purple, bottom:40 },
    refresh:{paddingVertical: 8, paddingHorizontal:10, borderRadius: 8, alignItems: 'center', backgroundColor: Colors.light.purple, marginVertical:15,},
    
    //weight display
    weightContainer: { marginBottom: 24,marginTop:10, alignItems: 'center', },
    weightText: { fontSize: 22, fontWeight: 'bold', color: Colors.light.blue, marginBottom: 8, },
    weightRow: {flexDirection: "row", justifyContent: "space-between", width: 180 },
    weight: {fontWeight: 'bold'},
    weightDate: {fontStyle: "italic"},
    reportWeight:{paddingVertical: 8, paddingHorizontal:10, borderRadius: 8, alignItems: 'center', backgroundColor: Colors.light.blue, color:Colors.dark.text, marginTop:10},

    //weight modal
    modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
    modalContent: { backgroundColor: Colors.light.background, padding: 20, borderRadius: 12, width: 200, alignItems: "center", justifyContent: 'center',},
    buttonRow: {flexDirection: "row", justifyContent: "space-between", width: 170, marginTop:10 },
    buttonText: { fontWeight: 'bold' },
    save:{paddingVertical: 8, paddingHorizontal:10, borderRadius: 8, alignItems: 'center', backgroundColor: Colors.light.purple},
    cancel:{paddingVertical: 8, paddingHorizontal:10, borderRadius: 8, alignItems: 'center', backgroundColor: Colors.light.placeholder },
    input: {borderBottomWidth: 1, marginBottom: 10, minWidth:120, textAlign: 'center'},
    
    
    // Calendar
    calendarContainer: { paddingVertical: 20, position: "absolute", bottom: 50, left: 0, right: 0 },
    header: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10, marginTop:10 },
    todayButton: { color: Colors.light.purple, fontWeight: "bold" },
    item: { width: 95, height: 110, marginHorizontal: 5, borderRadius: 8, padding: 10, paddingTop: 15, alignItems: "center", borderWidth: 1, borderColor: Colors.light.borderGray },
    todayItem: { backgroundColor: Colors.light.purple, borderWidth: 0 },
    futureItem: { opacity: 0.6 },
    itemText: { fontWeight: "bold" },

});
