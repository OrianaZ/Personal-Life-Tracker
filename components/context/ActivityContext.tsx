//general
import React, { createContext, useContext, useState, useEffect } from "react";
import { NativeModules } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BrokenHealthKit, {
  HealthKitPermissions,
  HealthUnit,
  HealthValue,
} from "react-native-health";
import dayjs from "dayjs";

const AppleHealthKit = NativeModules.AppleHealthKit as typeof BrokenHealthKit;
AppleHealthKit.Constants = BrokenHealthKit.Constants;

const STORAGE_KEYS = {
  ACTIVITY_LOG: "ACTIVITY_LOG",
};

type WeightEntry = { date: string; weight: number };

type ActivityLog = {
  [date: string]: {
    steps?: number;
    weight?: number;
  };
};

type ActivityContextType = {
  steps: number | null;
  weightEntries: WeightEntry[];
  log: ActivityLog;
  addWeight: (weight: number) => void;
  refreshData: () => Promise<void>;
  fetchSteps: () => void;
};

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [steps, setSteps] = useState<number | null>(null);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [log, setLog] = useState<ActivityLog>({});

  const permissions: HealthKitPermissions = {
    permissions: {
      read: [
        AppleHealthKit.Constants.Permissions.Steps,
        AppleHealthKit.Constants.Permissions.BodyMass,
      ],
      write: [AppleHealthKit.Constants.Permissions.BodyMass],
    },
  };

  // ----------------------
  // Fetch single-day steps
  // ----------------------
    const fetchSteps = () => {
      const today = dayjs().format("YYYY-MM-DD");
      AppleHealthKit.getStepCount(
        { date: new Date().toISOString(), includeManuallyAdded: true },
        (err, results) => {
          const todaySteps = err || !results?.value ? 0 : Math.round(results.value);
          setSteps(todaySteps);

          // update log
          setLog((prev) => ({
            ...prev,
            [today]: { ...prev[today], steps: todaySteps },
          }));

          AsyncStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG).then((cached) => {
            const existingLog = cached ? JSON.parse(cached) : {};
            const updatedLog = {
              ...existingLog,
              [today]: { ...existingLog[today], steps: todaySteps },
            };
            AsyncStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(updatedLog));
          });

        }
      );
    };


  // ----------------------
  // Fetch latest weight
  // ----------------------
    const fetchLatestWeight = () => {
      AppleHealthKit.getLatestWeight(
        { unit: "lb" as HealthUnit },
        (err: Object, result: HealthValue) => {
          if (err || !result?.value) {
            console.log("No weight found in HealthKit");
            setWeightEntries([]);
            return;
          }

          const entry: WeightEntry = { date: result.startDate, weight: result.value };
          setWeightEntries([entry]);
        }
      );
    };

  // ---------------------------------------
  // Fetch historical steps + weight (1 year)
  // ---------------------------------------
    const fetchHistoricalData = async (): Promise<void> => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 1);

      try {
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG);
        const existingLog: ActivityLog = cached ? JSON.parse(cached) : {};
        const logData: ActivityLog = { ...existingLog };
        const today = dayjs().format("YYYY-MM-DD");
        let changed = false;

        // ---- Steps ----
        const stepResults: HealthValue[] = await new Promise((resolve, reject) => {
          AppleHealthKit.getDailyStepCountSamples(
            {
              startDate: startDate.toISOString(),
              endDate: dayjs().subtract(1, "day").endOf("day").toISOString(),
              includeManuallyAdded: true,
            },
            (err, results) => (err ? reject(err) : resolve(results || []))
          );
        });

        stepResults.forEach((r) => {
          const dateStr = r.startDate.split("T")[0];
          const steps = Math.round(r.value);
          if (!logData[dateStr] || steps > (logData[dateStr].steps ?? 0)) {
            logData[dateStr] = { ...logData[dateStr], steps };
            changed = true;
          }
        });

        // ---- Weight ----
        const weightResults: HealthValue[] = await new Promise((resolve, reject) => {
          AppleHealthKit.getWeightSamples(
            { startDate: startDate.toISOString(), endDate: endDate.toISOString(), unit: "lb" },
            (err, results) => (err ? reject(err) : resolve(results || []))
          );
        });

        weightResults.forEach((r) => {
          if (!r.startDate) return;
          const dateStr = r.startDate.split("T")[0];
          const weight = r.value;
          if (!logData[dateStr] || weight !== logData[dateStr].weight) {
            logData[dateStr] = { ...logData[dateStr], weight };
            changed = true;
          }
        });

        // ---- Save ----
        if (changed) {
          await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(logData));
          setLog(logData);
        }
      } catch (e) {
        console.log("Error fetching historical data", e);
      }
    };



  // ----------------------
  // Add + save new weight
  // ----------------------
    const addWeight = (weight: number) => {
      const entryDate = new Date().toISOString().split("T")[0];

      const entry: WeightEntry = { date: new Date().toISOString(), weight };
      setWeightEntries((prev) => [entry, ...prev]);

      AppleHealthKit.saveWeight({ value: weight, unit: "lb" as HealthUnit }, (err: Object) => {
        if (err) console.log("[ERROR] saving weight", err);
      });

      setLog((prevLog) => {
        const updatedLog = { ...prevLog, [entryDate]: { ...prevLog[entryDate], weight } };
        AsyncStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(updatedLog));
        return updatedLog;
      });

    };


  // ----------------------
  // Manual refresh trigger
  // ----------------------
  const refreshData = async () => {
    await fetchHistoricalData();
    fetchSteps();
    fetchLatestWeight();
  };

  // ----------------------
  // Initialize + load cache
  // ----------------------
  useEffect(() => {
    AppleHealthKit.initHealthKit(permissions, async (error: string) => {
      if (error) {
        console.log("[ERROR] Cannot grant HealthKit permissions!", error);
        return;
      }

      try {
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG);
        if (cached) {
          setLog(JSON.parse(cached));
        } else {
          await fetchHistoricalData();
        }

        fetchSteps();
        fetchLatestWeight();
      } catch (e) {
        console.log("Error initializing health data", e);
      }
    });
  }, []);

  return (
    <ActivityContext.Provider
      value={{ steps, weightEntries, addWeight, log, refreshData, fetchSteps }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useHealth = () => {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error("useHealth must be used inside ActivityProvider");
  return ctx;
};
