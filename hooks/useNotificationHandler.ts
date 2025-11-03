"use client";

import { useState, useEffect, useRef } from "react";
import { User } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import { dbRealtime } from "@/lib/firebase";
import { toast } from "react-toastify";

// Tipe Data Notifikasi
interface AppNotification {
  id: number;
  keyId: string;
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

// Konstanta notifikasi kita pindah ke sini
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

/**
 * Hook kustom untuk mengelola semua logika notifikasi sensor.
 * Menerima 'user' sebagai argumen untuk tahu kapan harus memulai listener.
 */
export const useNotificationHandler = (user: User | null) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const prevNotificationsRef = useRef<AppNotification[]>([]);

  // Fungsi internal untuk update state notifikasi
  const updateNotification = (
    keyId: string,
    message: string | null,
    type: "warning" | "info" = "warning"
  ) => {
    setNotifications((prev) => {
      const existingIndex = prev.findIndex((n) => n.keyId === keyId);

      if (message === null) {
        // Hapus notifikasi jika pesan null (kembali normal)
        if (existingIndex !== -1) {
          return prev.filter((n) => n.keyId !== keyId);
        }
        return prev;
      }

      if (existingIndex !== -1) {
        // Update notifikasi jika pesan berubah
        if (prev[existingIndex].message !== message) {
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], message, type };
          return updated;
        }
        return prev;
      } else {
        // Tambah notifikasi baru
        const newNotification = { id: Date.now(), keyId, message, type };
        return [...prev, newNotification];
      }
    });
  };

  // Fungsi yang akan di-return untuk dipakai di Header
  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // --- LOGIKA TOAST ---
  // Effect ini "mendengar" perubahan state notifications
  useEffect(() => {
    // Cek jika jumlah notifikasi bertambah
    if (notifications.length > prevNotificationsRef.current.length) {
      const prevIds = new Set(prevNotificationsRef.current.map((n) => n.id));
      // Temukan notifikasi yang benar-benar baru
      const newNotifications = notifications.filter((n) => !prevIds.has(n.id));

      // Tampilkan toast untuk setiap notifikasi baru
      newNotifications.forEach((notif) => {
        if (notif.type === "warning") {
          toast.warn(notif.message);
        } else {
          toast.info(notif.message);
        }
      });
    }
    // Simpan state saat ini ke ref untuk perbandingan berikutnya
    prevNotificationsRef.current = notifications;
  }, [notifications]);

  // --- LOGIKA LISTENER FIREBASE ---
  // Effect ini "mendengar" perubahan status user
  useEffect(() => {
    // Hanya jalankan jika user sudah login
    if (!user) return;

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
        updateNotification(NOTIFICATION_KEYS.firebaseError, null);

        if (snapshot.exists()) {
          const data: SensorData = snapshot.val();
          const { ph, suhu, kelembaban } = data;

          // Cek pH
          const phOutOfRange =
            ph < SENSOR_THRESHOLDS.ph[0] || ph > SENSOR_THRESHOLDS.ph[1];
          updateNotification(
            NOTIFICATION_KEYS.ph,
            phOutOfRange
              ? `Perhatian: pH tanah (${ph.toFixed(
                  1
                )}) di luar batas normal (${SENSOR_THRESHOLDS.ph.join(" - ")}).`
              : null,
            "warning"
          );

          // Cek Suhu
          const suhuOutOfRange =
            suhu < SENSOR_THRESHOLDS.suhu[0] ||
            suhu > SENSOR_THRESHOLDS.suhu[1];
          updateNotification(
            NOTIFICATION_KEYS.suhu,
            suhuOutOfRange
              ? `Perhatian: Suhu tanah (${suhu.toFixed(
                  1
                )}°C) di luar batas normal (${SENSOR_THRESHOLDS.suhu.join(
                  " - "
                )}°C).`
              : null,
            "warning"
          );

          // Cek Kelembaban
          const kelembabanOutOfRange =
            kelembaban < SENSOR_THRESHOLDS.kelembaban[0] ||
            kelembaban > SENSOR_THRESHOLDS.kelembaban[1];
          updateNotification(
            NOTIFICATION_KEYS.kelembaban,
            kelembabanOutOfRange
              ? `Perhatian: Kelembaban tanah (${kelembaban.toFixed(
                  1
                )}%) di luar batas normal (${SENSOR_THRESHOLDS.kelembaban.join(
                  " - "
                )}%).`
              : null,
            "warning"
          );

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

    // Hentikan listener saat hook di-unmount atau user berubah
    return () => unsubscribe();
  }, [user]); // Dependency array ini penting!

  // Kembalikan state dan fungsi yang dibutuhkan oleh komponen
  return { notifications, removeNotification };
};
