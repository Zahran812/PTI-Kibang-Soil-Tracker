"use client";

import { X } from "lucide-react"; // Import X sekarang digunakan

interface NotificationProps {
  id?: number; // Opsional jika hanya untuk display
  message: string;
  type?: "warning" | "info";
  onClose: () => void;
}

export default function Notification({
  message,
  type = "info",
  onClose,
}: NotificationProps) {
  const baseClasses =
    "flex items-center justify-between p-4 rounded-lg shadow-lg transition-all duration-300";
  let colorClasses = "";

  if (type === "warning") {
    colorClasses = "bg-red-50 border-l-4 border-red-500 text-red-800";
  } else {
    colorClasses = "bg-blue-50 border-l-4 border-blue-500 text-blue-800";
  }

  return (
    <div className={`${baseClasses} ${colorClasses} animate-slide-in`}>
      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
      <p className="text-sm font-medium pr-4">{message}</p>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-900 ml-2"
        aria-label="Tutup notifikasi"
      >
        <X size={18} /> {/* Menggunakan komponen X */}
      </button>
    </div>
  );
}
