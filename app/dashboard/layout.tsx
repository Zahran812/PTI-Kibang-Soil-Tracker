"use client";

import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Notification from "@/components/home/Notification";
import { onValue, ref } from "firebase/database";
import { dbRealtime } from "@/lib/firebase";

// Tipe Data Notifikasi
interface AppNotification {
  id: number; // Tetap number (Date.now()) untuk key unik React
  keyId: string; // ID unik untuk mengidentifikasi jenis notifikasi
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

// Konstanta untuk mengidentifikasi jenis notifikasi (Key ID)
const NOTIFICATION_KEYS = {
  ph: "PH_OUT_OF_RANGE",
  suhu: "SUHU_OUT_OF_RANGE",
  kelembaban: "KELEMBABAN_OUT_OF_RANGE",
  firebaseError: "FIREBASE_ERROR",
  noData: "NO_SENSOR_DATA",
};

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

  // Fungsi untuk menambah/mengupdate/menghapus notifikasi
  const updateNotification = (
    keyId: string, // ID unik untuk identifikasi jenis notifikasi
    message: string | null, // null jika notifikasi harus dihapus
    type: "warning" | "info" = "warning"
  ) => {
    setNotifications((prev) => {
      // Cari berdasarkan keyId, bukan id number
      const existingIndex = prev.findIndex((n) => n.keyId === keyId);

      if (message === null) {
        // Hapus notifikasi jika message null (nilai sudah kembali normal)
        if (existingIndex !== -1) {
          return prev.filter((n) => n.keyId !== keyId);
        }
        return prev; // Tidak ada perubahan
      }

      if (existingIndex !== -1) {
        // Update notifikasi yang sudah ada
        const updated = [...prev];
        // Pertahankan id number (timestamp) yang lama, hanya update message
        updated[existingIndex] = { ...updated[existingIndex], message, type }; 
        return updated;
      } else {
        // Tambahkan notifikasi baru
        const newNotifications = [
          ...prev, 
          // Gunakan Date.now() untuk id number unik
          { id: Date.now(), keyId, message, type }, 
        ];
        return newNotifications;
      }
    });
  };

  // Fungsi untuk hapus notifikasi (berdasarkan id number)
  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Fetch data realtime dari Firebase
  useEffect(() => {
    if (!dbRealtime) {
      console.error("Firebase DB tidak terinisialisasi.");
      updateNotification(
        NOTIFICATION_KEYS.firebaseError,
        "Koneksi Firebase gagal, notifikasi nonaktif.",
        "info"
      );
      return;
    }

    const latestSensorRef = ref(dbRealtime, "sensors/latest");

    const unsubscribe = onValue(
      latestSensorRef,
      (snapshot) => {
        // Hapus notifikasi error koneksi jika berhasil membaca
        updateNotification(NOTIFICATION_KEYS.firebaseError, null); 

        if (snapshot.exists()) {
          const data: SensorData = snapshot.val();
          const { ph, suhu, kelembaban } = data;

          // --- LOGIKA CEK DAN UPDATE NOTIFIKASI SENSOR ---

          // 1. Cek pH
          const phOutOfRange =
            ph < SENSOR_THRESHOLDS.ph[0] || ph > SENSOR_THRESHOLDS.ph[1];
          if (phOutOfRange) {
            updateNotification(
              NOTIFICATION_KEYS.ph,
              `Perhatian: pH tanah (${ph.toFixed(
                1
              )}) di luar batas normal (${SENSOR_THRESHOLDS.ph.join(" - ")}).`,
              "warning"
            );
          } else {
            // Hapus notifikasi jika pH kembali normal
            updateNotification(NOTIFICATION_KEYS.ph, null);
          }

          // 2. Cek Suhu
          const suhuOutOfRange =
            suhu < SENSOR_THRESHOLDS.suhu[0] ||
            suhu > SENSOR_THRESHOLDS.suhu[1];
          if (suhuOutOfRange) {
            updateNotification(
              NOTIFICATION_KEYS.suhu,
              `Perhatian: Suhu tanah (${suhu.toFixed(
                1
              )}°C) di luar batas normal (${SENSOR_THRESHOLDS.suhu.join(
                " - "
              )}°C).`,
              "warning"
            );
          } else {
            // Hapus notifikasi jika Suhu kembali normal
            updateNotification(NOTIFICATION_KEYS.suhu, null);
          }

          // 3. Cek Kelembaban
          const kelembabanOutOfRange =
            kelembaban < SENSOR_THRESHOLDS.kelembaban[0] ||
            kelembaban > SENSOR_THRESHOLDS.kelembaban[1];
          if (kelembabanOutOfRange) {
            updateNotification(
              NOTIFICATION_KEYS.kelembaban,
              `Perhatian: Kelembaban tanah (${kelembaban.toFixed(
                1
              )}%) di luar batas normal (${SENSOR_THRESHOLDS.kelembaban.join(
                " - "
              )}%).`,
              "warning"
            );
          } else {
            // Hapus notifikasi jika Kelembaban kembali normal
            updateNotification(NOTIFICATION_KEYS.kelembaban, null);
          }

          // Hapus notifikasi "Tidak ada data" jika data ditemukan
          updateNotification(NOTIFICATION_KEYS.noData, null);
          
        } else {
          updateNotification(
            NOTIFICATION_KEYS.noData,
            "Tidak ada data sensor terbaru ditemukan.",
            "info"
          );
        }
      },
      (error) => {
        console.error("Firebase latest sensor read failed:", error);
        updateNotification(
          NOTIFICATION_KEYS.firebaseError,
          "Gagal membaca data sensor dari Firebase.",
          "warning"
        );
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex h-screen bg-white">
      {/* Container Notifikasi Terapung */}
      <div className="fixed top-4 right-4 w-full max-w-xs z-[100] space-y-2 pointer-events-none">
        {notifications.map((notif) => (
          // Gunakan id number (Date.now()) sebagai key React
          <div key={notif.id} className="pointer-events-auto"> 
            <Notification
              id={notif.id} // Menggunakan id number untuk onClose
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