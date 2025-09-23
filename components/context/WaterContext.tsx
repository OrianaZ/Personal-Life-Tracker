//general
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import React, { createContext, useContext, useEffect, useState } from "react";


type DailyIntake = {
  water: number;
  soda: number;
};

type WaterContextType = {
  log: Record<string, DailyIntake>;
  addWater: (oz: number) => void;
  addSoda: (oz: number) => void;
  updateIntake: (date: string, intake: DailyIntake) => void;
  getTodayIntake: () => DailyIntake;
};

const WaterContext = createContext<WaterContextType | undefined>(undefined);

export const WaterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [log, setLog] = useState<Record<string, DailyIntake>>({});

  const todayKey = dayjs().format("YYYY-MM-DD");

  useEffect(() => {
    AsyncStorage.getItem("waterLog").then((data) => {
      if (data) setLog(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("waterLog", JSON.stringify(log));
  }, [log]);

  const addWater = (oz: number) => {
    setLog((prev) => {
      const today = prev[todayKey] || { water: 0, soda: 0 };
      return { ...prev, [todayKey]: { ...today, water: today.water + oz } };
    });
  };

  const addSoda = (oz: number) => {
    setLog((prev) => {
      const today = prev[todayKey] || { water: 0, soda: 0 };
      return { ...prev, [todayKey]: { ...today, soda: today.soda + oz } };
    });
  };

  const getTodayIntake = () => log[todayKey] || { water: 0, soda: 0 };

  const updateIntake = (date: string, intake: DailyIntake) => {
    setLog((prev) => ({
      ...prev,
      [date]: intake,
    }));
  };

  return (
    <WaterContext.Provider value={{ log, addWater, addSoda, updateIntake, getTodayIntake }}>
      {children}
    </WaterContext.Provider>
  );
};

export const useWater = () => {
  const ctx = useContext(WaterContext);
  if (!ctx) throw new Error("useWater must be used inside WaterProvider");
  return ctx;
};
