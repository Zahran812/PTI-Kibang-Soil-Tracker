// app/api/test-sensor/route.ts
import { NextResponse } from "next/server";
import { ref, set } from "firebase/database";
import { dbRealtime } from "@/lib/firebase";

export async function GET() {
  try {
    const interval = 3000; // 3 detik

    // Fungsi kirim data dummy acak
    const sendRandomData = async () => {
      const data = {
        ph: Number((Math.random() * 3 + 5).toFixed(2)), // 5 - 8
        suhu: Math.floor(Math.random() * 10 + 25), // 25 - 35
        kelembaban: Math.floor(Math.random() * 30 + 40), // 40 - 70
      };

      await set(ref(dbRealtime, "sensors/latest"), data);
      console.log("Data dikirim:", data);
    };

    // Kirim data pertama
    await sendRandomData();

    // Jalankan pengiriman setiap 3 detik (tanpa blocking)
    const timer = setInterval(sendRandomData, interval);
    setTimeout(() => clearInterval(timer), 30000); // stop setelah 30 detik (opsional)

    return NextResponse.json({ message: "Simulasi data sensor dimulai ✅" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengirim data" }, { status: 500 });
  }
}
