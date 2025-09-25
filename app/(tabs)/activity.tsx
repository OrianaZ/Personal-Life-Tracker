//general
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import BrokenHealthKit, { HealthKitPermissions, HealthUnit, HealthValue } from 'react-native-health';

//styles
import { activityStyles } from '@/components/styles/_activity.styles';

//theme
import { ThemedText } from '@/components/theme/ThemedText';

const NativeModules = require("react-native").NativeModules;
const AppleHealthKit = NativeModules.AppleHealthKit as typeof BrokenHealthKit;
AppleHealthKit.Constants = BrokenHealthKit.Constants;


export default function ActivityScreen() {
  const [steps, setSteps] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);

  // ----- HealthKit permissions -----
  const permissions: HealthKitPermissions = {
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
  };

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
    <View style={activityStyles.container}>
      <ThemedText style={activityStyles.title}>Today's Activity</ThemedText>

      <View style={activityStyles.metricContainer}>
        <ThemedText style={activityStyles.metricLabel}>Steps</ThemedText>
        <ThemedText style={activityStyles.metricValue}>
          {steps !== null ? steps.toLocaleString() : 'Loading...'}
        </ThemedText>
      </View>

      <View style={activityStyles.metricContainer}>
        <ThemedText style={activityStyles.metricLabel}>Weight</ThemedText>
        <ThemedText style={activityStyles.metricValue}>
          {weight !== null ? `${weight.toFixed(1)} kg` : 'Loading...'}
        </ThemedText>
      </View>
    </View>
  );
}
