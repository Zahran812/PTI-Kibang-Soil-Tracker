"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { toast } from "react-toastify";

// --- TAMBAHAN: Impor hook kustom kita ---
// (Pastikan path-nya benar, sesuaikan dengan alias di tsconfig.json kamu)
import { useNotificationHandler } from "@/hooks/useNotificationHandler";

// HAPUS: Impor 'onValue', 'ref', 'dbRealtime'
// HAPUS: Tipe AppNotification, SensorData
// HAPUS: Konstanta NOTIFICATION_KEYS, SENSOR_THRESHOLDS

// Konstanta untuk auto-logout (TETAP DI SINI)
const LAST_ACTIVE_KEY = "lastUserActiveTime";
const INACTIVITY_TIMEOUT_MS = 1 * 60 * 1000; // 1 menit
const CHECK_INTERVAL_MS = 5000; // Cek setiap 5 detik

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- HAPUS: State 'notifications' dan 'prevNotificationsRef' ---

  // --- TAMBAHAN: Panggil hook kustom untuk notifikasi ---
  // Kirim 'user' ke hook-nya
  const { notifications, removeNotification } = useNotificationHandler(user);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // --- LOGIKA AUTH & INAKTIVITAS (TETAP DI SINI) ---

  // Fungsi untuk update waktu terakhir aktif
  const updateLastActiveTime = useCallback(() => {
    localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
  }, []);

  // Cek status otentikasi
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        updateLastActiveTime();
      } else {
        setUser(null);
        router.replace("/login");
        localStorage.removeItem(LAST_ACTIVE_KEY);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router, updateLastActiveTime]);

  // Effect untuk melacak aktivitas pengguna
  useEffect(() => {
    if (!user) return;
    const activityEvents: (keyof WindowEventMap)[] = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
    ];
    activityEvents.forEach((event) => {
      window.addEventListener(event, updateLastActiveTime);
    });
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, updateLastActiveTime);
      });
    };
  }, [user, updateLastActiveTime]);

  // Effect untuk mengecek inaktivitas
  useEffect(() => {
    if (!user) return;
    const intervalId = setInterval(() => {
      const lastActiveTime = localStorage.getItem(LAST_ACTIVE_KEY);
      if (lastActiveTime) {
        const inactiveDuration = Date.now() - parseInt(lastActiveTime, 10);
        if (inactiveDuration > INACTIVITY_TIMEOUT_MS) {
          toast.warn("Sesi Anda telah berakhir karena tidak aktif.");
          signOut(auth).catch((error) => {
            console.error("Auto-logout gagal:", error);
          });
        }
      } else {
        updateLastActiveTime();
      }
    }, CHECK_INTERVAL_MS);
    return () => {
      clearInterval(intervalId);
    };
  }, [user, updateLastActiveTime]);

  // --- AKHIR BLOK LOGIKA AUTH & INAKTIVITAS ---

  // --- HAPUS: Fungsi 'updateNotification' ---
  // --- HAPUS: Fungsi 'removeNotification' ---
  // --- HAPUS: 'useEffect' untuk toast ---
  // --- HAPUS: 'useEffect' untuk listener Firebase 'onValue' ---

  if (isAuthLoading || !user) {
    return null;
  }

  // Render layout utama (Tidak berubah)
  return (
    <div className="flex h-screen bg-white">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

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
