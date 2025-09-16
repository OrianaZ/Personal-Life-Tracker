import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs, { Dayjs } from "dayjs";
import React, { createContext, useContext, useEffect, useState } from "react";

interface FastingContextType {
  isFasting: boolean;
  timerText: string;
  fastStart: Dayjs | null;
  lastMealTime: Dayjs | null;
  fastLog: { [date: string]: number };
  pickerTime: Date;
  editingDate: string | null;
  editingHours: string;
  editingMinutes: string;
  showEditModal: boolean;
  setFastStart: (d: Dayjs | null) => void;
  setLastMealTime: (d: Dayjs | null) => void;
  setIsFasting: (b: boolean) => void;
  setPickerTime: (d: Date) => void;
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
  const [lastMealTime, setLastMealTime] = useState<Dayjs | null>(null);
  const [isFasting, setIsFasting] = useState(false);
  const [now, setNow] = useState(dayjs());
  const [timerText, setTimerText] = useState("00:00:00");

  const [pickerTime, setPickerTime] = useState<Date>(new Date());
  const [fastLog, setFastLog] = useState<{ [date: string]: number }>({});

  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingHours, setEditingHours] = useState<string>("");
  const [editingMinutes, setEditingMinutes] = useState<string>("");
  const [showEditModal, setShowEditModal] = useState(false);

  // ---------- Storage Keys ----------
  const STORAGE_KEYS = {
    FAST_START: "FAST_START",
    IS_FASTING: "IS_FASTING",
    PICKER_TIME: "PICKER_TIME",
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
      const [savedFastStart, savedIsFasting, savedPickerTime, savedLog, savedLastMeal] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.FAST_START),
          AsyncStorage.getItem(STORAGE_KEYS.IS_FASTING),
          AsyncStorage.getItem(STORAGE_KEYS.PICKER_TIME),
          AsyncStorage.getItem(STORAGE_KEYS.FAST_LOG),
          AsyncStorage.getItem(STORAGE_KEYS.LAST_MEAL),
        ]);

      if (savedFastStart) setFastStart(dayjs(savedFastStart));
      if (savedIsFasting) setIsFasting(savedIsFasting === "true");
      if (savedPickerTime) setPickerTime(new Date(savedPickerTime));
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
    setIsFasting(true);
    setPickerTime(fromTime);
    setLastMealTime(dayjsTime);

    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.FAST_START, dayjsTime.toISOString()),
        AsyncStorage.setItem(STORAGE_KEYS.IS_FASTING, "true"),
        AsyncStorage.setItem(STORAGE_KEYS.PICKER_TIME, fromTime.toISOString()),
        AsyncStorage.setItem(STORAGE_KEYS.LAST_MEAL, dayjsTime.toISOString()),
      ]);
    } catch (e) {
      console.log("Error saving start fast", e);
    }
  };

  const handleEndFast = async (endTime: Date) => {
    if (fastStart) {
      const elapsedSeconds = dayjs(endTime).diff(fastStart, "second");
      const elapsedHours = +(elapsedSeconds / 3600).toFixed(2);

      const endDateStr = dayjs(endTime).format("YYYY-MM-DD");
      const updatedLog = { ...fastLog, [endDateStr]: (fastLog[endDateStr] || 0) + elapsedHours };
      setFastLog(updatedLog);

      try {
        await AsyncStorage.setItem(STORAGE_KEYS.FAST_LOG, JSON.stringify(updatedLog));
        await AsyncStorage.removeItem(STORAGE_KEYS.FAST_START);
        await AsyncStorage.setItem(STORAGE_KEYS.IS_FASTING, "false");
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_MEAL, dayjs(endTime).toISOString());
      } catch (e) {
        console.log("Error saving end fast", e);
      }
    }

    setFastStart(null);
    setIsFasting(false);
    setLastMealTime(dayjs(endTime));
    setPickerTime(endTime);
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
        lastMealTime,
        fastLog,
        pickerTime,
        editingDate,
        editingHours,
        editingMinutes,
        showEditModal,
        setFastStart,
        setLastMealTime,
        setIsFasting,
        setPickerTime,
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
