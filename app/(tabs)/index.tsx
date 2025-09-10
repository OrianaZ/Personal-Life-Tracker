import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useFasting } from "@/context/FastingContext";
import { MealsContext } from '@/context/MealsContext';
import { useMeds } from "@/context/MedsContext";
import { useWater } from '@/context/WaterContext';
import { useContext } from 'react';

export default function HomeScreen() {
    const { isFasting, timerText } = useFasting();
    
    const { meals: mealData } = useContext(MealsContext);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = daysOfWeek[new Date().getDay()];
    const todayMeal = mealData[today] || { out: '', main: '', side: '' };

    const { nextMedications } = useMeds();

    const { getTodayIntake } = useWater();
    const todayIntake = getTodayIntake();

  return (
    <View  style={styles.homePage}>
      {/* Fasting */}
      <View style={styles.FastingContainer}>
        <ThemedText type="subtitle">
          {isFasting ? "Fasted For" : "Time Until Fast"}: {timerText}
        </ThemedText>
      </View>

       {/* Dinner */}
      {todayMeal && (
          <View style={styles.dinnerContainer}>
            <View style={styles.dayHeader}>
              <ThemedText type="subtitle" style={styles.WeekDay}>Dinner</ThemedText>
              {todayMeal.out ? <ThemedText style={styles.Out}>{todayMeal.out}</ThemedText> : null}
            </View>
            {todayMeal.main ? <ThemedText style={styles.Main}>{todayMeal.main}</ThemedText> : null}
            {todayMeal.side ? <ThemedText style={styles.Side}>{todayMeal.side}</ThemedText> : null}
          </View>
        )}

        {/* Medications */}
        <View style={ styles.medContainer }>
          <ThemedText style={{ fontWeight: "bold" }}>Meds:</ThemedText>
          {nextMedications ? (
            <ThemedText style={{ color: nextMedications.time < new Date() ? Colors.light.red : Colors.light.text,}}>
              {nextMedications.meds.map((m) => m.name).join(", ")}{" "}
              {nextMedications.time.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit" })}
            </ThemedText>
          ) : (
            <ThemedText>No upcoming meds</ThemedText>
          )}
        </View>

         {/* Water + Soda Intake */}
        <View style={styles.waterContainer}>
          <ThemedText style={{ fontWeight: "bold" }}>Today’s Intake:</ThemedText>
          <View style={styles.sodawater}>
            <ThemedText style={styles.soda}>
              Soda: {todayIntake.soda} oz
            </ThemedText>
            <ThemedText style={styles.water}>
              Water: {todayIntake.water} oz
            </ThemedText>
          </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
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

});
