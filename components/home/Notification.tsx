// components/Notification.tsx
"use client";

import { useState } from "react";

interface NotificationProps {
  message: string;
  type: "warning" | "info" | "success";
  onClose: () => void;
}

export default function Notification({
  message,
  type,
  onClose,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const baseClasses = "p-4 rounded-lg shadow-lg flex items-center gap-3";
  const typeClasses = {
    warning: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <span className="flex-1 text-sm">{message}</span>
      <button
        onClick={handleClose}
        className="text-lg font-bold hover:opacity-75"
        aria-label="Close"
      >
        &times;
      </button>
    </div>
  );
}
