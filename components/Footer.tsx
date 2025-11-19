import React from "react";

interface FooterProps {
  className?: string;
}

export default function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <>

          <footer className={`w-full p-4 mt-auto text-center text-white text-sm bg-green-600/30 relative z-10 ${className || ''}`}>
      <p>
        © {currentYear} Kibang Soil Tracker. Hak Cipta Dilindungi Undang-Undang.
      </p>
    </footer>
    </>
  );
}
