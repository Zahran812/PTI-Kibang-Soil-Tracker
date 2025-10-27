"use client";
import * as React from "react";

export default function HistoryPage() {
  const [data, setData] = React.useState([
    { id: 1, waktu: "26-10-2025 14:00", ph: 7, suhu: "25°C", kelembaban: "20%" },
    { id: 2, waktu: "24-10-2025 13:20", ph: 8, suhu: "40°C", kelembaban: "39%" },
    { id: 3, waktu: "20-10-2025 09:45", ph: 6.5, suhu: "27°C", kelembaban: "45%" },
  ]);

  return (
    <div className="w-full flex flex-col items-center p-6 max-lg:p-4 max-sm:p-3">
      <h1 className="text-[#124812] text-[32px] font-bold mb-5 w-full max-w-[972px] max-lg:text-[28px] max-sm:text-2xl">
        Riwayat Pengecekan Tanah
      </h1>

      {/* Table container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-md w-full max-w-[972px] overflow-x-auto max-sm:w-full">
        <table className="w-full min-w-[600px] border-collapse text-gray-800 text-lg max-sm:text-sm text-center">
          <thead className="bg-[#269A26] text-white font-semibold">
            <tr>
              <th className="p-3 md:p-4 first:rounded-tl-2xl">No</th>
              <th className="p-3 md:p-4">Waktu</th>
              <th className="p-3 md:p-4 w-[120px]">PH</th>
              <th className="p-3 md:p-4 w-[120px]">Suhu</th>
              <th className="p-3 md:p-4 last:rounded-tr-2xl w-[120px]">Kelembaban</th>
            </tr>
          </thead>

          <tbody className="font-normal">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-500 text-base md:text-lg">
                  Tidak ada data riwayat.
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={item.id}
                  className={`h-[50px] ${
                    index % 2 === 0 ? "bg-[#EBFAEB]" : "bg-[#E0F8E0]"
                  } hover:bg-[#D5F3D5] transition-colors`}
                >
                  <td className="p-2 md:p-3">{index + 1}</td>
                  <td className="p-2 md:p-3 whitespace-nowrap">{item.waktu}</td>
                  <td className="p-2 md:p-3">{item.ph}</td>
                  <td className="p-2 md:p-3">{item.suhu}</td>
                  <td className="p-2 md:p-3">{item.kelembaban}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
