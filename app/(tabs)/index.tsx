//general
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { TouchableOpacity, View } from 'react-native';

//styles
import { indexStyles } from '@/components/styles/_index.styles';

//context
import { useFasting } from "@/components/context/FastingContext";
import { MealsContext } from '@/components/context/MealsContext';
import { useMeds } from "@/components/context/MedsContext";
import { useWater } from '@/components/context/WaterContext';

//theme
import { Colors } from '@/components/theme/Colors';
import { ThemedText } from '@/components/theme/ThemedText';


export default function HomeScreen() {
    const router = useRouter();

    const { isFasting, timerText } = useFasting();
    
    const { meals: mealData } = useContext(MealsContext);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = daysOfWeek[new Date().getDay()];
    const todayMeal = mealData[today] || { out: '', main: '', side: '' };

    const { nextMedications } = useMeds();

    const { getTodayIntake } = useWater();
    const todayIntake = getTodayIntake();

  return (
    <View  style={indexStyles.homePage}>

      {/* Fasting */}
      <TouchableOpacity style={indexStyles.FastingContainer} onPress={() => router.push('/fasting')}>
        <ThemedText type="subtitle">
          {isFasting ? "Fasted For" : "Time Until Fast"}: {timerText}
        </ThemedText>
      </TouchableOpacity>

       {/* Dinner */}
      {todayMeal && (
          <TouchableOpacity style={indexStyles.dinnerContainer} onPress={() => router.push('/meals')}>
            <View style={indexStyles.dayHeader}>
              <ThemedText type="subtitle" style={indexStyles.WeekDay}>Dinner</ThemedText>
              {todayMeal.out ? <ThemedText style={indexStyles.Out}>{todayMeal.out}</ThemedText> : null}
            </View>
            {todayMeal.main ? <ThemedText style={indexStyles.Main}>{todayMeal.main}</ThemedText> : null}
            {todayMeal.side ? <ThemedText style={indexStyles.Side}>{todayMeal.side}</ThemedText> : null}
          </TouchableOpacity>
        )}

        {/* Medications */}
        <TouchableOpacity style={ indexStyles.medContainer } onPress={() => router.push('/meds')}>
          <ThemedText style={{ fontWeight: "bold" }}>Meds:</ThemedText>
          {nextMedications ? (
            <ThemedText style={{ color: nextMedications.time < new Date() ? Colors.light.red : Colors.light.text,}}>
              {nextMedications.meds.map((m) => m.name).join(", ")}{" "}
              {nextMedications.time.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit" })}
            </ThemedText>
          ) : (
            <ThemedText>No upcoming meds</ThemedText>
          )}
        </TouchableOpacity>

         {/* Water + Soda Intake */}
        <TouchableOpacity style={indexStyles.waterContainer} onPress={() => router.push('/water')}>
          <ThemedText style={{ fontWeight: "bold" }}>Today’s Intake:</ThemedText>
          <View style={indexStyles.sodawater}>
            <ThemedText style={indexStyles.soda}>
              Soda: {todayIntake.soda} oz
            </ThemedText>
            <ThemedText style={indexStyles.water}>
              Water: {todayIntake.water} oz
            </ThemedText>
          </View>
        </TouchableOpacity>
    </View>
  );
}
