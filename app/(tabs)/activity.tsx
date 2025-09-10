import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import AppleHealthKit from 'react-native-health';
import Svg, { Path } from 'react-native-svg';

// Example: goal of 10,000 steps
const GOAL = 10000;

const permissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.Steps],
    write: [],
  },
};

export default function ActivityScreen() {
  const [steps, setSteps] = useState(0);

  useEffect(() => {
  if (Platform.OS !== 'ios') return;

  AppleHealthKit.initHealthKit(permissions, (err: string) => {
    if (err) {
      console.log('Error initializing HealthKit:', err);
      return;
    }

    const options = {
      date: new Date().toISOString().split('T')[0], // safer format
    };

    AppleHealthKit.getStepCount(options, (err: string, results: { value: number }) => {
      if (err) {
        console.log('Error fetching steps:', err);
        return;
      }
      if (results?.value != null) {
        setSteps(results.value);
      }
    });
  });
}, []);

  const progress = Math.min(steps / GOAL, 1);

  // Circle math
  const radius = 120;
  const circumference = Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - circumference * progress;

  return (
    <View style={styles.container}>
      <ThemedText type="title">Activity Center</ThemedText>

      <View style={{ marginTop: 50 }}>
        <Svg width={radius * 2} height={radius + 20}>
          {/* Background semicircle */}
          <Path
            d={`M 0 ${radius} A ${radius} ${radius} 0 0 1 ${radius * 2} ${radius}`}
            stroke={Colors.light.background}
            strokeWidth={20}
            fill="none"
          />
          {/* Progress semicircle */}
          <Path
            d={`M 0 ${radius} A ${radius} ${radius} 0 0 1 ${radius * 2} ${radius}`}
            stroke={Colors.light.purple}
            strokeWidth={20}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>

        <View style={styles.stepTextContainer}>
          <ThemedText type="title">{steps}</ThemedText>
          <ThemedText type="default">/ {GOAL} steps</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTextContainer: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
