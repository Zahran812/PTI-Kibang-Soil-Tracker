"use client";

import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      router.push("/dashboard/home")
      alert("Login sukses! UID: " + data.user.uid);
      console.log("Token:", data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Nico+Moji:wght@400&family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
      />
      <div className="relative flex w-screen h-screen justify-center items-center p-0 m-0 box-border bg-[url('/images/kebun.jpeg')] bg-cover bg-center max-lg:flex-col max-lg:p-10 max-sm:p-5">
        <div className="absolute inset-0 bg-green-800/50 z-0"></div>

        <div className="relative z-10 flex max-lg:flex-col max-lg:w-full max-lg:max-w-[500px]">

          <div className="flex w-[450px] h-[500px] p-4 flex-col justify-center items-stretch rounded-l-[20px] bg-aurora max-lg:w-full max-lg:h-auto max-lg:rounded-tl-[20px] max-lg:rounded-tr-[20px] max-lg:rounded-l-none max-lg:p-7 max-sm:p-6">
            <div className="flex flex-col justify-center items-start gap-2 h-full border-3 border-white rounded-[10px] p-4">
                <h1 className="self-stretch text-center text-white font-bold text-2xl font-['Poppins'] max-lg:text-[22px] max-sm:text-xl">
                  SELAMAT DATANG !
          </h1>
              <p className="h-[149px] flex-shrink-0 self-stretch text-white font-normal text-lg text-justify font-['Poppins'] max-lg:text-base max-lg:h-auto max-sm:text-sm">
                Kendalikan kondisi tanah Anda dengan Kibang Soil Tracker! Pantau PH, Suhu, dan Kelembaban secara Real-Time agar tanaman Anda tumbuh maksimal di Desa Metro Kibang.
          </p>
        </div>
          </div>
        
          <div className="flex w-[450px] h-[500px] p-4 flex-col justify-center items-stretch rounded-r-[20px] shadow-lg bg-white max-lg:w-full max-lg:h-auto max-lg:rounded-b-[20px] max-lg:rounded-r-none max-lg:p-7 max-sm:p-6">
            <div className="flex flex-col justify-center items-center gap-6 h-full border-3 border-green-600 rounded-[10px] p-8 px-10">
          <div className="flex flex-col items-center gap-7 self-stretch">
              </div>
            <div className="flex flex-col items-center gap-3 self-stretch">
                <div className="w-[80px] h-[80px] relative">
                <Image
                    src="/images/logo-green.svg"
                  alt="Logo Gray"
                  fill
                    className="object-contain "
                />
              </div>
              
              <div className="flex flex-col items-center gap-1 self-stretch">
                  <h2 className="self-stretch text-green-600 text-center text-2xl font-normal font-['Poppins'] max-lg:text-[22px] max-sm:text-xl">
                    <b>KIBANG SOIL TRACKER</b>
                </h2>
                  <p className="self-stretch text-green-600 text-center text-xs font-normal font-['Poppins'] max-sm:text-[11px]">
                    <b>Pantau PH, Suhu, dan Kelembaban secara Real Time</b>
                </p>
              </div>
            </div>
            
              <form onSubmit={handleLogin} className="flex flex-col items-center gap-4 self-stretch">
              <div className="flex flex-col items-start gap-3 self-stretch">
                  <label className="self-stretch text-green-600 text-sm font-normal font-['Poppins']">
                    <b>Username</b>
                </label>
                <input 
                  type="email" 
                    className="h-10 self-stretch rounded-2xl border border-gray-400 px-4 outline-none transition-colors text-green-600 placeholder:text-gray-400 text-xs
                     focus:bg-transparent focus:border-none focus:placeholder:text-green-600 focus:shadow-[0_0_0_1px_theme('colors.green.600')] focus:rounded-xl focus:outline-none"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col items-start gap-3 self-stretch">
                  <label className="self-stretch text-green-600 text-sm font-normal font-['Poppins']">
                    <b>Password</b>
                </label>
                <input 
                  type="password" 
                    className="h-10 self-stretch rounded-2xl border border-gray-400 px-4 outline-none transition-colors text-green-600 placeholder:text-gray-400 text-xs
                     focus:bg-transparent focus:border-none focus:placeholder:text-green-600 focus:shadow-[0_0_0_1px_theme('colors.green.600')] focus:rounded-xl focus:outline-none"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
                <button
                  type='submit'
                  disabled={loading} 
                    className="flex w-[180px] h-10 px-6 py-3 justify-center items-center gap-2 rounded-full cursor-pointer bg-green-600 border-none text-white text-xl tracking-[0.15em] font-extrabold font-['Poppins'] transition-colors hover:bg-green-800 hover:rounded-2xl max-sm:w-full hover">
                  {loading ? "Loading..." : "Login"}
                </button>

              <div className="h-6 text-center">
                {error && <p className="text-red-600 text-sm">{error}</p>}
              </div>
            </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}