// app/dashboard/home/page.tsx
import { ref, get } from "firebase/database";
import { dbRealtime } from "@/lib/firebase";
import DashboardClient from "@/components/home/HomeClient";

interface SensorData {
  ph: number;
  suhu: number;
  kelembaban: number;
}

async function getSensorData(): Promise<SensorData> {
  try {
    const snapshot = await get(ref(dbRealtime, "sensorData"));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("No data available");
      return { ph: 0, suhu: 0, kelembaban: 0 };
    }
  } catch (error) {
    console.error("Firebase read failed:", error);
    return { ph: 0, suhu: 0, kelembaban: 0 };
  }
}

export default async function DashboardHomePage() {
  const sensorData = await getSensorData();

  return <DashboardClient initialData={sensorData} />;
}
