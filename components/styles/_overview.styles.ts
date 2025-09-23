import { Colors } from "@/components/theme/Colors";
import { StyleSheet } from "react-native";

export const overviewStyles = StyleSheet.create({
  tabContainer: { marginBottom: 0 },
  graph: { borderRadius: 12, marginVertical: 10 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.light.text, marginVertical: 5, position: 'relative', left: 10,  },
  chartTitle1: { bottom: -30 },
  chartTitle2: { bottom: -55,},

  yAxisSoda: { position: 'absolute', bottom: 70, left: 26, zIndex: 10, gap: 17 },
  yAxisWeight: { position: 'absolute', bottom: 40, left: 26, zIndex: 10, gap: 24 },
  yAxisText: { fontSize: 12, color: Colors.light.purple, fontStyle: 'italic', textAlign: 'right',},

  legendContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 5, },
  legendColorBox: { width: 15, height: 2, marginRight: 5, },
  legendText: { fontSize: 10, color: Colors.light.text, fontWeight: 'bold', fontStyle: 'italic' },
});
