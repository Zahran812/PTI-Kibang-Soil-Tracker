"use client";

import { useEffect, useState, useRef } from "react";
import { onValue, ref } from "firebase/database";
import { dbRealtime } from "@/lib/firebase";
import MetricCard from "@/components/home/MetricCard";
import SensorChart from "@/components/home/SensorChart";

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
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const [latestData, setLatestData] = useState(initialData);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const bufferRef = useRef<SensorData | null>(null);

  useEffect(() => {
    const latestSensorRef = ref(dbRealtime, "sensors/latest");
    const unsubscribeLatest = onValue(latestSensorRef, (snapshot) => {
      if (snapshot.exists()) {
        const data: SensorData = snapshot.val();
        bufferRef.current = {
          ...data,
          timestamp: data.timestamp || Date.now(),
        };
      }
    });

    // Set interval setiap 5 detik untuk ambil dari buffer
    const interval = setInterval(() => {
      if (!bufferRef.current) return;

      const data = bufferRef.current;
      setLatestData(data);

      setHistory((prev) => {
        const newEntry: HistoryEntry = {
          time: formatTime(data.timestamp!),
          ph: data.ph,
          suhu: data.suhu,
          kelembaban: data.kelembaban,
        };

        const updated = [...prev, newEntry];
        // Simpan hanya 10 data terakhir
        return updated.slice(-10);
      });
    }, 5000); // update tiap 5 detik

    return () => {
      unsubscribeLatest();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-gray-50 min-h-full p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Metric Cards */}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SensorChart     
          title="Grafik pH"
          unit=""
          color="#22c55e"
          getLatestValue={() => latestData.ph}
          interval={1000}
        />
        <SensorChart
          title="Grafik Suhu"
          unit="°C"
          color="#f97316"
          getLatestValue={() => latestData.suhu}
          interval={1000} 
        />
        <SensorChart
          title="Grafik Kelembaban"
          unit="%"
          color="#3b82f6"
          getLatestValue={() => latestData.kelembaban}
          interval={1000}
        />
      </div>
    </div>
  );
}
