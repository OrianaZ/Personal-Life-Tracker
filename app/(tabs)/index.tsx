//general
import dayjs from 'dayjs';
import { router, useRouter } from 'expo-router';
import React, { useMemo, useState, useContext } from 'react';
import { Dimensions, ScrollView, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Svg, { Line } from 'react-native-svg';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';

//styles
import { indexStyles } from '@/components/styles/_index.styles'

//context
import { useFasting } from "@/components/context/FastingContext";
import { MealsContext } from '@/components/context/MealsContext';
import { useMeds } from "@/components/context/MedsContext";
import { useWater } from '@/components/context/WaterContext';
import { useHealth } from '@/components/context/ActivityContext';

//theme
import { Colors } from '@/components/theme/Colors';
import { ThemedText } from '@/components/theme/ThemedText';


export default function HomeScreen() {
  const { fastLog } = useFasting();
  const { log: waterLog } = useWater();

  const screenWidth = Dimensions.get('window').width - 40;
  const today = dayjs();
  const startOfMonth = today.startOf('month');
  const startOfPrevMonth = startOfMonth.subtract(1, 'month');
  const daysInMonth = Math.max(today.daysInMonth(), startOfPrevMonth.daysInMonth());

  const generateLineData = (
    log: Record<string, any>,
    monthStart: dayjs.Dayjs,
    days: number,
    key?: string
  ) => {
    const data: (number | null)[] = [];
    const today = dayjs().startOf('day');

    for (let i = 0; i < days; i++) {
      const date = monthStart.add(i, 'day');

      if (!date.isSame(monthStart, 'month') || date.isAfter(today, 'day')) {
        data.push(null);
        continue;
      }

      const dateStr = date.format('YYYY-MM-DD');
      const rawValue = key ? log[dateStr]?.[key] : log[dateStr];

      data.push(typeof rawValue === 'number' ? rawValue : null);
    }

    return data;
  };

    const forceMin14 = (arr: (number | null)[]) =>
    arr.map(v =>
      typeof v === 'number' && Number.isFinite(v)
        ? Math.max(v, 14)
        : 14
    );

  const xLabels: string[] = [];
  for (let i = 0; i < daysInMonth; i += 4) {
    const date = startOfMonth.add(i, 'day');
    xLabels.push(`${date.month() + 1}/${date.date()}`);
  }

  // ---------- Tab View ----------
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'today', title: 'Today' },
    { key: 'diet', title: 'Diet' },
    { key: 'health', title: 'Health' },
  ]);
    
    
    const router = useRouter();

    const { isFasting, timerText } = useFasting();
    const { steps, weightEntries, log } = useHealth();
    
    const { meals: mealData } = useContext(MealsContext);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDay = daysOfWeek[new Date().getDay()];
    const todayMeal = mealData[todayDay] || { out: '', main: '', side: '' };

    const { nextMedications } = useMeds();

    const { getTodayIntake } = useWater();
    const todayIntake = getTodayIntake();
    
    const latestWeight = weightEntries[0]?.weight ?? null;
    
    const TodayScene = () =>(
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
           
           {/* Steps + Weight*/}
         <TouchableOpacity style={indexStyles.activityContainer} onPress={() => router.push('/activity')}>
           <ThemedText style={{ fontWeight: "bold" }}>Today’s Activity:</ThemedText>
             <View style={indexStyles.stepsWeight}>
               <ThemedText style={indexStyles.steps}>
                 Steps: {steps ?? 0}
               </ThemedText>
               <ThemedText style={indexStyles.weight}>
                  Weight: {latestWeight != null ? `${Number(latestWeight).toFixed(1)} lb` : "N/A"}
               </ThemedText>
             </View>
       </TouchableOpacity>
     </View>
    );
    
    
    // Fasting
    const fastingData = generateLineData(fastLog, startOfMonth, daysInMonth);
    const fastingPrev = generateLineData(fastLog, startOfPrevMonth, daysInMonth);

    const waterData = generateLineData(waterLog, startOfMonth, daysInMonth, 'water');
    const sodaData = generateLineData(waterLog, startOfMonth, daysInMonth, 'soda');
    const waterPrev = generateLineData(waterLog, startOfPrevMonth, daysInMonth, 'water');
    const sodaPrev = generateLineData(waterLog, startOfPrevMonth, daysInMonth, 'soda');

    const sodaMin = 0;
    const sodaMax = 100;
    // --- compute min/max ignoring NaN/null so axis scaling stays correct ---
    const allRelevant = [...sodaData, ...waterData, ...sodaPrev, ...waterPrev];
    const numeric = allRelevant.filter((v) => v != null && !Number.isNaN(v)) as number[];

    const minY = numeric.length ? Math.min(...numeric, 0) : 0;
    const maxY = numeric.length ? Math.max(...numeric) : 1;

    // --- normalize soda but preserve NaN for future/out-of-month points ---
    const sodaNormalized = sodaData.map((v) =>
      v == null
        ? null
        : ((v - sodaMin) / (sodaMax - sodaMin)) * (maxY - minY) + minY
    );
    const sodaNormalizedPrev = sodaPrev.map((v) =>
      v == null
        ? null
        : ((v - sodaMin) / (sodaMax - sodaMin)) * (maxY - minY) + minY
    );

  const DietScene = () => (
    <ScrollView style={{ paddingHorizontal: 20 }}>

      {/* Fasting Chart */}
      <TouchableOpacity activeOpacity={1} onPress={() => router.push('/fasting')}>
        <ThemedText style={[indexStyles.chartTitle, indexStyles.chartTitle1]}>Fasting</ThemedText>

        <View style={indexStyles.legendContainer}>

          <View style={indexStyles.legendItem}>
            <View style={[ indexStyles.legendColorBox, { backgroundColor: Colors.dark.orange },]} />
            <ThemedText style={indexStyles.legendText}>{today.subtract(1, "month").format("MMM")}</ThemedText>
          </View>
          <View style={indexStyles.legendItem}>
            <View style={[ indexStyles.legendColorBox, { backgroundColor: Colors.light.orange }, ]}/>
            <ThemedText style={indexStyles.legendText}>{today.format("MMM")} </ThemedText>
          </View>
          <View style={indexStyles.legendItem}>
            <Svg height={12} width={24}>
              <Line x1="0" y1="6" x2="24" y2="6" stroke={Colors.light.red} strokeWidth="2" strokeDasharray="4,4" />
            </Svg>
            <ThemedText style={indexStyles.legendText}>16h Target</ThemedText>
          </View>
        </View>

        <LineChart
          data={{
            labels: xLabels,
            datasets: [
              { data: Array(daysInMonth).fill(26), color: () => 'transparent', strokeWidth: 0, },
              { data: Array(daysInMonth).fill(14.55), color: () => 'rgba(255, 99, 71, 0.2)', strokeWidth: 40, },
              { data: Array(daysInMonth).fill(16), color: () => Colors.light.red, strokeWidth: 1, strokeDashArray: [4,4], },
              { data: forceMin14(fastingPrev) as unknown as number[], color: () => Colors.dark.orange, strokeWidth: 1, },
              { data: forceMin14(fastingData) as unknown as number[], color: () => Colors.light.orange, strokeWidth: 2, },
            ],
          }}
          width={screenWidth}
          height={220}
          withDots={false}
          withShadow={false}
          withInnerLines={false}
          withOuterLines={false}
          yAxisSuffix=""
          yLabelsOffset={15}
          hidePointsAtIndex={[]}
          formatYLabel={(yValue) => {
            const num = Number(yValue);
            if (Number.isNaN(num)) return '';
            return Math.round(num).toString();
          }}
          chartConfig={{
            backgroundColor: "transparent",
            backgroundGradientFrom: Colors.dark.borderGray,
            backgroundGradientTo: Colors.dark.borderGray,
            color: (opacity = 1) => Colors.light.text,
            labelColor: () => Colors.light.text,
            propsForLabels: { fontSize: 12, fontWeight: "bold" },
          }}
          bezier
          style={indexStyles.graph}
        />
      </TouchableOpacity>

      {/* Water & Soda Chart */}
      <TouchableOpacity activeOpacity={1} onPress={() => router.push('/water')}>
        <ThemedText style={[indexStyles.chartTitle, indexStyles.chartTitle2]}>Liquids</ThemedText>

        <View style={indexStyles.legendContainer}>
          <ThemedText style={indexStyles.legendText}>
            {today.subtract(1, "month").format("MMM")}:
          </ThemedText>
          <View style={indexStyles.legendItem}>
            <View style={[ indexStyles.legendColorBox, { backgroundColor: Colors.dark.blue }, ]} />
            <ThemedText style={indexStyles.legendText}>Water</ThemedText>
          </View>
          <View style={indexStyles.legendItem}>
            <View style={[ indexStyles.legendColorBox, { backgroundColor: Colors.dark.purple }, ]}/>
            <ThemedText style={indexStyles.legendText}>Soda</ThemedText>
          </View>
        </View>
        <View style={indexStyles.legendContainer}>
          <ThemedText style={indexStyles.legendText}>{today.format("MMM")}: </ThemedText>
          <View style={indexStyles.legendItem}>
            <View style={[ indexStyles.legendColorBox, { backgroundColor: Colors.light.blue }, ]}/>
            <ThemedText style={indexStyles.legendText}>Water</ThemedText>
          </View>
          <View style={indexStyles.legendItem}>
            <View style={[ indexStyles.legendColorBox, { backgroundColor: Colors.light.purple }, ]}/>
            <ThemedText style={indexStyles.legendText}>Soda</ThemedText>
          </View>
        </View>


        <View style={indexStyles.yAxisSoda}>
          {[25, 50, 75, 100].reverse().map((v) => (
            <ThemedText key={v} style={indexStyles.yAxisText}>
              {v}
            </ThemedText>
          ))}
        </View>
    
        <LineChart
          data={{
            labels: xLabels,
            datasets: [
              { data: Array(daysInMonth).fill(16), color: () => 'transparent', strokeWidth: 0, }, //min height
              { data: waterPrev as unknown as number[], color: () => Colors.dark.blue, strokeWidth: 1 },
              { data: sodaNormalizedPrev as unknown as number[], color: () => Colors.dark.purple, strokeWidth: 1, },
              { data: waterData as unknown as number[], color: () => Colors.light.blue, strokeWidth: 2 },
              { data: sodaNormalized as unknown as number[], color: () => Colors.light.purple, strokeWidth: 2, },
            ],
          }}
          width={screenWidth}
          height={220}
          withDots={false}
          withShadow={false}
          withInnerLines={false}
          withOuterLines={false}
          yAxisSuffix=""
          yLabelsOffset={15}
          formatYLabel={(yValue) => {
            const num = Number(yValue);
            if (Number.isNaN(num)) return '';
            return Math.round(num).toString();
          }}
          chartConfig={{
            backgroundColor: "transparent",
            backgroundGradientFrom: Colors.dark.borderGray,
            backgroundGradientTo: Colors.dark.borderGray,
            color: (opacity = 1) => Colors.light.text,
            labelColor: () => Colors.light.text,
            propsForLabels: { fontSize: 12, fontWeight: "bold" },
          }}
          bezier
          style={indexStyles.graph}
        />
      </TouchableOpacity>
    </ScrollView>
  );
    
    
    // Activity
    const generateDailySteps = (monthStart: dayjs.Dayjs, daysInMonth: number, log: Record<string, any>) => {
      const arr: (number | null)[] = [];

      for (let i = 0; i < daysInMonth; i++) {
        const dateStr = monthStart.add(i, 'day').format('YYYY-MM-DD');
        const entry = log[dateStr]?.steps;
        arr.push(typeof entry === 'number' ? entry : null);
      }

      return arr;
    };

    const generateDailyWeight = (monthStart: dayjs.Dayjs, daysInMonth: number, log: Record<string, any>) => {
      const arr: (number | null)[] = [];

      let lastValue: number | null = null;
      for (let i = 0; i < daysInMonth; i++) {
        const dateStr = monthStart.add(i, 'day').format('YYYY-MM-DD');
        const entry = log[dateStr]?.weight;

        if (typeof entry === 'number') {
          lastValue = entry;
          arr.push(entry);
        } else {
          // Keep previous known value for continuity (optional)
          arr.push(lastValue);
        }
      }

      return arr;
    };

    const stepsData = generateDailySteps(startOfMonth, daysInMonth, log);
    const stepsDataPrev = generateDailySteps(startOfPrevMonth, daysInMonth, log);

    const weightData = generateDailyWeight(startOfMonth, daysInMonth, log);
    const weightDataPrev = generateDailyWeight(startOfPrevMonth, daysInMonth, log);
    
    const safeWeightData = (weightData ?? []).map(v => (typeof v === 'number' && isFinite(v) ? v : 0));
    const safeWeightDataPrev = (weightDataPrev ?? []).map(v => (typeof v === 'number' && isFinite(v) ? v : 0));
    const safeStepsData = (stepsData ?? []).map(v => (typeof v === 'number' && isFinite(v) ? v : 0));
    const safeStepsDataPrev = (stepsDataPrev ?? []).map(v => (typeof v === 'number' && isFinite(v) ? v : 0));

    // --- Activity (Health) Section ---
    const ActivityScene = () => (
      <ScrollView style={{ paddingHorizontal: 20 }}>
        
        {/* Steps Chart */}
        <TouchableOpacity activeOpacity={1} onPress={() => router.push('/activity')}>
          <ThemedText style={[indexStyles.chartTitle, indexStyles.chartTitle1]}>Steps</ThemedText>

          <View style={indexStyles.legendContainer}>
            <View style={indexStyles.legendItem}>
              <View style={[indexStyles.legendColorBox, { backgroundColor: Colors.dark.blue }]} />
              <ThemedText style={indexStyles.legendText}>
                {today.subtract(1, 'month').format('MMM')}
              </ThemedText>
            </View>
            <View style={indexStyles.legendItem}>
              <View style={[indexStyles.legendColorBox, { backgroundColor: Colors.light.blue }]} />
              <ThemedText style={indexStyles.legendText}>{today.format('MMM')}</ThemedText>
            </View>
          </View>

          <LineChart
            data={{
              labels: xLabels,
              datasets: [
                { data: safeStepsDataPrev, color: () => Colors.dark.blue, strokeWidth: 1 },
                { data: safeStepsData, color: () => Colors.light.blue, strokeWidth: 2 },
              ],
            }}
            width={screenWidth}
            height={220}
            withDots={false}
            withShadow={false}
            withInnerLines={false}
            withOuterLines={false}
            yAxisSuffix=""
            yLabelsOffset={15}
            formatYLabel={(yValue) => {
              const num = Number(yValue);
              return Number.isNaN(num) ? '' : Math.round(num).toString();
            }}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: Colors.dark.borderGray,
              backgroundGradientTo: Colors.dark.borderGray,
              color: () => Colors.light.text,
              labelColor: () => Colors.light.text,
              propsForLabels: { fontSize: 12, fontWeight: 'bold' },
            }}
            bezier
            style={indexStyles.graph}
          />
        </TouchableOpacity>

        {/* Weight Chart */}
        <TouchableOpacity activeOpacity={1} onPress={() => router.push('/activity')}>
          <ThemedText style={[indexStyles.chartTitle, indexStyles.chartTitle1]}>Weight</ThemedText>

          <View style={indexStyles.legendContainer}>
            <View style={indexStyles.legendItem}>
              <View style={[indexStyles.legendColorBox, { backgroundColor: Colors.dark.purple }]} />
              <ThemedText style={indexStyles.legendText}>
                {today.subtract(1, 'month').format('MMM')}
              </ThemedText>
            </View>
            <View style={indexStyles.legendItem}>
              <View style={[indexStyles.legendColorBox, { backgroundColor: Colors.light.purple }]} />
              <ThemedText style={indexStyles.legendText}>{today.format('MMM')}</ThemedText>
            </View>
          </View>

          <LineChart
            data={{
              labels: xLabels,
              datasets: [
                { data: safeWeightDataPrev, color: () => Colors.dark.purple, strokeWidth: 1 },
                { data: safeWeightData, color: () => Colors.light.purple, strokeWidth: 2 },
              ],
            }}
            width={screenWidth}
            height={220}
            withDots={false}
            withShadow={false}
            withInnerLines={false}
            withOuterLines={false}
            yAxisSuffix=""
            yLabelsOffset={15}
            formatYLabel={(yValue) => {
              const num = Number(yValue);
              return Number.isNaN(num) ? '' : Math.round(num).toString();
            }}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: Colors.dark.borderGray,
              backgroundGradientTo: Colors.dark.borderGray,
              color: () => Colors.light.text,
              labelColor: () => Colors.light.text,
              propsForLabels: { fontSize: 12, fontWeight: 'bold' },
            }}
            bezier
            style={indexStyles.graph}
          />
        </TouchableOpacity>
      </ScrollView>
    );


  const renderScene = SceneMap({
    today: TodayScene,
    diet: DietScene,
    health: ActivityScene,
  });

  return (
    <View style={{ flex: 1 }}>
      <TabView
        style={indexStyles.tabContainer}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: 400 }}
        renderTabBar={(props: any) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: Colors.light.purple }}
            style={{ backgroundColor: 'transparent' }}
            labelStyle={{ color: 'black', fontWeight: 'bold' }}
          />
        )}
      />
    </View>
  );
}
