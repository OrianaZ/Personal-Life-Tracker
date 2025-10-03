import { Colors } from "@/components/theme/Colors";
import { StyleSheet } from "react-native";

export const activityStyles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, },
    
    stepsContainer: { alignItems: "center", justifyContent: "center" },
    stepsText: { position: "absolute", fontSize: 24, fontWeight: "bold", color: Colors.light.purple, bottom:40 },
    
    weightContainer: { marginBottom: 24,marginTop:10, alignItems: 'center', },
    weightText: { fontSize: 18, fontWeight: 'bold', color: Colors.light.text, marginBottom: 8, },
    weightRow: {flexDirection: "row", justifyContent: "space-between", width: 180 },
    reportWeight:{paddingVertical: 8, paddingHorizontal:10, borderRadius: 8, alignItems: 'center', backgroundColor: Colors.light.blue, color:Colors.dark.text, marginTop:10},
    refresh:{paddingVertical: 8, paddingHorizontal:10, borderRadius: 8, alignItems: 'center', backgroundColor: Colors.light.purple, marginBottom:15,},


    modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
    modalContent: { backgroundColor: Colors.light.background, padding: 20, borderRadius: 12, width: 200, alignItems: "center", justifyContent: 'center',},
    buttonRow: {flexDirection: "row", justifyContent: "space-between", width: 170, marginTop:10 },
    buttonText: { fontWeight: 'bold' },
    save:{paddingVertical: 8, paddingHorizontal:10, borderRadius: 8, alignItems: 'center', backgroundColor: Colors.light.purple},
    cancel:{paddingVertical: 8, paddingHorizontal:10, borderRadius: 8, alignItems: 'center', backgroundColor: Colors.light.placeholder },

});
