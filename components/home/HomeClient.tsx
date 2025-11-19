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
  const setHistory = useState<HistoryEntry[]>([])[1];
  const [isDeviceActive, setIsDeviceActive] = useState(true);

  const bufferRef = useRef<SensorData | null>(null);
  const lastValidDataRef = useRef<SensorData | null>(null); // ⬅ FIX UTAMA
  const lastUpdateTime = useRef<number>(Date.now());
  const hasSavedSession = useRef<boolean>(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const latestSensorRef = ref(dbRealtime, "sensors/latest");

    // 🔄 Dengar Update Realtime DB
    const unsubscribeLatest = onValue(latestSensorRef, (snapshot) => {
      if (snapshot.exists()) {
        const data: SensorData = snapshot.val();

        const withTimestamp = {
          ...data,
          timestamp: data.timestamp || Date.now(),
        };

        // Simpan data raw ke buffer
        bufferRef.current = withTimestamp;

        // ⛔ FIX: JANGAN simpan pH = 0 sebagai nilai valid
        if (data.ph !== 0) {
          lastValidDataRef.current = withTimestamp;
        }

        lastUpdateTime.current = Date.now();
        setIsDeviceActive(true);
        hasSavedSession.current = false;
        setLatestData(withTimestamp);
      }
    });

    // 🧠 Update UI tiap 5 detik
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
        return updated.slice(-10);
      });
    }, 5000);

    // 🚨 Deteksi alat berhenti kirim data
    const checkInterval = setInterval(async () => {
      const now = Date.now();
      const diff = now - lastUpdateTime.current;

      if (diff > 3000 && !hasSavedSession.current) {
        console.warn("⚠️ Alat berhenti mengirim data (>3 detik)");

        // ⬅ FIX: Pakai nilai terakhir VALID, bukan buffer (yang bisa 0)
        const payload = lastValidDataRef.current || bufferRef.current;

        try {
          await fetch("/api/sensor-history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          console.log("✅ Data terakhir dikirim ke Firestore lewat server.");
          hasSavedSession.current = true;
        } catch (err) {
          console.error("❌ Gagal mengirim data terakhir:", err);
        }

        setIsDeviceActive(false);
      }
    }, 3000);

    return () => {
      unsubscribeLatest();
      clearInterval(interval);
      clearInterval(checkInterval);
    };
  }, []); // run sekali

  return (
    <div className="bg-gray-50 min-h-full p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Status Alat */}
      <div className="flex items-center justify-end">
        <h2 className="text-base text-black font-normal">Status Perangkat :</h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isDeviceActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {isDeviceActive ? "Aktif" : "Tidak Aktif"}
        </span>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="pH Tanah" value={latestData.ph} thresholds={SENSOR_THRESHOLDS.ph} />
        <MetricCard title="Suhu Tanah" value={latestData.suhu} unit="°C" thresholds={SENSOR_THRESHOLDS.suhu} />
        <MetricCard title="Kelembaban" value={latestData.kelembaban} unit="%" thresholds={SENSOR_THRESHOLDS.kelembaban} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SensorChart title="Grafik pH" unit="" color="#22c55e" getLatestValue={() => latestData.ph} interval={1000} />
        <SensorChart title="Grafik Suhu" unit="°C" color="#f97316" getLatestValue={() => latestData.suhu} interval={1000} />
        <SensorChart title="Grafik Kelembaban" unit="%" color="#3b82f6" getLatestValue={() => latestData.kelembaban} interval={1000} />
      </div>
    </div>
  );
}
