"use client";

import Image from "next/image";
import { LogOut, User } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
// Hapus import { useState } karena state diangkat ke Header

// Tambahkan Interface untuk props yang diterima dari Header
interface ProfileDropdownProps {
  isProfileOpen: boolean;
  toggleProfile: () => void;
}

// Terima props isProfileOpen dan toggleProfile
export default function ProfileDropdown({
  isProfileOpen,
  toggleProfile,
}: ProfileDropdownProps) {
  const router = useRouter();
  // State isProfileOpen dan toggleProfile lokal DIHAPUS

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Panggil toggleProfile dari props untuk menutup dropdown di Header
      toggleProfile();
    }
  };

  return (
    <div className="relative">
      <button
        // Gunakan toggleProfile dari props
        onClick={toggleProfile}
        className="w-[50px] h-[50px] rounded-full bg-[#2DB92D] flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-green-700 flex-shrink-0"
        aria-label="Profile"
      >
        {/* Menggunakan Image untuk ikon profil */}
        <Image
          src="/images/profile.svg"
          alt="Profile"
          width={24}
          height={24}
          className="object-contain"
        />
      </button>

      {/* Profile Dropdown: Sekarang menggunakan prop isProfileOpen */}
      {isProfileOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 p-2 border border-gray-200 text-gray-800">
          <div className="flex items-center p-3 text-sm text-gray-700 border-b mb-2">
            <User size={16} className="mr-2" />
            <span>Pengguna Dashboard</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
