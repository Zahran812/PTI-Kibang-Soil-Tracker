"use client";

import Image from "next/image";
import { useState } from "react"; // Tambahkan import useState
import { X } from "lucide-react"; // X sekarang akan kita gunakan

// Tipe Data Notifikasi (Didefinisikan ulang untuk Header)
interface AppNotification {
  id: number;
  message: string;
  type: "warning" | "info";
}

interface HeaderProps {
  onToggleSidebar?: () => void;
  // Tambahkan props notifikasi dari layout
  notifications: AppNotification[];
  removeNotification: (id: number) => void;
}

export default function Header({
  onToggleSidebar,
  notifications,
  removeNotification,
}: HeaderProps) {
  // State untuk mengelola status buka/tutup dropdown notifikasi
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const toggleNotif = () => {
    setIsNotifOpen((prev) => !prev);
    // Jika notifikasi dibuka, kita bisa menghapus badge warning count
    // (Opsional: logic ini bisa dihandle di layout jika Anda ingin mempertahankan state warning)
  };

  // Hitung notifikasi baru (misalnya yang bertipe warning)
  const warningCount = notifications.filter((n) => n.type === "warning").length;

  return (
    <header className="flex items-center gap-5 justify-between lg:justify-end flex-wrap p-4 sticky top-0 bg-white z-20 shadow-sm">
      {/* Hamburger Menu - Only visible on mobile */}
      <button
        onClick={onToggleSidebar}
        className="lg:hidden w-[50px] h-[50px] rounded-full bg-foundation-green flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-foundation-green-dark flex-shrink-0"
        aria-label="Toggle menu"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path
            d="M3 12H21M3 6H21M3 18H21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Right side icons */}
      <div className="flex items-center gap-5">
        {/* Kontainer Notifikasi dengan Dropdown */}
        <div className="relative">
          <button // Tombol Ikon Notifikasi
            onClick={toggleNotif}
            className="relative w-[50px] h-[50px] rounded-full bg-[#BFF0BF] flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-gray-200 flex-shrink-0"
            aria-label="Notifications"
          >
            <Image
              src="/images/notif.svg"
              alt="Notifications"
              width={24}
              height={24}
              className="object-contain"
            />
            {/* Badge Notifikasi */}
            {warningCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {warningCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-xl z-50 p-4 border border-gray-200 text-gray-800">
              <h4 className="font-bold text-lg mb-3 border-b pb-2">
                Pemberitahuan ({notifications.length})
              </h4>

              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  Tidak ada notifikasi baru.
                </p>
              ) : (
                <ul className="space-y-3">
                  {notifications.map((notif) => (
                    <li
                      key={notif.id}
                      className={`flex justify-between items-start p-3 rounded-md ${
                        notif.type === "warning"
                          ? "bg-red-50 hover:bg-red-100"
                          : "bg-blue-50 hover:bg-blue-100"
                      } transition-colors`}
                    >
                      <p className="text-xs font-medium mr-2">
                        {notif.message}
                      </p>
                      <button
                        onClick={() => removeNotification(notif.id)}
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
                        aria-label="Tutup notifikasi"
                      >
                        <X size={16} /> {/* Mengganti SVG dengan komponen X */}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Profile Icon */}
        <div className="w-[50px] h-[50px] rounded-full bg-[#2DB92D] flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-gray-200 flex-shrink-0">
          <Image
            src="/images/profile.svg"
            alt="Profile"
            width={24}
            height={24}
            className="object-contain"
          />
        </div>
      </div>
    </header>
  );
}
