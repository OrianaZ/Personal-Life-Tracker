//general
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

//styles
import { fastingStyles } from "@/components/styles/_fasting.styles";

//theme
import { Colors } from "@/components/theme/Colors";
import { ThemedText } from "../../theme/ThemedText";


export default function ProgressBar({ progress, isFasting, lastMealTime, formatTime }: any) {
  return (
    <View style={fastingStyles.progressContainer}>
      {/* Start Icon */}
      <View style={fastingStyles.iconContainer}>
        {isFasting ? (
          <>
            <MaterialCommunityIcons name="clock-outline" size={24} color={Colors.light.blue} />
            <ThemedText style={fastingStyles.iconTime}>{formatTime(lastMealTime)}</ThemedText>
          </>
        ) : (
          <>
            <MaterialCommunityIcons name="silverware-fork-knife" size={24} color={Colors.light.orange} />
            <ThemedText style={fastingStyles.iconTime}>{formatTime(lastMealTime)}</ThemedText>
          </>
        )}
      </View>

      {/* Progress */}
      <View style={fastingStyles.progressBackground}>
        <View style={{ flex: progress, backgroundColor: isFasting ? Colors.light.blue : Colors.light.orange }} />
        <View style={{ flex: 1 - progress, backgroundColor: Colors.light.gray }} />
      </View>

      {/* End Icon */}
      <View style={fastingStyles.iconContainer}>
        {isFasting ? (
          <>
            <MaterialCommunityIcons name="silverware-fork-knife" size={24} color={Colors.light.orange} />
            <ThemedText style={fastingStyles.iconTime}>
              {formatTime(new Date(lastMealTime.getTime() + 16 * 60 * 60 * 1000))}
            </ThemedText>
          </>
        ) : (
          <>
            <MaterialCommunityIcons name="clock-outline" size={24} color={Colors.light.blue} />
            <ThemedText style={fastingStyles.iconTime}>20:00</ThemedText>
          </>
        )}
      </View>
    </View>
  );
}