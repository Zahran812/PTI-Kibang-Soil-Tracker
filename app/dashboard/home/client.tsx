// app/dashboard/home/client.tsx
"use client";

import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "@/lib/firebase";
import MetricCard from "@/components/MetricCard";
import SensorChart from "@/components/SensorChart";

// Tipe Data
interface SensorData {
  ph: number;
  suhu: number;
  kelembaban: number;
}

interface HistoryEntry {
  time: string; // contoh: "14:00"
  ph: number;
  suhu: number;
  kelembaban: number;
}

interface DashboardClientProps {
  initialData: SensorData;
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const [latestData, setLatestData] = useState(initialData);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const latestSensorRef = ref(db, "sensors/latest");
    const unsubscribeLatest = onValue(latestSensorRef, (snapshot) => {
      if (snapshot.exists()) {
        setLatestData(snapshot.val());
      }
    });

    // TODO: Implementasikan pengambilan data historis dari Firebase
    // const historySensorRef = ref(db, 'sensors/history');
    // const unsubscribeHistory = onValue(historySensorRef, (snapshot) => { ... });

    return () => {
      unsubscribeLatest();
      // unsubscribeHistory();
    };
  }, []);

  return (
    <div className="bg-gray-50 min-h-full p-4 sm:p-6 lg:p-8 space-y-8">
      {/* --- Bagian Metrik --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="pH Tanah"
          value={latestData.ph}
          thresholds={[6.0, 7.0]}
        />
        <MetricCard title="Suhu Tanah" value={latestData.suhu} unit="°C" />
        <MetricCard title="Kelembaban" value={latestData.kelembaban} unit="%" />
      </div>

      {/* --- Bagian Grafik --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart untuk PH */}
        <SensorChart title="Grafik pH" data={history} dataKey="ph" unit="" />
        {/* Chart untuk Suhu */}
        <SensorChart
          title="Grafik Suhu"
          data={history}
          dataKey="suhu"
          unit="°C"
        />
        {/* Chart untuk Kelembaban */}
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
