"use client";

import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useState, useEffect} from "react";
import Footer from "@/components/Footer";
import { toast } from 'react-toastify';

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
  
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Login gagal");

      toast.success(`Login sukses! Mengarahkan...`);
      console.log("Login success:", data.user.uid);
      console.log("Token:", data.token);

      setTimeout(() => {
        router.push("/dashboard/home");
      }, 1500);


    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Buat elemen gelembung baru
      const bubble = document.createElement('div');
      bubble.classList.add('bubble');

      // Atur posisi
      bubble.style.left = `${e.clientX}px`;
      bubble.style.top = `${e.clientY}px`;

      // Ukuran & durasi acak (opsional)
      const size = Math.random() * 15 + 10; // 10px - 25px
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      const duration = Math.random() * 0.4 + 0.6; // 0.6s - 1s
      bubble.style.animationDuration = `${duration}s`;

      // Tambahkan ke body
      document.body.appendChild(bubble);

      // Hapus setelah animasi
      setTimeout(() => {
        if (bubble.parentNode) {
            bubble.parentNode.removeChild(bubble);
        }
      }, duration * 1000); // Sesuaikan dengan durasi animasi CSS
    };

    // Tambahkan event listener saat komponen mount
    window.addEventListener('mousemove', handleMouseMove);

    // Hapus event listener saat komponen unmount (cleanup)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      // Hapus sisa gelembung jika ada saat pindah halaman
      document.querySelectorAll('.bubble').forEach(b => b.remove());
    };
  }, []);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Nico+Moji:wght@400&family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
      />
      <div className="relative flex flex-col w-screen h-screen overflow-y-auto p-0 m-0 box-border bg-[url('/images/kebun.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-green-800/50 z-0"></div>

        <div className="flex flex-grow items-center justify-center p-10 max-sm:p-5">
          <div className="relative z-10 flex max-lg:flex-col max-lg:w-full max-lg:max-w-[500px]">

            <div className="flex w-[450px] h-[500px] p-4 flex-col justify-center items-stretch rounded-l-[20px] bg-aurora max-lg:w-full max-lg:h-auto max-lg:rounded-tl-[20px] max-lg:rounded-tr-[20px] max-lg:rounded-l-none max-lg:p-7 max-sm:p-6">
              <div className="flex flex-col justify-center items-start gap-2 h-full border-3 border-white rounded-[10px] p-4">
                  <h1 className="self-stretch text-center text-white font-bold text-2xl font-['Poppins'] max-lg:text-[22px] max-sm:text-xl">
                    SELAMAT DATANG !
            </h1>
                <p className="h-auto flex-shrink-0 self-stretch text-white font-normal text-lg text-justify font-['Poppins'] max-lg:text-base max-sm:text-sm">
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
                    alt="Logo Green"
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
                      className="h-10 self-stretch rounded-2xl border border-gray-400 px-4 outline-none transition-colors text-green-600 placeholder:text-gray-400 text-base
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
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="h-10 w-full self-stretch rounded-2xl border border-gray-400 pl-4 pr-10 outline-none transition-colors text-green-600 placeholder:text-gray-400 text-base
                     focus:bg-transparent focus:border-none focus:placeholder:text-green-600 focus:shadow-[0_0_0_1px_theme('colors.green.600')] focus:rounded-xl focus:outline-none"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
                  <button
                    type='submit'
                    disabled={loading} 
                      className="flex w-[180px] h-10 px-6 py-3 justify-center items-center gap-2 rounded-full cursor-pointer bg-green-600 border-none text-white text-xl tracking-[0.15em] font-extrabold font-['Poppins'] transition-colors hover:bg-green-800 hover:rounded-2xl max-sm:w-full hover">
                    {loading ? "Loading..." : "Login"}
                  </button>
              </form>
              </div>
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

        <Footer/>
      </div>
    </>
  );
}