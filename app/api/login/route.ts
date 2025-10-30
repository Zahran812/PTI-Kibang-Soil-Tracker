import { NextResponse } from "next/server";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";
import { serialize } from "cookie"; // tambahkan ini

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });

    const auth = getAuth(firebaseApp);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const token = await user.getIdToken();

    // Simpan token ke cookie (httpOnly)
    const cookie = serialize("firebase_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
    });

    const response = NextResponse.json({
      message: "Login sukses",
      user: { uid: user.uid, email: user.email },
    });

    response.headers.set("Set-Cookie", cookie);

    return response;
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
