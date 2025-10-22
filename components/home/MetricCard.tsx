// components/MetricCard.tsx

// Tipe untuk properti, termasuk nilai ambang batas untuk warna
interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  // Ambang batas: [batas_bawah, batas_atas]
  thresholds?: [number, number];
}

// Fungsi untuk menentukan warna berdasarkan nilai dan ambang batas
const getCardColor = (value: number, thresholds?: [number, number]): string => {
  if (!thresholds) return "bg-gray-100"; // Warna netral jika tidak ada ambang batas

  const [min, max] = thresholds;

  if (value >= min && value <= max) {
    return "bg-green-100 text-green-800"; // Dalam batas aman (Normal)
  }
  return "bg-red-100 text-red-800"; // Di luar batas aman (Bahaya)
};

// Fungsi untuk membuat pesan bantuan
const getHelperMessage = (
  title: string,
  thresholds?: [number, number]
): string => {
  if (!thresholds) return "";
  return `Normal: ${thresholds[0]} - ${thresholds[1]}`;
};

export default function MetricCard({
  title,
  value,
  unit,
  thresholds,
}: MetricCardProps) {
  const colorClass = getCardColor(value, thresholds);
  const helperMessage = getHelperMessage(title, thresholds);

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
      {helperMessage && (
        <p className="text-center text-xs text-gray-500 mt-2">
          {helperMessage}
        </p>
      )}
    </div>
  );
}
