import React, { createContext, useContext, useState, useEffect } from "react";
import { NativeModules } from "react-native";
import BrokenHealthKit, { HealthKitPermissions, HealthUnit, HealthValue } from "react-native-health";

const AppleHealthKit = NativeModules.AppleHealthKit as typeof BrokenHealthKit;
AppleHealthKit.Constants = BrokenHealthKit.Constants;

type WeightEntry = { date: string; weight: number };

type ActivityContextType = {
  steps: number | null;
  weightEntries: WeightEntry[];
  addWeight: (weight: number) => void;
};

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [steps, setSteps] = useState<number | null>(null);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);

  const permissions: HealthKitPermissions = {
    permissions: {
      read: [
        AppleHealthKit.Constants.Permissions.Steps,
        AppleHealthKit.Constants.Permissions.BodyMass,
      ],
      write: [AppleHealthKit.Constants.Permissions.BodyMass],
    },
  };
    
    const fetchSteps = () => {
        const today = new Date().toISOString();
        AppleHealthKit.getStepCount(
          { date: today, includeManuallyAdded: false },
          (err: Object, results: HealthValue) => {
            if (!err && results?.value != null) {
              setSteps(Math.round(results.value));
            }
          }
        );
      };
    
    const fetchLatestWeight = () => {
      AppleHealthKit.getLatestWeight({ unit: "lb" as HealthUnit }, (err: Object, result: HealthValue) => {
        if (!err && result?.value) {
          const entry: WeightEntry = { date: new Date().toISOString(), weight: result.value };
          setWeightEntries([entry]);
        }
      });
    };

  useEffect(() => {
    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.log("[ERROR] Cannot grant HealthKit permissions!", error);
        return;
      }

      const today = new Date().toISOString();

        fetchSteps();
        fetchLatestWeight();
    });
  }, []);

  const addWeight = (weight: number) => {
    const entry: WeightEntry = { date: new Date().toISOString(), weight };
    setWeightEntries((prev) => [entry, ...prev]);
    AppleHealthKit.saveWeight({ value: weight, unit: "lb" as HealthUnit }, (err: Object) => {
      if (err) console.log("[ERROR] saving weight", err);
    });
  };

  return (
    <ActivityContext.Provider value={{ steps, weightEntries, addWeight, fetchSteps }}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useHealth = () => {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error("useHealth must be used inside HealthProvider");
  return ctx;
};
