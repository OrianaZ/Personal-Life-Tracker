// context/FastingContext.tsx
import dayjs, { Dayjs } from "dayjs";
import React, { createContext, useContext, useEffect, useState } from "react";

interface FastingContextType {
  isFasting: boolean;
  timerText: string;
  fastStart: Dayjs | null;
  lastMealTime: Dayjs | null;
  setFastStart: (d: Dayjs | null) => void;
  setLastMealTime: (d: Dayjs | null) => void;
  setIsFasting: (b: boolean) => void;
}

const FastingContext = createContext<FastingContextType>({
  isFasting: false,
  timerText: "00:00:00",
  fastStart: null,
  lastMealTime: null,
  setFastStart: () => {},
  setLastMealTime: () => {},
  setIsFasting: () => {},
});

export const useFasting = () => useContext(FastingContext);

export const FastingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fastStart, setFastStart] = useState<Dayjs | null>(null);
  const [lastMealTime, setLastMealTime] = useState<Dayjs | null>(null);
  const [isFasting, setIsFasting] = useState(false);
  const [now, setNow] = useState(dayjs());
  const [timerText, setTimerText] = useState("00:00:00");

  useEffect(() => {
    const interval = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(interval);
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

    setTimerText(`${hours.toString().padStart(2,"0")}:${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`);
  }, [now, isFasting, fastStart, lastMealTime]);

  return (
    <FastingContext.Provider value={{ isFasting, timerText, fastStart, lastMealTime, setFastStart, setLastMealTime, setIsFasting }}>
      {children}
    </FastingContext.Provider>
  );
};
