// app/dashboard/home/client.tsx
"use client";

import { useEffect, useState } from "react";
import {
  onValue,
  ref,
  query,
  limitToLast,
  orderByChild,
} from "firebase/database";
import { dbRealtime } from "@/lib/firebase";
import MetricCard from "@/components/home/MetricCard";
import SensorChart from "@/components/home/SensorChart";

// Tipe Data
interface SensorData {
  ph: number;
  suhu: number;
  kelembaban: number;
  timestamp?: number;
}

interface HistoryEntry {
  time: string;
  ph: number;
  suhu: number;
  kelembaban: number;
}

interface DashboardClientProps {
  initialData: SensorData;
}

const SENSOR_THRESHOLDS = {
  ph: [5.5, 7.0] as [number, number],
  suhu: [25, 30] as [number, number],
  kelembaban: [60, 80] as [number, number],
};

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const [latestData, setLatestData] = useState(initialData);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const latestSensorRef = ref(dbRealtime, "sensors/latest");
    const unsubscribeLatest = onValue(latestSensorRef, (snapshot) => {
      if (snapshot.exists()) {
        const data: SensorData = snapshot.val();
        setLatestData(data);
      }
    });

    const historySensorQuery = query(
      ref(dbRealtime, "sensors/history"),
      orderByChild("timestamp"),
      limitToLast(10)
    );
    const unsubscribeHistory = onValue(
      historySensorQuery,
      (snapshot) => {
        if (snapshot.exists()) {
          const historyData: HistoryEntry[] = [];
          snapshot.forEach((childSnapshot) => {
            const data: SensorData = childSnapshot.val();
            const timestamp = data.timestamp || Date.now();
            historyData.push({
              time: formatTime(timestamp),
              ph: data.ph,
              suhu: data.suhu,
              kelembaban: data.kelembaban,
            });
          });
          setHistory(historyData);
        } else {
          setHistory([]);
        }
      },
      (error) => {
        console.error("Firebase history read failed:", error);
        setHistory([]);
      }
    );

    return () => {
      unsubscribeLatest();
      unsubscribeHistory();
    };
  }, []);

  return (

    <div className="bg-gray-50 min-h-full p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="pH Tanah"
          value={latestData.ph}
          thresholds={SENSOR_THRESHOLDS.ph}
        />
        <MetricCard
          title="Suhu Tanah"
          value={latestData.suhu}
          unit="°C"
          thresholds={SENSOR_THRESHOLDS.suhu}
        />
        <MetricCard
          title="Kelembaban"
          value={latestData.kelembaban}
          unit="%"
          thresholds={SENSOR_THRESHOLDS.kelembaban}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SensorChart title="Grafik pH" data={history} dataKey="ph" unit="" />
        <SensorChart
          title="Grafik Suhu"
          data={history}
          dataKey="suhu"
          unit="°C"
        />
        <SensorChart
          title="Grafik Kelembaban"
          data={history}
          dataKey="kelembaban"
          unit="%"
        />
      </div>
    </div>
  );
}
