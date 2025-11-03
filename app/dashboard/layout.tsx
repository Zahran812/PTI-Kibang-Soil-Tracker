"use client";

import { useEffect, useState, useRef, useCallback } from "react"; // TAMBAHKAN: useRef dan useCallback
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Notification from "@/components/home/Notification";
import { onValue, ref } from "firebase/database";
import { db, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User, signOut } from "firebase/auth"; // TAMBAHKAN: signOut
import { toast } from "react-toastify"; // TAMBAHKAN: import toast

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

const LAST_ACTIVE_KEY = "lastUserActiveTime";

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

  // --- TAMBAHKAN: LOGIKA UNTUK IDLE TIMEOUT ---
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  // Atur 30 menit dalam milidetik
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

  // Fungsi untuk logout
  const handleLogout = useCallback(async () => {
    // Hentikan timer jika ada
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      localStorage.removeItem(LAST_ACTIVE_KEY);
    }
    try {
      await signOut(auth);
      toast.info("Anda telah otomatis logout karena tidak ada aktivitas.");
      router.replace("/login");
    } catch (error) {
      console.error("Auto-logout failed:", error);
      toast.error("Gagal melakukan auto-logout.");
    }
  }, [router]); // dependency router

  // Fungsi untuk me-reset timer
  const resetInactivityTimer = useCallback(() => {
    localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    // Hapus timer lama
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    // Set timer baru
    inactivityTimer.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
  }, [handleLogout, INACTIVITY_TIMEOUT]);

  useEffect(() => {
    const lastActive = localStorage.getItem(LAST_ACTIVE_KEY);
    if (lastActive) {
      const lastActiveTime = parseInt(lastActive, 10);
      const timeSinceLastActive = Date.now() - lastActiveTime;

      if (timeSinceLastActive > INACTIVITY_TIMEOUT) {
        // Jika sudah lebih dari 30 menit sejak aktivitas terakhir,
        // paksa logout segera
        handleLogout();
      }
    }
  }, [handleLogout, INACTIVITY_TIMEOUT]);

  // --- TAMBAHKAN: useEffect untuk memantau aktivitas ---
  useEffect(() => {
    // Hanya jalankan jika user sudah login dan loading auth selesai
    if (!isAuthLoading && user) {
      // Daftar aktivitas yang akan di-deteksi
      const events = [
        "mousemove",
        "mousedown",
        "keypress",
        "touchstart",
        "scroll",
      ];

      // Pasang event listener ke window
      events.forEach((event) => {
        window.addEventListener(event, resetInactivityTimer);
      });

      // Mulai timer pertama kali saat komponen dimuat
      resetInactivityTimer();

      // Cleanup function: Hapus listener dan timer saat komponen unmount
      return () => {
        if (inactivityTimer.current) {
          clearTimeout(inactivityTimer.current);
        }
        events.forEach((event) => {
          window.removeEventListener(event, resetInactivityTimer);
        });
      };
    }
  }, [isAuthLoading, user, resetInactivityTimer]); // Dependencies
  // --- BATAS PENAMBAHAN KODE ---

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

  useEffect(() => { //useffect2
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      router.replace("/login");
    }
  }, [isAuthLoading, user, router]); // Berjalan saat status loading atau user berubah

  // Logic Fetching Data & Pendeteksian Notifikasi
  useEffect(() => { //useffect3
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