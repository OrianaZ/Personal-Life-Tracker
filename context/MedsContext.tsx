import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEYS = {
  MEDICATIONS: "MEDICATIONS",
};

export type Medication = {
  id: string;
  name: string;
  pills: string;
  times: Date[];
};

type MedsContextType = {
  medications: Medication[];
  setMedications: (meds: Medication[]) => void;
  nextMedications: { time: Date; meds: Medication[] } | null;
};

const MedsContext = createContext<MedsContextType | undefined>(undefined);

export const useMeds = () => {
  const ctx = useContext(MedsContext);
  if (!ctx) throw new Error("useMeds must be used within MedsProvider");
  return ctx;
};

export const MedsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [nextMedications, setNextMedications] = useState<{ time: Date; meds: Medication[] } | null>(null);

  // Load from storage
  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.MEDICATIONS);
      if (stored) {
        const parsed: any[] = JSON.parse(stored);
        const meds = parsed.map((m) => ({
          ...m,
          times: m.times.map((t: string) => new Date(t)),
        }));
        setMedications(meds);
      }
    };
    load();
  }, []);

  // Save to storage
  useEffect(() => {
    AsyncStorage.setItem(
      STORAGE_KEYS.MEDICATIONS,
      JSON.stringify(
        medications.map((m) => ({
          ...m,
          times: m.times.map((t) => t.toISOString()),
        }))
      )
    );

    // Recalculate next meds
    const now = new Date();
    const upcomingMap = new Map<number, Medication[]>();

    medications.forEach((med) => {
      med.times.forEach((time) => {
        const medTime = new Date(time);
        medTime.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
        if (medTime.getTime() < now.getTime()) {
          // shift to next day if time passed
          medTime.setDate(medTime.getDate() + 1);
        }
        const key = medTime.getTime();
        if (!upcomingMap.has(key)) upcomingMap.set(key, []);
        upcomingMap.get(key)!.push(med);
      });
    });

    // Find soonest upcoming
    const sortedTimes = Array.from(upcomingMap.keys()).sort((a, b) => a - b);
    if (sortedTimes.length > 0) {
      const soonest = sortedTimes[0];
      setNextMedications({ time: new Date(soonest), meds: upcomingMap.get(soonest)! });
    } else {
      setNextMedications(null);
    }
  }, [medications]);

  return (
    <MedsContext.Provider value={{ medications, setMedications, nextMedications }}>
      {children}
    </MedsContext.Provider>
  );
};
