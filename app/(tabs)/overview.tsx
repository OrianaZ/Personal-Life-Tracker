//general
import dayjs from 'dayjs';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Svg, { Line } from 'react-native-svg';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';

//styles
import { overviewStyles } from '@/components/styles/_overview.styles';

//context
import { useFasting } from '@/components/context/FastingContext';
import { useWater } from '@/components/context/WaterContext';
import { useHealth } from '@/components/context/ActivityContext';

//theme
import { Colors } from '@/components/theme/Colors';
import { ThemedText } from '@/components/theme/ThemedText';


export default function OverviewScreen() {
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

  const xLabels: string[] = [];
  for (let i = 0; i < daysInMonth; i += 4) {
    const date = startOfMonth.add(i, 'day');
    xLabels.push(`${date.month() + 1}/${date.date()}`);
  }

  // Activity
    const { steps, weightEntries } = useHealth(); // get actual data

    // --- helper to generate daily arrays from HealthKit ---
    const generateDailySteps = (currentMonth: dayjs.Dayjs, daysInMonth: number) => {
      const arr: number[] = [];
      let lastValue = 0; // fallback if no step data
      for (let i = 0; i < daysInMonth; i++) {
        const dateStr = currentMonth.add(i, 'day').format('YYYY-MM-DD');
        // HealthKit currently only gives us total steps today, not historical
        // So fill current day with actual steps, others fallback
        if (dateStr === dayjs().format('YYYY-MM-DD') && steps != null) {
          lastValue = steps;
          arr.push(steps);
        } else {
          arr.push(lastValue);
        }
      }
      return arr;
    };

    const generateDailyWeight = (monthStart: dayjs.Dayjs, daysInMonth: number) => {
      const arr: number[] = [];
      let lastValue = weightEntries.length ? weightEntries[weightEntries.length - 1].weight : 0; // use latest weight
      for (let i = 0; i < daysInMonth; i++) {
        const dateStr = monthStart.add(i, 'day').format('YYYY-MM-DD');
        const entry = weightEntries.find(e => e.date.startsWith(dateStr));
        if (entry) lastValue = entry.weight;
        arr.push(lastValue);
      }
      return arr;
    };


    const stepsData = generateDailySteps(startOfMonth, daysInMonth);
    const stepsDataPrev = generateDailySteps(startOfPrevMonth, daysInMonth);

    const weightData = useMemo(() => generateDailyWeight(startOfMonth, daysInMonth), [weightEntries]);
    const weightDataPrev = generateDailyWeight(startOfPrevMonth, daysInMonth);
    
    const weightMin = 140;
    const weightMax = 200;
    const stepsMin = Math.min(...stepsData, ...stepsDataPrev);
    const stepsMax = Math.max(...stepsData, ...stepsDataPrev);

    // normalize weight for chart
    const weightNormalized = weightData.map(w => ((w - weightMin) / (weightMax - weightMin)) * (stepsMax - stepsMin) + stepsMin);
    const weightNormalizedPrev = weightDataPrev.map(w => ((w - weightMin) / (weightMax - weightMin)) * (stepsMax - stepsMin) + stepsMin);


  // ---------- Tab View ----------
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'diet', title: 'Diet' },
    { key: 'activity', title: 'Activity' },
  ]);

  const DietScene = () => (
    <ScrollView style={{ paddingHorizontal: 20 }}>

      {/* Fasting Chart */}
      <TouchableOpacity activeOpacity={1} onPress={() => router.push('/fasting')}>
        <ThemedText style={[overviewStyles.chartTitle, overviewStyles.chartTitle1]}>Fasting</ThemedText>

        <View style={overviewStyles.legendContainer}>

          <View style={overviewStyles.legendItem}>
            <View style={[ overviewStyles.legendColorBox, { backgroundColor: Colors.dark.orange },]} />
            <ThemedText style={overviewStyles.legendText}>{today.subtract(1, "month").format("MMM")}:</ThemedText>
          </View>
          <View style={overviewStyles.legendItem}>
            <View style={[ overviewStyles.legendColorBox, { backgroundColor: Colors.light.orange }, ]}/>
            <ThemedText style={overviewStyles.legendText}>{today.format("MMM")}: </ThemedText>
          </View>
          <View style={overviewStyles.legendItem}>
            <Svg height={12} width={24}>
              <Line x1="0" y1="6" x2="24" y2="6" stroke={Colors.light.red} strokeWidth="2" strokeDasharray="4,4" />
            </Svg>
            <ThemedText style={overviewStyles.legendText}>16h Target</ThemedText>
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
            backgroundGradientTo: Colors.dark.gray,
            color: (opacity = 1) => Colors.light.text,
            labelColor: () => Colors.light.text,
            propsForLabels: { fontSize: 12, fontWeight: "bold" },
          }}
          bezier
          style={overviewStyles.graph}
        />
      </TouchableOpacity>

      {/* Water & Soda Chart */}
      <TouchableOpacity activeOpacity={1} onPress={() => router.push('/water')}>
        <ThemedText style={[overviewStyles.chartTitle, overviewStyles.chartTitle2]}>Liquids</ThemedText>

        <View style={overviewStyles.legendContainer}>
          <ThemedText style={overviewStyles.legendText}>
            {today.subtract(1, "month").format("MMM")}:
          </ThemedText>
          <View style={overviewStyles.legendItem}>
            <View style={[ overviewStyles.legendColorBox, { backgroundColor: Colors.dark.blue }, ]} />
            <ThemedText style={overviewStyles.legendText}>Water</ThemedText>
          </View>
          <View style={overviewStyles.legendItem}>
            <View style={[ overviewStyles.legendColorBox, { backgroundColor: Colors.dark.purple }, ]}/>
            <ThemedText style={overviewStyles.legendText}>Soda</ThemedText>
          </View>
        </View>
        <View style={overviewStyles.legendContainer}>
          <ThemedText style={overviewStyles.legendText}>{today.format("MMM")}: </ThemedText>
          <View style={overviewStyles.legendItem}>
            <View style={[ overviewStyles.legendColorBox, { backgroundColor: Colors.light.blue }, ]}/>
            <ThemedText style={overviewStyles.legendText}>Water</ThemedText>
          </View>
          <View style={overviewStyles.legendItem}>
            <View style={[ overviewStyles.legendColorBox, { backgroundColor: Colors.light.purple }, ]}/>
            <ThemedText style={overviewStyles.legendText}>Soda</ThemedText>
          </View>
        </View>


        <View style={overviewStyles.yAxisSoda}>
          {[25, 50, 75, 100].reverse().map((v) => (
            <ThemedText key={v} style={overviewStyles.yAxisText}>
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
            backgroundGradientTo: Colors.dark.gray,
            color: (opacity = 1) => Colors.light.text,
            labelColor: () => Colors.light.text,
            propsForLabels: { fontSize: 12, fontWeight: "bold" },
          }}
          bezier
          style={overviewStyles.graph}
        />
      </TouchableOpacity>
    </ScrollView>
  );

  const ActivityScene = () => (
    <TouchableOpacity activeOpacity={1} onPress={() => router.push('/activity')}>
      <ScrollView style={{ paddingHorizontal: 20 }}>
        <ThemedText style={[overviewStyles.chartTitle, overviewStyles.chartTitle2]}>Activity</ThemedText>

        <View style={overviewStyles.legendContainer}>
          <ThemedText style={overviewStyles.legendText}>
            {today.subtract(1, "month").format("MMM")}:
          </ThemedText>
          <View style={overviewStyles.legendItem}>
            <View style={[ overviewStyles.legendColorBox, { backgroundColor: Colors.dark.blue }, ]} />
            <ThemedText style={overviewStyles.legendText}>Steps</ThemedText>
          </View>
          <View style={overviewStyles.legendItem}>
            <View style={[ overviewStyles.legendColorBox, { backgroundColor: Colors.dark.purple }, ]}/>
            <ThemedText style={overviewStyles.legendText}>Weight</ThemedText>
          </View>
        </View>
        <View style={overviewStyles.legendContainer}>
          <ThemedText style={overviewStyles.legendText}>{today.format("MMM")}: </ThemedText>
          <View style={overviewStyles.legendItem}>
            <View style={[ overviewStyles.legendColorBox, { backgroundColor: Colors.light.blue }, ]}/>
            <ThemedText style={overviewStyles.legendText}>Steps</ThemedText>
          </View>
          <View style={overviewStyles.legendItem}>
            <View style={[ overviewStyles.legendColorBox, { backgroundColor: Colors.light.purple }, ]}/>
            <ThemedText style={overviewStyles.legendText}>Weight</ThemedText>
          </View>
        </View>

        <View style={overviewStyles.yAxisWeight}>
          {[140, 155, 170, 185, 200].reverse().map((v) => (
            <ThemedText key={v} style={overviewStyles.yAxisText}>
              {v}
            </ThemedText> ))}
        </View>

        <LineChart
          data={{
            labels: xLabels,
            datasets: [
              { data: Array(daysInMonth).fill(500), color: () => 'transparent', strokeWidth: 0, }, //min height
              { data: stepsDataPrev, color: () => Colors.dark.blue, strokeWidth: 1 },
              { data: weightNormalizedPrev, color: () => Colors.dark.purple, strokeWidth: 1 },

              { data: stepsData, color: () => Colors.light.blue, strokeWidth: 2 },
              { data: weightNormalized, color: () => Colors.light.purple, strokeWidth: 2 },
            ],
          }}
          width={screenWidth}
          height={260}
          withDots={false}
          withShadow={false}
          withInnerLines={false}
          withOuterLines={false}
          yAxisSuffix=""
          yLabelsOffset={15}
          formatYLabel={(yValue) => {
            const num = Number(yValue);
            if (Number.isNaN(num)) return '';
            return (Math.round(num / 250) * 250).toString();
          }}       
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: Colors.dark.borderGray,
            backgroundGradientTo: Colors.dark.gray,
            color: (opacity = 1) => Colors.light.text,
            labelColor: () => Colors.light.text,
            propsForLabels: { fontSize: 12, fontWeight: 'bold' },
          }}
          bezier
          style={overviewStyles.graph}
        />
      </ScrollView>
    </TouchableOpacity>

  );

  const renderScene = SceneMap({
    diet: DietScene,
    activity: ActivityScene,
  });

  return (
    <View style={{ flex: 1 }}>
      <TabView
        style={overviewStyles.tabContainer}
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
