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

    // Ambil instance auth dari firebaseApp
    const auth = getAuth(firebaseApp);

    // Login ke Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Ambil token user
    const token = await user.getIdToken();

    return NextResponse.json({
      message: "Login sukses",
      user: {
        uid: user.uid,
        email: user.email,
      },
      token,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    let message = "Terjadi kesalahan saat login";

    switch (error.code) {
      case "auth/user-not-found":
        message = "User tidak ditemukan";
        break;
      case "auth/wrong-password":
        message = "Password salah";
        break;
      case "auth/invalid-email":
        message = "Format email tidak valid";
        break;
      default:
        message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 401 });
  }
}
