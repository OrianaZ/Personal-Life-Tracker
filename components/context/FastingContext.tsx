//general
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs, { Dayjs } from "dayjs";
import React, { createContext, useContext, useEffect, useState } from "react";


interface FastingContextType {
  isFasting: boolean;
  timerText: string;
  fastStart: Dayjs | null;
  fastEnd: Dayjs | null;
  lastMealTime: Dayjs | null;
  fastLog: { [date: string]: number };
  editingDate: string | null;
  editingHours: string;
  editingMinutes: string;
  showEditModal: boolean;
  setFastStart: (d: Dayjs | null) => void;
  setFastEnd: (d: Dayjs | null) => void;
  setLastMealTime: (d: Dayjs | null) => void;
  setIsFasting: (b: boolean) => void;
  setEditingDate: (s: string | null) => void;
  setEditingHours: (s: string) => void;
  setEditingMinutes: (s: string) => void;
  setShowEditModal: (b: boolean) => void;
  handleStartFast: (fromTime: Date) => Promise<void>;
  handleEndFast: (endTime: Date) => Promise<void>;
  saveEditedFast: () => Promise<void>;
}

const FastingContext = createContext<FastingContextType>({} as FastingContextType);

export const useFasting = () => useContext(FastingContext);

export const FastingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ---------- State ----------
  const [fastStart, setFastStart] = useState<Dayjs | null>(null);
  const [fastEnd, setFastEnd] = useState<Dayjs | null>(null);
  const [lastMealTime, setLastMealTime] = useState<Dayjs | null>(null);
  const [isFasting, setIsFasting] = useState(false);
  const [now, setNow] = useState(dayjs());
  const [timerText, setTimerText] = useState("00:00:00");

  const [fastLog, setFastLog] = useState<{ [date: string]: number }>({});

  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingHours, setEditingHours] = useState<string>("");
  const [editingMinutes, setEditingMinutes] = useState<string>("");
  const [showEditModal, setShowEditModal] = useState(false);

  // ---------- Storage Keys ----------
  const STORAGE_KEYS = {
    FAST_START: "FAST_START",
    FAST_END: "FAST_END",
    IS_FASTING: "IS_FASTING",
    FAST_LOG: "FAST_LOG",
    LAST_MEAL: "LAST_MEAL",
  };

  // ---------- Effects ----------
  useEffect(() => {
    const interval = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadStorageData();
  }, []);
    
  useEffect(() => {
    if (lastMealTime) {
      AsyncStorage.setItem(STORAGE_KEYS.LAST_MEAL, lastMealTime.toISOString());
    }
  }, [lastMealTime]);


  useEffect(() => {
    let elapsed = 0;
    const fastStartRef = fastStart ?? lastMealTime;

    if (isFasting && fastStartRef) {
      elapsed = now.diff(fastStartRef, "second");
    } else {
      const evening = dayjs().hour(20).minute(0).second(0);
      const fastingStart = evening.isBefore(now) ? evening.add(1, "day") : evening;
      elapsed = Math.max(fastingStart.diff(now, "second"), 0);
    }

    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    setTimerText(
      `${hours.toString().padStart(2,"0")}:${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`
    );
  }, [now, isFasting, fastStart, lastMealTime]);

  // ---------- Persistence ----------
  const loadStorageData = async () => {
    try {
      const [savedFastStart, savedFastEnd, savedIsFasting, savedLog, savedLastMeal] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.FAST_START),
          AsyncStorage.getItem(STORAGE_KEYS.FAST_END),
          AsyncStorage.getItem(STORAGE_KEYS.IS_FASTING),
          AsyncStorage.getItem(STORAGE_KEYS.FAST_LOG),
          AsyncStorage.getItem(STORAGE_KEYS.LAST_MEAL),
        ]);

      if (savedFastStart) setFastStart(dayjs(savedFastStart));
      if (savedFastEnd) setFastEnd(dayjs(savedFastEnd));
      if (savedIsFasting) setIsFasting(savedIsFasting === "true");
      if (savedLog) setFastLog(JSON.parse(savedLog));
      if (savedLastMeal) setLastMealTime(dayjs(savedLastMeal));
    } catch (e) {
      console.log("Error loading data", e);
    }
  };

  // ---------- Handlers ----------
  const handleStartFast = async (fromTime: Date) => {
    const dayjsTime = dayjs(fromTime);
    setFastStart(dayjsTime);
    setFastEnd(null);
    setIsFasting(true);
    setLastMealTime(dayjsTime);

      
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.FAST_START, dayjsTime.toISOString()),
        AsyncStorage.removeItem(STORAGE_KEYS.FAST_END),
        AsyncStorage.setItem(STORAGE_KEYS.IS_FASTING, "true"),
        AsyncStorage.setItem(STORAGE_KEYS.LAST_MEAL, dayjsTime.toISOString()),
      ]);
    } catch (e) {
      console.log("Error saving start fast", e);
    }
  };

  const handleEndFast = async (endTime: Date) => {
    const endDayjs = dayjs(endTime);

    if (fastStart) {
      const elapsedSeconds = endDayjs.diff(fastStart, "second");
      const elapsedHours = +(elapsedSeconds / 3600).toFixed(2);

      const endDateStr = endDayjs.format("YYYY-MM-DD");
      const updatedLog = { ...fastLog, [endDateStr]: (fastLog[endDateStr] || 0) + elapsedHours };
      setFastLog(updatedLog);

      try {
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.FAST_LOG, JSON.stringify(updatedLog)),
          AsyncStorage.setItem(STORAGE_KEYS.FAST_END, endDayjs.toISOString()),
          AsyncStorage.setItem(STORAGE_KEYS.LAST_MEAL, endDayjs.toISOString()),
          AsyncStorage.setItem(STORAGE_KEYS.IS_FASTING, "false"),
          AsyncStorage.removeItem(STORAGE_KEYS.FAST_START),
        ]);
      } catch (e) {
        console.log("Error saving end fast", e);
      }
    }

    setFastStart(null);
    setFastEnd(endDayjs);
    setIsFasting(false);
    setLastMealTime(endDayjs);
  };

  const saveEditedFast = async () => {
    if (!editingDate) return;

    const hours = parseInt(editingHours) || 0;
    const minutes = parseInt(editingMinutes) || 0;
    const totalHours = hours + minutes / 60;

    const updatedLog = { ...fastLog, [editingDate]: totalHours };
    setFastLog(updatedLog);

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FAST_LOG, JSON.stringify(updatedLog));
    } catch (e) {
      console.log("Error saving edited fast", e);
    }
    setShowEditModal(false);
    setEditingDate(null);
    setEditingHours("");
    setEditingMinutes("");
  };

  return (
    <FastingContext.Provider
      value={{
        isFasting,
        timerText,
        fastStart,
        fastEnd,
        lastMealTime,
        fastLog,
        editingDate,
        editingHours,
        editingMinutes,
        showEditModal,
        setFastStart,
        setFastEnd,
        setLastMealTime,
        setIsFasting,
        setEditingDate,
        setEditingHours,
        setEditingMinutes,
        setShowEditModal,
        handleStartFast,
        handleEndFast,
        saveEditedFast,
      }}
    >
      {children}
    </FastingContext.Provider>
  );
};
