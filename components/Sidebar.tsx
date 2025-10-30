"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Tentukan item aktif berdasarkan route sekarang
  const isActive = (route: string) => pathname === route;

  return (
    <div className="w-60 h-screen bg-foundation-green text-white p-4 flex flex-col">
      {/* Tombol Close (mobile) */}
      {onClose && (
        <div className="flex justify-end mb-4 lg:hidden">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-foundation-green-dark transition-colors duration-200"
            aria-label="Close menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Brand Section */}
      <div className="flex items-center gap-2.5 justify-center font-nico-moji">
        <div className="w-10 h-10 flex-shrink-0">
          <Image
            src="/images/logo-white.svg"
            alt="Logo Gray"
            width={40}
            height={40}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="w-[110px]">
          <div className="text-2xl font-normal">Kibang</div>
          <div className="text-sm mt-2">Soil Tracker</div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="mt-10 space-y-3 font-inter text-sm">
        {/* Beranda */}
        <button
          onClick={() => router.push("/dashboard/home")}
          className={`w-full flex items-center gap-3 rounded-[10px] p-2 text-left transition-colors duration-200 ${
            isActive("/dashboard/home")
              ? "bg-foundation-green-dark"
              : "hover:bg-foundation-green-dark/50"
          }`}
        >
          <div className="w-6 h-6 flex-shrink-0">
            <Image
              src="/images/home.svg"
              alt="Home icon"
              width={24}
              height={24}
              className="w-full h-full object-contain"
            />
          </div>
          <span>Beranda</span>
        </button>

        {/* Riwayat */}
        <button
          onClick={() => router.push("/dashboard/history")}
          className={`w-full flex items-center gap-3 rounded-[10px] p-2 text-left transition-colors duration-200 ${
            isActive("/dashboard/history")
              ? "bg-foundation-green-dark"
              : "hover:bg-foundation-green-dark/50"
          }`}
        >
          <div className="w-6 h-6 flex-shrink-0">
            <Image
              src="/images/history.svg"
              alt="History icon"
              width={24}
              height={24}
              className="w-full h-full object-contain"
            />
          </div>
          <span>Riwayat</span>
        </button>
      </nav>
    </div>
  );
}
