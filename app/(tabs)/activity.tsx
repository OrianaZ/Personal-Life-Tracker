import { ThemedText } from '@/components/theme/ThemedText';
import { Colors } from '@/constants/Colors';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AppleHealthKit, { HealthKitPermissions, HealthUnit, HealthValue } from 'react-native-health';

export default function ActivityScreen() {
  const [steps, setSteps] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);

  // ----- HealthKit permissions -----
  const permissions = {
    permissions: {
      read: [
        AppleHealthKit.Constants.Permissions.Steps,
        AppleHealthKit.Constants.Permissions.BodyMass,
      ],
      write: [
        AppleHealthKit.Constants.Permissions.Steps,
        AppleHealthKit.Constants.Permissions.BodyMass,
      ],
    },
  } as HealthKitPermissions;

  useEffect(() => {
    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.log('[ERROR] Cannot grant HealthKit permissions!', error);
        return;
      }

      const today = new Date().toISOString();

      // ----- Get step count -----
      AppleHealthKit.getStepCount(
        { date: today, includeManuallyAdded: false },
        (err: Object, results: HealthValue) => {
          if (err) {
            console.log('[ERROR] getStepCount', err);
            return;
          }
          setSteps(results.value);
        },
      );

      // ----- Get latest weight -----
      AppleHealthKit.getLatestWeight(
        { unit: 'lb' as HealthUnit },
        (err: Object, result: HealthValue) => {
          if (err) {
            console.log('[ERROR] getLatestWeight', err);
            return;
          }
          setWeight(result.value);
        },
      );
    });
  }, []);

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Today's Activity</ThemedText>

      <View style={styles.metricContainer}>
        <ThemedText style={styles.metricLabel}>Steps</ThemedText>
        <ThemedText style={styles.metricValue}>
          {steps !== null ? steps.toLocaleString() : 'Loading...'}
        </ThemedText>
      </View>

      <View style={styles.metricContainer}>
        <ThemedText style={styles.metricLabel}>Weight</ThemedText>
        <ThemedText style={styles.metricValue}>
          {weight !== null ? `${weight.toFixed(1)} kg` : 'Loading...'}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    color: Colors.light.text,
  },
  metricContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.light.blue,
  },
});
