import { Colors } from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";
import { ThemedText } from "../../theme/ThemedText";

import { styles } from "@/components/styles/_fasting.styles";


export default function ProgressBar({ progress, isFasting, lastMealTime, formatTime }: any) {
  return (
    <View style={styles.progressContainer}>
      {/* Start Icon */}
      <View style={styles.iconContainer}>
        {isFasting ? (
          <>
            <MaterialCommunityIcons name="clock-outline" size={24} color={Colors.light.blue} />
            <ThemedText style={styles.iconTime}>{formatTime(lastMealTime)}</ThemedText>
          </>
        ) : (
          <>
            <MaterialCommunityIcons name="silverware-fork-knife" size={24} color={Colors.light.orange} />
            <ThemedText style={styles.iconTime}>{formatTime(lastMealTime)}</ThemedText>
          </>
        )}
      </View>

      {/* Progress */}
      <View style={styles.progressBackground}>
        <View style={{ flex: progress, backgroundColor: isFasting ? Colors.light.blue : Colors.light.orange }} />
        <View style={{ flex: 1 - progress, backgroundColor: Colors.light.gray }} />
      </View>

      {/* End Icon */}
      <View style={styles.iconContainer}>
        {isFasting ? (
          <>
            <MaterialCommunityIcons name="silverware-fork-knife" size={24} color={Colors.light.orange} />
            <ThemedText style={styles.iconTime}>
              {formatTime(new Date(lastMealTime.getTime() + 16 * 60 * 60 * 1000))}
            </ThemedText>
          </>
        ) : (
          <>
            <MaterialCommunityIcons name="clock-outline" size={24} color={Colors.light.blue} />
            <ThemedText style={styles.iconTime}>20:00</ThemedText>
          </>
        )}
      </View>
    </View>
  );
}