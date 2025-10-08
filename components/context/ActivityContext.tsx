//general
import React, { createContext, useContext, useState, useEffect } from "react";
import { NativeModules } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BrokenHealthKit, {
  HealthKitPermissions,
  HealthUnit,
  HealthValue,
} from "react-native-health";

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
      const today = new Date().toISOString();
      AppleHealthKit.getStepCount(
        { date: today, includeManuallyAdded: true },
        (err: Object, results: HealthValue) => {
          if (err || !results || results.value == null) {
            console.log("No steps found for today");
            setSteps(0);
            return;
          }
          setSteps(Math.round(results.value));
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

    return new Promise<void>((resolve) => {
      AppleHealthKit.getSamples(
        {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          type: "StepCount",
          unit: "count",
          includeManuallyAdded: true,
        },
                                
        (err: Object, results: HealthValue[]) => {
          if (err || !results) {
            console.log("Error fetching step samples", err);
            resolve();
            return;
          }
            
          const logData: ActivityLog = {};
            
          results.forEach((r) => {
              if (!r.start) return;
              const dateObj = new Date(r.start);
              if (isNaN(dateObj.getTime())) return;
              const dateStr = dateObj.toISOString().split("T")[0];
              if (!logData[dateStr]) logData[dateStr] = { steps: 0 };
              logData[dateStr].steps = (logData[dateStr].steps || 0) + r.quantity;
          });

        // Fetch historical weights
        AppleHealthKit.getWeightSamples(
            {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              unit: "lb",
            },
            
            (err2: Object, results2: HealthValue[]) => {
                if (err2 || !results2) {
                  console.log("Error fetching weight samples", err2);
                  resolve();
                  return;
                }
                
                results2.forEach((r) => {
                      if (!r.startDate) return;

                      const dateObj = new Date(r.startDate);
                      if (isNaN(dateObj.getTime())) return;

                      const dateStr = dateObj.toISOString().split("T")[0];

                      // Keep the most recent entry per day
                      const existing = logData[dateStr]?.weightDate;
                      const currentTimestamp = dateObj.getTime();

                      if (!existing || currentTimestamp > existing) {
                        if (!logData[dateStr]) logData[dateStr] = {};
                        logData[dateStr].weight = r.value;
                        logData[dateStr].weightDate = currentTimestamp; // store timestamp for comparison
                      }
                    });
                

            AsyncStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(logData));
              setLog(logData);
              resolve();
            }
          );
        }
      );
    });
  };

  // ----------------------
  // Add + save new weight
  // ----------------------
    const addWeight = (weight: number) => {
      const entryDate = new Date().toISOString().split("T")[0];

      const entry: WeightEntry = { date: new Date().toISOString(), weight };
      setWeightEntries((prev) => [entry, ...prev]);

      setLog((prev) => ({
        ...prev,
        [entryDate]: {
          ...(prev[entryDate] || {}),
          weight,
        },
      }));

      AppleHealthKit.saveWeight({ value: weight, unit: "lb" as HealthUnit }, (err: Object) => {
        if (err) console.log("[ERROR] saving weight", err);
      });

      AsyncStorage.setItem(
        STORAGE_KEYS.ACTIVITY_LOG,
        JSON.stringify({
          ...log,
          [entryDate]: { ...(log[entryDate] || {}), weight },
        })
      );
    };


  // ----------------------
  // Manual refresh trigger
  // ----------------------
  const refreshData = () => {
    console.log("Refreshing HealthKit data...");
    fetchHistoricalData();
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
