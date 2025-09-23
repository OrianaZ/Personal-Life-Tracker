//general
import { useRouter } from 'expo-router';
import React, { useContext, useEffect } from 'react';
import { NativeModules, Platform } from 'react-native';

//context
import { useFasting } from '@/components/context/FastingContext';
import { MealsContext } from '@/components/context/MealsContext';
import { useMeds } from '@/components/context/MedsContext';
import { useWater } from '@/components/context/WaterContext';

const { LiveActivity } = NativeModules;

export const NotificationsManager: React.FC = () => {
  const router = useRouter();
  const fasting = useFasting();
  const { meals } = useContext(MealsContext);
  const { medications, takenTimes } = useMeds();
  const { getTodayIntake } = useWater();

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    let activityId: string;

    const startActivity = async () => {
      const daysOfWeek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const today = daysOfWeek[new Date().getDay()];
      const todayMeal = meals[today] || { out: '', main: '', side: '' };
      const dinnerText = todayMeal.main || 'Not logged';

      const now = new Date();
      let nextMedication: string | null = null;
      medications.forEach((med) => {
        med.times.forEach((t, idx) => {
          const taken = takenTimes[med.id]?.[idx];
          const medTime = new Date();
          medTime.setHours(t.getHours(), t.getMinutes(), 0, 0);
          if (!taken && medTime > now && !nextMedication) {
            nextMedication = `${med.name} at ${medTime.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit'})}`;
          }
        });
      });

      const todayIntake = getTodayIntake();

      try {
        activityId = await LiveActivity.startActivity(
          'Health Overview',
          fasting.isFasting ? `In progress (${fasting.timerText})` : 'Not fasting',
          dinnerText,
          todayIntake.water,
          todayIntake.soda
        );
      } catch (e) {
        console.error('Failed to start Live Activity', e);
      }
    };

    startActivity();

    // Optionally, return a cleanup to stop the activity on unmount
    return () => {
      if (activityId) {
        LiveActivity.stopActivity(activityId);
      }
    };
  }, [fasting, meals, medications, takenTimes, getTodayIntake]);

  return null;
};
