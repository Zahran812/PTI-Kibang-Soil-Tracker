import { NextResponse } from "next/server";
import { dbFirestore } from "@/lib/firebase";
import { collection, addDoc, getDocs, orderBy, query, limit, serverTimestamp } from "firebase/firestore";

// === POST ===
// Simpan data terakhir ke koleksi "usage_history"
export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data) {
      return NextResponse.json({ success: false, error: "No data provided" }, { status: 400 });
    }

    await addDoc(collection(dbFirestore, "usage_history"), {
      ...data,
      savedAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Gagal menyimpan data:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// === GET ===
// Ambil riwayat terakhir dari Firestore (misal 20 data terakhir)
export async function GET() {
  try {
    const q = query(
      collection(dbFirestore, "usage_history"),
      orderBy("savedAt", "desc"),
      limit(20)
    );

    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("❌ Gagal mengambil riwayat:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
