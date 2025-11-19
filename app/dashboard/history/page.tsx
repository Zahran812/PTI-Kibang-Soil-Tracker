"use client";
import * as React from "react";

interface HistoryItem {
  id: string;
  waktu: string;
  ph: number;
  suhu: string;
  kelembaban: string;
}

interface RawSensorItem {
  id?: string;
  timestamp: number | string;
  ph: number;
  suhu: number;
  kelembaban: number;
}

interface FormattedSensorItem {
  id: string;
  waktu: string;
  ph: number;
  suhu: string;
  kelembaban: string;
}


export default function HistoryPage() {
  const [data, setData] = React.useState<HistoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Pagination
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ==============================
  // 🕒 PARSER TIMESTAMP CUSTOM
  // ==============================
  function parseTimestamp(input: any): Date {
    // Jika timestamp berupa angka (ms)
    if (typeof input === "number") {
      return new Date(input);
    }

    // Jika timestamp string format: "15/11/2025 16:19:19"
    if (typeof input === "string" && input.includes("/")) {
      const [datePart, timePart] = input.split(" ");
      const [day, month, year] = datePart.split("/").map(Number);
      const [hour, minute, second] = timePart.split(":").map(Number);

      return new Date(year, month - 1, day, hour, minute, second);
    }

    // Fallback
    return new Date();
  }

  // ==============================
  // 🗓️ FORMAT TAMPILAN: 15 Nov 2025, 16:19
  // ==============================
  function formatTanggal(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");

    const bulanIndo = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    const month = bulanIndo[date.getMonth()];
    const year = date.getFullYear();

    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");

    return `${day} ${month} ${year}, ${hour}:${minute}`;
  }

  React.useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/sensor-history", { cache: "no-store" });
        if (!res.ok) throw new Error("Gagal mengambil data riwayat");

        const result = await res.json();

        const list = Array.isArray(result)
          ? result
          : result?.data && Array.isArray(result.data)
          ? result.data
          : [];

        const formatted: FormattedSensorItem[] = list.map(
          (item: RawSensorItem, index: number) => {
            const parsedDate = parseTimestamp(item.timestamp);

            return {
              id: item.id || index.toString(),
              waktu: formatTanggal(parsedDate),
              ph: Number(item.ph.toFixed(2)),
              suhu: `${item.suhu}°C`,
              kelembaban: `${item.kelembaban}%`,
            };
          }
        );

        // 🧹 Hilangkan duplikasi berdasarkan waktu
        const uniqueFormatted = formatted.filter(
          (item, index, self) =>
            index === self.findIndex((x) => x.waktu === item.waktu)
        );


        setData(uniqueFormatted);
      } catch (error) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="w-full text-center py-10 text-gray-500 text-lg">
        Memuat data...
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <h1 className="text-green-800 text-2xl sm:text-3xl font-bold mb-5 w-full max-w-4xl">
        Riwayat Pengecekan Tanah
      </h1>

      <div className="w-full max-w-4xl">
        {/* Mobile View */}
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
                      <p className="font-semibold text-lg text-white">
                        {item.ph}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white">Suhu</p>
                      <p className="font-semibold text-lg text-white">
                        {item.suhu}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white">Kelembaban</p>
                      <p className="font-semibold text-lg text-white">
                        {item.kelembaban}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table */}
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
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center p-6 text-gray-500 text-lg"
                  >
                    Tidak ada data riwayat.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`h-[50px] ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-gray-200"
                    } hover:bg-[#D5F3D5] transition-colors duration-300`}
                  >
                    <td className="p-3">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
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

        {/* Pagination Controls */}
        {data.length > 0 && (
          <div className="hidden md:flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-4 py-2 bg-green-700 text-white rounded-lg disabled:bg-gray-300"
              disabled={currentPage === 1}
            >
              Prev
            </button>

            <div className="flex items-center gap-2">
              <span>Halaman</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) =>
                  setCurrentPage(
                    Math.min(totalPages, Math.max(1, Number(e.target.value)))
                  )
                }
                className="w-16 px-2 py-1 border rounded-lg"
              />
              <span>/ {totalPages}</span>
            </div>

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              className="px-4 py-2 bg-green-700 text-white rounded-lg disabled:bg-gray-300"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
