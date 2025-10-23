"use client";

import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Notification from "@/components/home/Notification"; // Import Notification
// Mengimport fungsi dan objek yang diperlukan dari Firebase
import { onValue, ref } from "firebase/database";
// Asumsi 'db' di-export dari '@/lib/firebase'.
// Kita tidak bisa langsung import { db } dari '@/lib/firebase' di sini karena tidak disediakan,
// tetapi saya asumsikan db akan tersedia secara global (atau di-import di file aslinya,
// berdasarkan struktur kode yang Anda berikan sebelumnya).
// Untuk memastikan kode ini berfungsi dalam lingkungan Next.js,
// saya akan mengasumsikan Anda memiliki Realtime Database instance yang sudah siap (db).
// Catatan: Saya menggunakan import dari lib/firebase seperti yang ada di kode yang Anda berikan.
import { db } from "@/lib/firebase";

// Tipe Data Notifikasi
interface AppNotification {
  id: number;
  message: string;
  type: "warning" | "info";
}

// Tipe Data Sensor (didefinisikan ulang di sini)
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
  // latestData state dihapus karena nilainya tidak digunakan untuk rendering di layout,
  // melainkan hanya digunakan di dalam listener untuk memicu notifikasi.
  // const [latestData, setLatestData] = useState<SensorData | null>(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Fungsi untuk menambahkan notifikasi
  const addNotification = (
    message: string,
    type: "warning" | "info" = "warning"
  ) => {
    setNotifications((prev) => {
      // Hanya tampilkan 5 notifikasi terakhir
      const newNotifications = [...prev, { id: Date.now(), message, type }];
      return newNotifications.slice(-5);
    });
  };

  // Fungsi untuk menghapus notifikasi
  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Logic Fetching Data & Pendeteksian Notifikasi
  useEffect(() => {
    // Memastikan 'db' tersedia. Jika Anda menggunakan Realtime Database, 'db' harus diimpor dari '@/lib/firebase'.
    // Saya berasumsi import 'db' sudah bekerja di lingkungan Anda.
    if (!db) {
      console.error(
        "Firebase DB is not initialized. Please check '@/lib/firebase'."
      );
      addNotification(
        "Koneksi Firebase gagal, notifikasi tidak aktif.",
        "info"
      );
      return;
    }

    const latestSensorRef = ref(db, "sensors/latest");

    // Listener untuk data sensor terbaru
    const unsubscribeLatest = onValue(
      latestSensorRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data: SensorData = snapshot.val();
          // setLatestData(data); // Baris ini dihapus karena state latestData tidak lagi dideklarasikan

          // LOGIC PENDETEKSIAN THRESHOLD
          const { ph, suhu, kelembaban } = data;

          // Cek PH
          if (ph < SENSOR_THRESHOLDS.ph[0] || ph > SENSOR_THRESHOLDS.ph[1]) {
            addNotification(
              `Perhatian: pH tanah (${ph.toFixed(
                1
              )}) di luar batas normal (${SENSOR_THRESHOLDS.ph.join(" - ")}).`,
              "warning"
            );
          }
          // Cek Suhu
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
          // Cek Kelembaban
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

    return () => {
      unsubscribeLatest();
    };
  }, []); // Run sekali saat komponen dimount

  return (
    <div className="flex h-screen bg-white">
      {/* Container Notifikasi Terapung (Fixed) - Menggunakan komponen Notification Anda */}
      <div className="fixed top-4 right-4 w-full max-w-xs z-[100] space-y-2 pointer-events-none">
        {notifications.map((notif) => (
          // Tambahkan pointer-events-auto di komponen notifikasi agar bisa diklik/tutup
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

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar activeItem="beranda" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={closeSidebar}
          />
          <div className="fixed left-0 top-0 z-50 lg:hidden">
            <Sidebar activeItem="beranda" onClose={closeSidebar} />
          </div>
        </>
      )}

      <div className="flex flex-col flex-1">
        {/* Header sekarang menerima notifikasi sebagai prop */}
        <Header
          onToggleSidebar={toggleSidebar}
          notifications={notifications}
          removeNotification={removeNotification} // Kirim fungsi penghapus notifikasi
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
