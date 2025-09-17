import { useFasting } from '@/components/context/FastingContext';
import { useWater } from '@/components/context/WaterContext';
import { ThemedText } from '@/components/theme/ThemedText';
import { Colors } from '@/constants/Colors';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Svg, { Line } from 'react-native-svg';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';

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

      // break line if out of current month or future
      if (!date.isSame(monthStart, 'month') || date.isAfter(today, 'day')) {
        data.push(null);
        continue;
      }

      const dateStr = date.format('YYYY-MM-DD');
      const rawValue = key ? log[dateStr]?.[key] : log[dateStr];

      // push null if no log, so line doesn't drop to 0
      data.push(typeof rawValue === 'number' ? rawValue : null);
    }

    return data;
  };

    const forceMin12 = (arr: (number | null)[]) =>
    arr.map(v =>
      typeof v === 'number' && Number.isFinite(v)
        ? Math.max(v, 12)
        : 12   // <-- give a safe floor
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
  const allRelevant = [...fastingData, ...waterData];
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
  const stepsData = useMemo(() => [
    5000, 7000, 6500, 8000, 9000, 10000, 12000, 11000, 7500, 8500,
    9000, 9500, 10000, 10500, 11000, 11500, 12000, 13000, 12500, 14000,
    14500, 15000, 12000, 11000, 9000, 8000, 7500, 7000, 6500, 6000,
  ], []);

  const stepsDataPrev = useMemo(() => [
    5200, 6800, 7200, 7900, 8800, 9700, 11500, 10800, 7600, 8300,
    9100, 9400, 10200, 10700, 11300, 11800, 12100, 12900, 12400, 13800,
    14600, 14900, 11900, 11200, 9200, 8100, 7700, 7100, 6600, 6100,
  ], []);

  const weightDataRaw = useMemo(() => [
    180, 0, 0, 0, 0, 0, 178, 179, 0, 0,
    177, 176, 0, 0, 0, 175, 174, 0, 0, 0,
    173, 172, 0, 0, 0, 171, 170, 0, 0, 165
  ], []);

  const weightData: number[] = [];
  let lastValidWeight = 180;
  for (let i = 0; i < weightDataRaw.length; i++) {
    const value = weightDataRaw[i];
    if (value === 0) weightData.push(lastValidWeight);
    else { weightData.push(value); lastValidWeight = value; }
  }

  const weightDataRawPrev = useMemo(() => [
    190, 0, 0, 0, 0, 0, 188, 189, 0, 0,
    187, 186, 0, 0, 0, 185, 184, 0, 0, 0,
    183, 182, 0, 0, 0, 181, 0 , 0, 0, 180
  ], []);

  const weightDataPrev: number[] = [];
  let lastValidWeightPrev = 180;
  for (let i = 0; i < weightDataRawPrev.length; i++) {
    const value = weightDataRawPrev[i];
    if (value === 0) weightDataPrev.push(lastValidWeightPrev);
    else { weightDataPrev.push(value); lastValidWeightPrev = value; }
  }

  const weightMin = 140;
  const weightMax = 200;
  const stepsMin = Math.min(...stepsData, ...stepsDataPrev);
  const stepsMax = Math.max(...stepsData, ...stepsDataPrev);
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
      <ThemedText style={[styles.chartTitle, styles.chartTitle1]}>Fasting</ThemedText>

      <View style={styles.legendContainer}>

        <View style={styles.legendItem}>
          <View style={[ styles.legendColorBox, { backgroundColor: Colors.dark.orange },]} />
          <ThemedText style={styles.legendText}>{today.subtract(1, "month").format("MMM")}:</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[ styles.legendColorBox, { backgroundColor: Colors.light.orange }, ]}/>
          <ThemedText style={styles.legendText}>{today.format("MMM")}: </ThemedText>
        </View>
        <View style={styles.legendItem}>
          <Svg height={12} width={24}>
            <Line x1="0" y1="6" x2="24" y2="6" stroke={Colors.light.red} strokeWidth="2" strokeDasharray="4,4" />
          </Svg>
          <ThemedText style={styles.legendText}>16h Target</ThemedText>
        </View>
      </View>

      <LineChart
        data={{
          labels: xLabels,
          datasets: [
            { data: Array(daysInMonth).fill(16), color: () => Colors.light.red, strokeWidth: 1, strokeDashArray: [4,4]},
            { data: forceMin12(fastingPrev) as unknown as number[], color: () => Colors.dark.orange, strokeWidth: 1, },
            { data: forceMin12(fastingData) as unknown as number[], color: () => Colors.light.orange, strokeWidth: 2, },
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
        style={styles.graph}
      />
      {/* Water & Soda Chart */}
      <ThemedText style={[styles.chartTitle, styles.chartTitle2]}>Liquids</ThemedText>

      <View style={styles.legendContainer}>
        <ThemedText style={styles.legendText}>
          {today.subtract(1, "month").format("MMM")}:
        </ThemedText>
        <View style={styles.legendItem}>
          <View style={[ styles.legendColorBox, { backgroundColor: Colors.dark.blue }, ]} />
          <ThemedText style={styles.legendText}>Water</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[ styles.legendColorBox, { backgroundColor: Colors.dark.purple }, ]}/>
          <ThemedText style={styles.legendText}>Soda</ThemedText>
        </View>
      </View>
      <View style={styles.legendContainer}>
        <ThemedText style={styles.legendText}>{today.format("MMM")}: </ThemedText>
        <View style={styles.legendItem}>
          <View style={[ styles.legendColorBox, { backgroundColor: Colors.light.blue }, ]}/>
          <ThemedText style={styles.legendText}>Water</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[ styles.legendColorBox, { backgroundColor: Colors.light.purple }, ]}/>
          <ThemedText style={styles.legendText}>Soda</ThemedText>
        </View>
      </View>


      <View style={styles.yAxisSoda}>
        {[25, 50, 75, 100].reverse().map((v) => (
          <ThemedText key={v} style={styles.yAxisText}>
            {v}
          </ThemedText>
        ))}
      </View>
      <LineChart
        data={{
          labels: xLabels,
          datasets: [
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
        style={styles.graph}
      />
    </ScrollView>
  );

  const ActivityScene = () => (
    <ScrollView style={{ paddingHorizontal: 20 }}>
      <ThemedText style={[styles.chartTitle, styles.chartTitle2]}>Activity</ThemedText>

      <View style={styles.legendContainer}>
        <ThemedText style={styles.legendText}>
          {today.subtract(1, "month").format("MMM")}:
        </ThemedText>
        <View style={styles.legendItem}>
          <View style={[ styles.legendColorBox, { backgroundColor: Colors.dark.blue }, ]} />
          <ThemedText style={styles.legendText}>Steps</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[ styles.legendColorBox, { backgroundColor: Colors.dark.purple }, ]}/>
          <ThemedText style={styles.legendText}>Weight</ThemedText>
        </View>
      </View>
      <View style={styles.legendContainer}>
        <ThemedText style={styles.legendText}>{today.format("MMM")}: </ThemedText>
        <View style={styles.legendItem}>
          <View style={[ styles.legendColorBox, { backgroundColor: Colors.light.blue }, ]}/>
          <ThemedText style={styles.legendText}>Steps</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[ styles.legendColorBox, { backgroundColor: Colors.light.purple }, ]}/>
          <ThemedText style={styles.legendText}>Weight</ThemedText>
        </View>
      </View>

      <View style={styles.yAxisWeight}>
        {[140, 155, 170, 185, 200].reverse().map((v) => (
          <ThemedText key={v} style={styles.yAxisText}>
            {v}
          </ThemedText> ))}
      </View>

      <LineChart
        data={{
          labels: xLabels,
          datasets: [
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
        style={styles.graph}
      />
    </ScrollView>
  );

  const renderScene = SceneMap({
    diet: DietScene,
    activity: ActivityScene,
  });

  return (
    <View style={{ flex: 1 }}>
      <TabView
        style={styles.tabContainer}
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

const styles = StyleSheet.create({
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
