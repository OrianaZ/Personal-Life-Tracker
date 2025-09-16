import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEYS = {
  MEDICATIONS: "MEDICATIONS",
  TAKEN_TIMES: "TAKEN_TIMES",
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
  takenTimes: { [medId: string]: boolean[] };
  toggleTaken: (medId: string, idx: number) => void;
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
  const [takenTimes, setTakenTimes] = useState<{ [medId: string]: boolean[] }>({});
  const [wait, setWait] = useState(false);
  const [currentDayKey, setCurrentDayKey] = useState<string>(new Date().toDateString());

// Load medications + takenTimes
useEffect(() => {
  const loadData = async () => {
    const storedMeds = await AsyncStorage.getItem(STORAGE_KEYS.MEDICATIONS);
    const storedTaken = await AsyncStorage.getItem(STORAGE_KEYS.TAKEN_TIMES);
    const todayKey = new Date().toDateString();

    let meds: Medication[] = [];
    if (storedMeds) {
      meds = JSON.parse(storedMeds).map((m: any) => ({
        ...m,
        times: m.times.map((t: string) => new Date(t)),
      }));
      setMedications(meds);
    }

    let initTaken: { [medId: string]: boolean[] } = {};

    if (storedTaken) {
      try {
        const parsed = JSON.parse(storedTaken);
        if (parsed?.date === todayKey && parsed?.data) {
          initTaken = parsed.data;
        }
      } catch {
        console.warn("Failed to parse takenTimes");
      }
    }

    meds.forEach((med) => {
      if (!initTaken[med.id] || initTaken[med.id].length !== med.times.length) {
        initTaken[med.id] = med.times.map(() => false);
      }
    });

    setTakenTimes(initTaken);
    setCurrentDayKey(todayKey);
    setWait(true);
  };

  loadData();
}, []);

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
  }, [medications]);

  // Save taken to storage whenever they change  
useEffect(() => {
    if (!wait) return;
  const saveTakenTimes = async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.TAKEN_TIMES,
        JSON.stringify({ date: currentDayKey, data: takenTimes })
      );
    } catch (e) {
      console.warn("Failed to save takenTimes:", e);
    }
  };
  saveTakenTimes();
}, [takenTimes]);

  useEffect(() => {
    const checkMidnight = () => {
      const todayKey = new Date().toDateString();
      if (currentDayKey !== todayKey) {
        const resetTaken = medications.reduce((acc, med) => {
          acc[med.id] = med.times.map(() => false);
          return acc;
        }, {} as { [medId: string]: boolean[] });

        setTakenTimes(resetTaken);
        setCurrentDayKey(todayKey);
      }
    };
    checkMidnight();

    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();

    const timeout = setTimeout(() => {
      const resetTaken = medications.reduce((acc, med) => {
        acc[med.id] = med.times.map(() => false);
        return acc;
      }, {} as { [medId: string]: boolean[] });

      setTakenTimes(resetTaken);
      setCurrentDayKey(new Date().toDateString());
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, [medications]);

  const toggleTaken = (medId: string, idx: number) => {
    setTakenTimes((prev) => {
      const med = medications.find((m) => m.id === medId);
      if (!med) return prev;
      const current = prev[medId] || Array(med.times.length).fill(false);
      const newArr = [...current];
      newArr[idx] = !newArr[idx];
      return { ...prev, [medId]: newArr };
    });
  };

  // Calculate next unchecked medications
  useEffect(() => {
    const now = new Date();
    let nextMedTime: Date | null = null;
    let nextMeds: Medication[] = [];

    medications.forEach((med) => {
      const taken = takenTimes[med.id] || Array(med.times.length).fill(false);

      med.times.forEach((time, idx) => {
        const medTime = new Date(time);
        medTime.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());

        if (!taken[idx]) {
          if (!nextMedTime || medTime < nextMedTime) {
            nextMedTime = medTime;
            nextMeds = [med];
          } else if (medTime.getTime() === nextMedTime.getTime()) {
            nextMeds.push(med);
          }
        }
      });
    });

    if (nextMedTime) {
      setNextMedications({ time: nextMedTime, meds: nextMeds });
    } else {
      setNextMedications(null);
    }
  }, [medications, takenTimes]);

  return (
    <MedsContext.Provider value={{ medications, setMedications, nextMedications, takenTimes, toggleTaken }}>
      {children}
    </MedsContext.Provider>
  );
};
