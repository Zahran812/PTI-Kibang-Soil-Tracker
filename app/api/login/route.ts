import { NextResponse } from "next/server";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";

interface AttemptInfo {
  count: number;
  blockUntil: number | null;
}

const loginAttempts: Record<string, AttemptInfo> = {};

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 5 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const now = Date.now();
    const attemptInfo = loginAttempts[email];

    if (attemptInfo && attemptInfo.blockUntil && attemptInfo.blockUntil > now) {
      const timeLeft = Math.ceil((attemptInfo.blockUntil - now) / 1000);
      return NextResponse.json(
        { error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${timeLeft} detik.` },
        { status: 429 }
      );
    } else if (attemptInfo && attemptInfo.blockUntil && attemptInfo.blockUntil <= now) {
       delete loginAttempts[email];
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const auth = getAuth(firebaseApp);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      delete loginAttempts[email];

      return NextResponse.json({
        message: "Login sukses",
        user: { uid: user.uid, email: user.email },
        token,
      });
  } catch (authError: any) {
      console.error("Firebase Auth error:", authError);

      let message = "Terjadi kesalahan saat login";
      let status = 401;

      if (authError.code === "auth/wrong-password" || authError.code === "auth/user-not-found" || authError.code === "auth/invalid-credential") {
         message = "Email atau password salah";

         const currentAttempts = loginAttempts[email] || { count: 0, blockUntil: null };
         currentAttempts.count++;

         if (currentAttempts.count >= MAX_ATTEMPTS) {
           currentAttempts.blockUntil = Date.now() + BLOCK_DURATION;
           status = 429;
           message = `Anda telah gagal login ${currentAttempts.count} kali. Akun diblokir selama 5 menit.`;
           loginAttempts[email] = currentAttempts;
           setTimeout(() => {
               if (loginAttempts[email]?.blockUntil === currentAttempts.blockUntil) {
                   delete loginAttempts[email];
                   console.log(`Login attempt record for ${email} cleaned up.`);
               }
           }, BLOCK_DURATION + 60000);

         } else {
            loginAttempts[email] = currentAttempts;
         }
         if (status !== 429) {
             message += `. Percobaan ke-${currentAttempts.count} dari ${MAX_ATTEMPTS}.`;
         }

      } else if (authError.code === "auth/invalid-email") {
         message = "Format email tidak valid";
         status = 400;
      } else {
         message = authError.message || "Terjadi kesalahan tidak dikenal.";
         status = 500;
      }

       return NextResponse.json({ error: message }, { status });
    }
  } catch (error: any) {
     console.error("General login error:", error);
     return NextResponse.json(
       { error: "Terjadi kesalahan pada server." },
       { status: 500 }
     );
  }
}
