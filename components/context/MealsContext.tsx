//general
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useEffect, useState } from 'react';


const STORAGE_KEYS = { MEALS: 'MEALS_DATA' };
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Meal = { out: string; main: string; side: string };
type MealsData = { [key: string]: Meal };

type MealsContextType = {
  meals: MealsData;
  setMeals: React.Dispatch<React.SetStateAction<MealsData>>;
};

export const MealsContext = createContext<MealsContextType>({
  meals: {},
  setMeals: () => {},
});

export const MealsProvider = ({ children }: { children: ReactNode }) => {
  const [meals, setMeals] = useState<MealsData>({});

  useEffect(() => {
    const loadMeals = async () => {
      const mealsJson = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
      if (mealsJson) {
        setMeals(JSON.parse(mealsJson));
      } else {
        const defaultMeals = daysOfWeek.reduce((acc, day) => {
          acc[day] = { out: '', main: '', side: '' };
          return acc;
        }, {} as MealsData);
        setMeals(defaultMeals);
        await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(defaultMeals));
      }
    };
    loadMeals();
  }, []);

  // Save to AsyncStorage whenever meals change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
  }, [meals]);

  return (
    <MealsContext.Provider value={{ meals, setMeals }}>
      {children}
    </MealsContext.Provider>
  );
};
