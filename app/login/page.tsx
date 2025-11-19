// app/login/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { toast } from "react-toastify";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const BLOCK_TIMESTAMP_KEY = "loginBlockExpiresAt";

// Icons
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L6.228 6.228" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [blockExpiresAt, setBlockExpiresAt] = useState<number>(0);
  const toastIdRef = useRef<string | number | null>(null);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Redirect jika sudah login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/dashboard/home");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Load status blokir dari localStorage
  useEffect(() => {
    const storedBlockTime = localStorage.getItem(BLOCK_TIMESTAMP_KEY);
    if (storedBlockTime) {
      const expiryTime = parseInt(storedBlockTime, 10);
      if (!isNaN(expiryTime) && expiryTime > Date.now()) {
        setBlockExpiresAt(expiryTime);
      } else {
        localStorage.removeItem(BLOCK_TIMESTAMP_KEY);
      }
    }
    setIsStorageLoaded(true);
  }, []);

  // Timer countdown untuk blokir
  useEffect(() => {
    if (blockExpiresAt === 0) return;

    if (!toastIdRef.current || !toast.isActive(toastIdRef.current)) {
      toastIdRef.current = toast.error("", {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: true,
      });
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = blockExpiresAt - now;

      if (remaining > 0) {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        if (toastIdRef.current && toast.isActive(toastIdRef.current)) {
          toast.update(toastIdRef.current, {
            render: `Gagal 5x. Akun diblokir. Coba lagi dalam ${timeStr}`,
          });
        }
      } else {
        clearInterval(interval);
        setBlockExpiresAt(0);
        setLoginAttempts(0);
        localStorage.removeItem(BLOCK_TIMESTAMP_KEY);

        if (toastIdRef.current && toast.isActive(toastIdRef.current)) {
          toast.update(toastIdRef.current, {
            render: "Blokir berakhir. Silakan coba login kembali.",
            type: "success",
            autoClose: 5000,
            closeOnClick: true,
            draggable: true,
          });
        }
        toastIdRef.current = null;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [blockExpiresAt]);

  // Handle login
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const now = Date.now();
    if (blockExpiresAt > now) {
      const remaining = blockExpiresAt - now;
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

      toast.warn(`Anda masih diblokir. Coba lagi dalam ${timeStr}`);
      return;
    }

    setLoading(true);

    try {
      const actualEmail = `${email}@soiltracker.com`;
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: actualEmail, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Login gagal, silakan coba lagi.");
      }

      // Sukses login di API — sign in client-side (jika perlu)
      await signInWithEmailAndPassword(auth, actualEmail, password);

      toast.success("Login sukses! Mengarahkan...");
      console.log("Login success:", data?.user?.uid);

      setLoginAttempts(0);
      setBlockExpiresAt(0);
      localStorage.removeItem(BLOCK_TIMESTAMP_KEY);

      router.push("/dashboard/home");
    } catch (err: unknown) {
      // jangan akses err langsung — gunakan type-safe guard
      console.error("Login Error:", err);

      let message = "Terjadi kesalahan.";
      let isAuthError = false;

      const maybeErr = (err ?? {}) as { code?: unknown; message?: unknown };

      if (typeof maybeErr.code === "string") {
        const code = maybeErr.code;
        switch (code) {
          case "auth/user-not-found":
          case "auth/invalid-credential":
            message = "Email atau password salah.";
            isAuthError = true;
            break;
          case "auth/wrong-password":
            message = "Password salah.";
            isAuthError = true;
            break;
          case "auth/invalid-email":
            message = "Format email tidak valid.";
            break;
          case "auth/too-many-requests":
            message = "Terlalu banyak percobaan. Coba lagi nanti.";
            isAuthError = true;
            break;
          default:
            if (typeof maybeErr.message === "string") {
              message = maybeErr.message;
            }
            break;
        }
      } else if (typeof maybeErr.message === "string") {
        const msg = maybeErr.message;
        if (msg.includes("Email atau password salah") || msg.includes("Password salah")) {
          message = "Email atau password salah.";
          isAuthError = true;
        } else {
          message = msg;
        }
      }

      if (isAuthError) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= 5) {
          const newBlockTime = Date.now() + 5 * 60 * 1000;
          localStorage.setItem(BLOCK_TIMESTAMP_KEY, newBlockTime.toString());
          setBlockExpiresAt(newBlockTime);
          setLoginAttempts(0);

          const timeStr = "5:00";
          if (toastIdRef.current) toast.dismiss(toastIdRef.current);

          toastIdRef.current = toast.error(
            `Gagal 5x. Akun diblokir. Coba lagi dalam ${timeStr}`,
            {
              autoClose: false,
              closeOnClick: false,
              draggable: false,
              closeButton: true,
            }
          );
        } else {
          toast.error(`${message} Percobaan ke-${newAttempts} dari 5.`);
        }
      } else {
        toast.error(message);
      }

      setLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword((s) => !s);
  };

  // Bubble mouse effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const bubble = document.createElement("div");
      bubble.classList.add("bubble");
      bubble.style.left = `${e.clientX}px`;
      bubble.style.top = `${e.clientY}px`;
      const size = Math.random() * 15 + 10;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      const duration = Math.random() * 0.4 + 0.6;
      bubble.style.animationDuration = `${duration}s`;
      document.body.appendChild(bubble);
      setTimeout(() => {
        if (bubble.parentNode) {
          bubble.parentNode.removeChild(bubble);
        }
      }, duration * 1000);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.querySelectorAll(".bubble").forEach((b) => b.remove());
    };
  }, []);

  if (!isStorageLoaded) {
    return null;
  }

  return (
    <>
      <div className="relative flex flex-col w-full p-0 m-0 box-border bg-[url('/images/kebun.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-green-800/50 z-0"></div>

        <div className="flex flex-grow items-center justify-center p-10 max-sm:p-5 min-h-screen">
          <div className="relative z-10 flex max-lg:flex-col max-lg:w-full max-lg:max-w-[500px]">
            {/* Left welcome */}
            <div className="flex w-[450px] h-[500px] p-4 flex-col justify-center items-stretch rounded-l-[20px] bg-aurora max-lg:w-full max-lg:h-auto max-lg:rounded-tl-[20px] max-lg:rounded-tr-[20px] max-lg:rounded-l-none max-lg:p-7 max-sm:p-6">
              <div className="flex flex-col justify-center items-start gap-2 h-full border-3 border-white rounded-[10px] p-4 max-lg:h-auto max-lg:justify-start">
                <button
                  type="button"
                  className="flex justify-between items-center w-full lg:pointer-events-none"
                  onClick={() => setIsInfoOpen(!isInfoOpen)}
                  aria-expanded={isInfoOpen}
                  aria-controls="info-panel-content"
                >
                  <h1 className="self-stretch text-white font-bold text-2xl font-['Poppins'] max-lg:text-[22px] max-sm:text-xl flex-1 text-center lg:text-center">
                    SELAMAT DATANG !
                  </h1>
                  <span
                    className={`lg:hidden text-white ml-2 flex-shrink-0 transition-transform duration-300 ease-in-out ${isInfoOpen ? "rotate-180" : "rotate-0"}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </button>

                <div
                  id="info-panel-content"
                  className={`flex-shrink-0 self-stretch text-white font-normal text-lg text-justify font-['Poppins'] max-lg:text-base max-sm:text-sm overflow-hidden transition-[max-height] duration-300 ease-in-out ${isInfoOpen ? "max-h-96" : "max-h-0"} lg:max-h-none`}
                >
                  <p className="pt-2 lg:pt-0">
                    Kendalikan kondisi tanah Anda dengan Kibang Soil Tracker! Pantau PH, Suhu, dan Kelembaban secara Real-Time agar tanaman Anda tumbuh maksimal di Desa Metro Kibang.
                  </p>
                </div>
              </div>
            </div>

            {/* Right form */}
            <div className="flex w-[450px] h-[500px] p-4 flex-col justify-center items-stretch rounded-r-[20px] shadow-lg bg-white max-lg:w-full max-lg:h-auto max-lg:rounded-b-[20px] max-lg:rounded-r-none max-lg:p-7 max-sm:p-6">
              <div className="flex flex-col justify-center items-center gap-6 h-full border-3 border-green-600 rounded-[10px] p-8 px-10">
                <div className="flex flex-col items-center gap-3 self-stretch">
                  <div className="w-[80px] h-[80px] relative">
                    <Image src="/images/logo-green.svg" alt="Logo Kibang Soil Tracker" fill className="object-contain" />
                  </div>
                  <div className="flex flex-col items-center gap-1 self-stretch">
                    <h2 className="self-stretch text-green-600 text-center text-2xl font-bold font-['Poppins'] max-lg:text-[22px] max-sm:text-xl">KIBANG SOIL TRACKER</h2>
                    <p className="self-stretch text-green-600 text-center text-xs font-bold font-['Poppins'] max-sm:text-[11px]">Pantau PH, Suhu, dan Kelembaban secara Real Time</p>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col items-center gap-4 self-stretch">
                  <div className="flex flex-col items-start gap-3 self-stretch">
                    <label className="self-stretch text-green-600 text-sm font-bold font-['Poppins']">Username</label>
                    <input
                      type="text"
                      className="h-10 self-stretch rounded-2xl border border-gray-400 px-4 outline-none
                          transition-colors text-green-600 placeholder:text-gray-400 text-base
                          focus:bg-transparent focus:border-none focus:placeholder:text-green-600
                          focus:shadow-[0_0_0_1px_theme('colors.green.600')] focus:rounded-xl"
                      placeholder="Username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="username"
                    />
                  </div>

                  <div className="flex flex-col items-start gap-3 self-stretch">
                    <label className="self-stretch text-green-600 text-sm font-bold font-['Poppins']">Password</label>
                    <div className="relative w-full">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="h-10 w-full self-stretch rounded-2xl border border-gray-400 pl-4 pr-10 outline-none transition-colors text-green-600 placeholder:text-gray-400 text-base focus:bg-transparent focus:border-none focus:placeholder:text-green-600 focus:shadow-[0_0_0_1px_theme('colors.green.600')] focus:rounded-xl focus:outline-none"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                      <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>
                        {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-[180px] h-10 px-6 py-3 justify-center items-center gap-2 rounded-full cursor-pointer bg-green-600 border-none text-white text-xl tracking-[0.15em] font-extrabold font-['Poppins'] transition-colors hover:bg-green-800 hover:rounded-2xl max-sm:w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? "Loading..." : "Login"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
