"use client";

import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Notification from "@/components/home/Notification";
import { onValue, ref } from "firebase/database";
import { dbRealtime } from "@/lib/firebase";

// Tipe Data Notifikasi
interface AppNotification {
  id: number;
  message: string;
  type: "warning" | "info";
}

// Tipe Data Sensor
interface SensorData {
  ph: number;
  suhu: number;
  kelembaban: number;
  timestamp?: number;
}

const SENSOR_THRESHOLDS = {
  ph: [5.5, 7.0] as [number, number],
  suhu: [25, 30] as [number, number],
  kelembaban: [60, 80] as [number, number],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Fungsi untuk menambah notifikasi
  const addNotification = (
    message: string,
    type: "warning" | "info" = "warning"
  ) => {
    setNotifications((prev) => {
      // Jika notifikasi dengan pesan yang sama sudah ada, update saja
      const existing = prev.find((n) => n.message.startsWith(message.split("(")[0]));
      if (existing) {
        // Update bagian angka di akhir (misalnya ph berubah)
        const updated = prev.map((n) =>
          n.id === existing.id ? { ...n, message } : n
        );
        return updated;
      }

      // Jika belum ada, tambahkan notifikasi baru
      const newNotifications = [
        ...prev,
        { id: Date.now(), message, type },
      ];
      // Batasi hanya 5 notifikasi terakhir
      return newNotifications.slice(-5);
    });
  };

  // Fungsi untuk hapus notifikasi
  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Fetch data realtime dari Firebase
  useEffect(() => {
    if (!dbRealtime) {
      console.error("Firebase DB tidak terinisialisasi.");
      addNotification("Koneksi Firebase gagal, notifikasi nonaktif.", "info");
      return;
    }

    const latestSensorRef = ref(dbRealtime, "sensors/latest");

    const unsubscribe = onValue(
      latestSensorRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data: SensorData = snapshot.val();
          const { ph, suhu, kelembaban } = data;

          // Cek tiap threshold
          if (ph < SENSOR_THRESHOLDS.ph[0] || ph > SENSOR_THRESHOLDS.ph[1]) {
            addNotification(
              `Perhatian: pH tanah (${ph.toFixed(
                1
              )}) di luar batas normal (${SENSOR_THRESHOLDS.ph.join(" - ")}).`,
              "warning"
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
              )}°C).`,
              "warning"
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
              )}%).`,
              "warning"
            );
          }
        } else {
          addNotification("Tidak ada data sensor terbaru ditemukan.", "info");
        }
      },
      (error) => {
        console.error("Firebase latest sensor read failed:", error);
        addNotification("Gagal membaca data sensor dari Firebase.", "warning");
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex h-screen bg-white">
      {/* Container Notifikasi Terapung */}
      <div className="fixed top-4 right-4 w-full max-w-xs z-[100] space-y-2 pointer-events-none">
        {notifications.map((notif) => (
          <div key={notif.id} className="pointer-events-auto">
            <Notification
              id={notif.id}
              message={notif.message}
              type={notif.type}
              onClose={() => removeNotification(notif.id)}
            />
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Sidebar Mobile */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={closeSidebar}
          />
          <div className="fixed left-0 top-0 z-50 lg:hidden">
            <Sidebar onClose={closeSidebar} />
          </div>
        </>
      )}

      <div className="flex flex-col flex-1">
        <Header
          onToggleSidebar={toggleSidebar}
          notifications={notifications}
          removeNotification={removeNotification}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
