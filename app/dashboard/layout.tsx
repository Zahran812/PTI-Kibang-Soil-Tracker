"use client";

import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Notification from "@/components/home/Notification";
import { onValue, ref } from "firebase/database";
import { db, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";

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
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const addNotification = (
    message: string,
    type: "warning" | "info" = "warning"
  ) => {
    setNotifications((prev) => {
      const newNotifications = [...prev, { id: Date.now(), message, type }];
      return newNotifications.slice(-5);
    });
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => { //useffect1
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => { //useeffect2
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      router.replace("/login");
    }
  }, [isAuthLoading, user, router]); // Berjalan saat status loading atau user berubah

  // Logic Fetching Data & Pendeteksian Notifikasi
  useEffect(() => { //useeffect3
    if (isAuthLoading || !user) return;

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

    const unsubscribeLatest = onValue(
      latestSensorRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data: SensorData = snapshot.val();
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
  }, [isAuthLoading, user]);


  // --- PERBAIKAN LOGIKA RETURN ---
  // Jika auth masih loading ATAU jika user tidak ada (dan akan di-redirect oleh useEffect)
  // tampilkan null (layar kosong)
  if (isAuthLoading || !user) {
    return null;
  }

  // Hanya jika loading selesai DAN user ada, tampilkan layout dashboard
  return (
    <div className="flex h-screen bg-white">
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

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
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
        {/* Header */}
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