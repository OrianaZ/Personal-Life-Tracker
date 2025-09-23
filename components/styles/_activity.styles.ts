import { Colors } from "@/components/theme/Colors";
import { StyleSheet } from "react-native";

export const activityStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 32, color: Colors.light.text, },
  metricContainer: { marginBottom: 24, alignItems: 'center', },
  metricLabel: { fontSize: 18, fontWeight: 'bold', color: Colors.light.text, marginBottom: 8, },
  metricValue: { fontSize: 48, fontWeight: 'bold', color: Colors.light.blue, },
});
