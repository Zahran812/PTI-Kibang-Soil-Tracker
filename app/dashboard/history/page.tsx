"use client";
import * as React from "react";

export default function HistoryPage() {
  const [data, setData] = React.useState([
    {
      id: 1,
      waktu: "26-10-2025 14:00",
      ph: 7,
      suhu: "25°C",
      kelembaban: "20%",
    },
    {
      id: 2,
      waktu: "24-10-2025 13:20",
      ph: 8,
      suhu: "40°C",
      kelembaban: "39%",
    },
    {
      id: 3,
      waktu: "20-10-2025 09:45",
      ph: 6.5,
      suhu: "27°C",
      kelembaban: "45%",
    },
  ]);

  return (
    <div className="w-full flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <h1 className="text-green-800 text-2xl sm:text-3xl font-bold mb-5 w-full max-w-4xl">
        Riwayat Pengecekan Tanah
      </h1>

      {/* Container untuk Tampilan Mobile dan Desktop */}
      <div className="w-full max-w-4xl">
        {/* Tampilan Mobile: Daftar Kartu */}
        <div className="md:hidden">
          {data.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              Tidak ada data riwayat.
            </p>
          ) : (
            <div className="space-y-4">
              {data.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-green-800 p-4 rounded-lg shadow-md border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg text-white">
                      Pengecekan #{index + 1}
                    </span>
                    <span className="text-sm text-white">{item.waktu}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-white">pH</p>
                      <p className="font-semibold text-lg text-white">{item.ph}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white">Suhu</p>
                      <p className="font-semibold text-lg text-white">{item.suhu}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white">Kelembaban</p>
                      <p className="font-semibold text-lg text-white">{item.kelembaban}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tampilan Desktop: Tabel */}
        <div className="hidden md:block bg-white border border-gray-200 rounded-2xl shadow-md overflow-x-auto">
          <table className="w-full border-collapse text-gray-800 text-lg text-center">
            <thead className="bg-green-800 text-white font-semibold">
              <tr>
                <th className="p-4 first:rounded-tl-2xl">No</th>
                <th className="p-4">Waktu</th>
                <th className="p-4">PH</th>
                <th className="p-4">Suhu</th>
                <th className="p-4 last:rounded-tr-2xl">Kelembaban</th>
              </tr>
            </thead>
            <tbody className="font-normal">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center p-6 text-gray-500 text-lg"
                  >
                    Tidak ada data riwayat.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`h-[50px] ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-gray-200"
                    } hover:bg-[#D5F3D5] transition-colors duration-300`}
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 whitespace-nowrap">{item.waktu}</td>
                    <td className="p-3">{item.ph}</td>
                    <td className="p-3">{item.suhu}</td>
                    <td className="p-3">{item.kelembaban}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
