"use client";

import Image from "next/image";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="flex items-center gap-5 justify-between lg:justify-end flex-wrap p-4">
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
        <div className="w-[50px] h-[50px] rounded-full bg-[#BFF0BF] flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-gray-200 flex-shrink-0">
          <Image
            src="/images/notif.svg"
            alt="Notifications"
            width={24}
            height={24}
            className="object-contain"
          />
        </div>
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
