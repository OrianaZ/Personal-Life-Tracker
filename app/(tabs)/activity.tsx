import { ThemedText } from '@/components/theme/ThemedText';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AppleHealthKit, { HealthKitPermissions, HealthValue } from 'react-native-health';

export default function ActivityScreen() {
  const [steps, setSteps] = useState<number | null>(null);
  
  /* Permission options */
  const permissions = {
    permissions: {
      read: [
        AppleHealthKit.Constants.Permissions.HeartRate,
        AppleHealthKit.Constants.Permissions.Steps, 
        AppleHealthKit.Constants.Permissions.StepCount,      
      ],
      write: [
        AppleHealthKit.Constants.Permissions.Steps,
        AppleHealthKit.Constants.Permissions.StepCount,
      ],
    }
  } as HealthKitPermissions

  AppleHealthKit.initHealthKit(permissions, (error: string) => {

    if (error) {
      console.log('[ERROR] Cannot grant permissions!')
    }

    let options = {
        date: new Date().toISOString(), 
        includeManuallyAdded: false,
    }

    AppleHealthKit.getStepCount(
      options,
      (err: Object, results: HealthValue) => {
        if (err) {
          return
        }
        setSteps(results.value);
        console.log(results)
      },
    )
  })

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Today's Steps</ThemedText>
      <ThemedText style={styles.steps}>{steps !== null ? steps.toLocaleString() : 'Loading...'}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  steps: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});
