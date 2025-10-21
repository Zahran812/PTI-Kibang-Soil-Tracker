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
      <div className="flex w-screen h-screen justify-center items-center p-0 m-0 box-border bg-gray-300 max-lg:flex-col max-lg:p-10 max-sm:p-5">
        <div className="flex w-[450px] h-[500px] p-5 flex-col justify-center items-start gap-2 rounded-l-[20px] shadow-lg bg-green-600 max-lg:w-full max-lg:max-w-[500px] max-lg:h-auto max-lg:rounded-tl-[20px] max-lg:rounded-tr-[20px] max-lg:rounded-l-none max-lg:p-7 max-sm:p-6">
          <h1 className="self-stretch text-white font-bold text-2xl font-['Poppins'] max-lg:text-[22px] max-sm:text-xl">
            Selamat Datang !
          </h1>
          <p className="h-[149px] flex-shrink-0 self-stretch text-white font-normal text-base font-['Poppins'] max-lg:text-sm max-lg:h-auto max-sm:text-[13px]">
            Kibang Soil Tracker merupakan aplikasi pemantauan kondisi tanah di
            Metro Kibang. Pantau PH, Suhu, dan Kelembaban secara Real-Time!
          </p>
        </div>
        
        <div className="flex w-[450px] h-[500px] p-8 px-10 flex-col justify-center items-center gap-6 rounded-r-[20px] shadow-lg bg-white max-lg:w-full max-lg:max-w-[500px] max-lg:h-auto max-lg:rounded-b-[20px] max-lg:rounded-r-none max-lg:p-7 max-sm:p-6">
          <div className="flex flex-col items-center gap-7 self-stretch">
            <div className="flex flex-col items-center gap-3 self-stretch">
              <div className="w-[60px] h-[60px] relative">
                <Image
                  src="/images/logo-grey.svg"
                  alt="Logo Gray"
                  fill
                  className="object-contain"
                />
              </div>
              
              <div className="flex flex-col items-center gap-1 self-stretch">
                <h2 className="self-stretch text-gray-800 text-center text-2xl font-normal font-['Nico_Moji'] max-lg:text-[22px] max-sm:text-xl">
                  Kibang Soil Tracker
                </h2>
                <p className="self-stretch text-gray-800 text-center text-xs font-normal font-['Poppins'] max-sm:text-[11px]">
                  Pantau PH, Suhu , dan Kelembaban secara Real Time
                </p>
              </div>
            </div>
            
            <form onSubmit={handleLogin} className="flex flex-col items-center gap-5 self-stretch">
              <div className="flex flex-col items-start gap-3 self-stretch">
                <label className="self-stretch text-gray-700 text-xs font-normal font-['Inter']">
                  Username
                </label>
                <input 
                  type="email" 
                  className="h-10 self-stretch rounded-full bg-gray-300 border-none px-4 outline-none focus:bg-gray-400 transition-colors"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col items-start gap-3 self-stretch">
                <label className="self-stretch text-gray-700 text-xs font-normal font-['Inter']">
                  Password
                </label>
                <input 
                  type="password" 
                  className="h-10 self-stretch rounded-full bg-gray-300 border-none px-4 outline-none focus:bg-gray-400 transition-colors"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
                <button
                  type='submit'
                  disabled={loading} 
                  className="flex w-[180px] h-10 px-6 py-3 justify-center items-center gap-2 rounded-full cursor-pointer bg-green-600 border-none text-white text-base font-normal font-['Inter'] transition-colors hover:bg-green-700 max-sm:w-full">
                  {loading ? "Loading..." : "Login"}
                </button>

            {error && <p className="text-red-600">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
