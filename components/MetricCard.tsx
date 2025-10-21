// components/MetricCard.tsx

// Tipe untuk properti, termasuk nilai ambang batas untuk warna
interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  // Ambang batas: [baik, waspada]
  thresholds?: [number, number];
}

// Fungsi untuk menentukan warna berdasarkan nilai dan ambang batas
const getCardColor = (value: number, thresholds?: [number, number]): string => {
  if (!thresholds) return "bg-green-100"; // Default
  if (value < thresholds[0] || value > thresholds[1]) {
    return "bg-red-100 text-red-800"; // Di luar batas aman
  }
  return "bg-green-100 text-green-800"; // Dalam batas aman
};

export default function MetricCard({
  title,
  value,
  unit,
  thresholds,
}: MetricCardProps) {
  const colorClass = getCardColor(value, thresholds);

  return (
    <div
      className={`w-full p-4 rounded-lg shadow-lg transition-transform hover:scale-105 ${colorClass}`}
    >
      <p className="text-lg font-medium text-gray-700">{title}</p>
      <div className="mt-2 flex items-baseline justify-center gap-2">
        <span className="text-5xl font-bold text-gray-900">
          {value.toFixed(1)}
        </span>
        {unit && <span className="text-2xl text-gray-600">{unit}</span>}
      </div>
      {/* Pesan bantuan sederhana untuk petani */}
      <p className="text-center text-xs text-gray-500 mt-2">
        {title === "pH Tanah" ? "Normal: 6.0 - 7.0" : ""}
      </p>
    </div>
  );
}
