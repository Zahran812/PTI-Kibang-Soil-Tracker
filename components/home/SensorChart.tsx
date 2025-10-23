// components/SensorChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";

interface SensorChartProps {
  title: string;
  data: any[];
  dataKey: string;
  unit: string;
}

export default function SensorChart({
  title,
  data,
  dataKey,
  unit,
}: SensorChartProps) {
  // Data dummy jika data asli kosong, agar grafik tetap terlihat
  const dummyData = useMemo(
    () => [
      { time: "08:00", [dataKey]: 0 },
      { time: "10:00", [dataKey]: 0 },
      { time: "12:00", [dataKey]: 0 },
      { time: "14:00", [dataKey]: 0 },
    ],
    [dataKey]
  );

  const chartData = data.length > 0 ? data : dummyData;

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg h-80">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: -10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            label={{ value: "Waktu", position: "insideBottom", offset: -15 }}
          />
          <YAxis unit={unit} />
          <Tooltip formatter={(value) => `${value} ${unit}`} />
          <Legend verticalAlign="top" height={36} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#28A428"
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
