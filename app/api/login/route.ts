import { NextResponse } from "next/server";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const auth = getAuth(firebaseApp);

    try {
      // Coba login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();

      // Jika sukses, kembalikan data user
      return NextResponse.json({
        message: "Login sukses",
        user: { uid: user.uid, email: user.email },
        token,
      });
    } catch (authError: unknown) {
      // Safety check tanpa any
      console.error("Firebase Auth error:", authError);

      let message = "Terjadi kesalahan saat login";
      let status = 401;

      // Kita pastikan error punya shape yang sesuai
      const err = authError as { code?: string; message?: string };

      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential"
      ) {
        message = "Email atau password salah";
      } else if (err.code === "auth/invalid-email") {
        message = "Format email tidak valid";
        status = 400;
      } else {
        message = err.message || "Terjadi kesalahan tidak dikenal.";
        status = 500;
      }

      return NextResponse.json({ error: message }, { status });
    }
  } catch (error: unknown) {
    console.error("General login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}