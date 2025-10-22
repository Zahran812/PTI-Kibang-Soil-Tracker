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
import { db } from "@/lib/firebase";
import MetricCard from "@/components/home/MetricCard";
import SensorChart from "@/components/home/SensorChart";
import Notification from "@/components/home/Notification";

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
  const [notifications, setNotifications] = useState<
    { id: number; message: string }[]
  >([]);

  const addNotification = (message: string) => {
    setNotifications((prev) => {
      if (prev.some((n) => n.message === message)) return prev;
      const newNotifications = [...prev, { id: Date.now(), message }];
      return newNotifications.slice(-5);
    });
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    const latestSensorRef = ref(db, "sensors/latest");
    const unsubscribeLatest = onValue(latestSensorRef, (snapshot) => {
      if (snapshot.exists()) {
        const data: SensorData = snapshot.val();
        setLatestData(data);
        const { ph, suhu, kelembaban } = data;
        if (ph < SENSOR_THRESHOLDS.ph[0] || ph > SENSOR_THRESHOLDS.ph[1]) {
          addNotification(
            `Perhatian: pH tanah (${ph.toFixed(
              1
            )}) di luar batas normal (${SENSOR_THRESHOLDS.ph.join(" - ")}).`
          );
        }
        if (
          suhu < SENSOR_THRESHOLDS.suhu[0] ||
          suhu > SENSOR_THRESHOLDS.suhu[1]
        ) {
          addNotification(
            `Perhatian: Suhu tanah (${suhu.toFixed(
              1
            )}°C) di luar batas normal (${SENSOR_THRESHOLDS.suhu.join(
              " - "
            )}°C).`
          );
        }
        if (
          kelembaban < SENSOR_THRESHOLDS.kelembaban[0] ||
          kelembaban > SENSOR_THRESHOLDS.kelembaban[1]
        ) {
          addNotification(
            `Perhatian: Kelembaban tanah (${kelembaban.toFixed(
              1
            )}%) di luar batas normal (${SENSOR_THRESHOLDS.kelembaban.join(
              " - "
            )}%).`
          );
        }
      }
    });

    const historySensorQuery = query(
      ref(db, "sensors/history"),
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
    <>
      {/* --- Container Notifikasi (Posisi Fixed) --- */}
      <div className="fixed top-20 right-4 w-full max-w-sm z-50 space-y-4">
        {notifications.map((notif) => (
          <Notification
            key={notif.id}
            message={notif.message}
            type="warning"
            onClose={() => removeNotification(notif.id)}
          />
        ))}
      </div>

      {/* --- Konten Utama Dashboard --- */}
      <div className="bg-gray-50 min-h-full p-4 sm:p-6 lg:p-8 space-y-8">
        {/* --- Bagian Metrik --- */}
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

        {/* --- Bagian Grafik --- */}
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
    </>
  );
}
