// app/dashboard/home/page.tsx
import { get, ref } from "firebase/database";
import { db } from "@/lib/firebase";
import DashboardClient from "@/components/home/HomeClient";

// Definisikan tipe data untuk data sensor
interface SensorData {
  ph: number;
  suhu: number;
  kelembaban: number;
}

async function getSensorData(): Promise<SensorData> {
  // --- PENGAMBILAN DATA DARI FIREBASE ---
  //
  // Catatan: Kode di bawah ini adalah contoh cara mengambil data dari Firebase Realtime Database.
  // Saat ini, kode tersebut dikomentari dan kita menggunakan data dummy.
  //
  // Untuk mengaktifkannya:
  // 1. Pastikan Anda sudah mengatur Firebase Realtime Database di project Anda.
  // 2. Sesuaikan path 'sensors/latest' dengan struktur data di database Anda.
  // 3. Hapus komentar pada blok try-catch di bawah ini.
  // 4. Hapus atau komentari bagian "Data Dummy".

  /*
  try {
    const snapshot = await get(ref(db, 'sensors/latest'));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("No data available");
      // Kembalikan nilai default jika tidak ada data
      return { ph: 0, suhu: 0, kelembaban: 0 };
    }
  } catch (error) {
    console.error("Firebase read failed:", error);
    // Kembalikan nilai default jika terjadi error
    return { ph: 0, suhu: 0, kelembaban: 0 };
  }
  */

  // --- Data Dummy (untuk sementara) ---
  const dummyData: SensorData = {
    ph: 6,
    suhu: 30,
    kelembaban: 20,
  };

  return dummyData;
}

export default async function DashboardHomePage() {
  const sensorData = await getSensorData();

  return <DashboardClient initialData={sensorData} />;
}
