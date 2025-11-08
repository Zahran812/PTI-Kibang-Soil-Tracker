"use client";

import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useEffect, useRef, useState } from "react";

ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SensorRealtimeChartProps {
  title: string;
  unit?: string;
  color?: string;
  getLatestValue: () => number;
  interval?: number;
  maxPoints?: number;
}

export default function SensorRealtimeChart({
  title,
  unit = "",
  color = "#28A428",
  getLatestValue,
  interval = 1000,
  maxPoints = 60,
}: SensorRealtimeChartProps) {
  const [chartData, setChartData] = useState<{ labels: string[]; values: number[] }>({
    labels: [],
    values: [],
  });

  const chartRef = useRef<ChartJS<"line">>(null);

  // Tambah data realtime
  useEffect(() => {
    const timer = setInterval(() => {
      const value = getLatestValue();
      const now = new Date();
      const timeLabel = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setChartData((prev) => {
        const newLabels = [...prev.labels, timeLabel].slice(-maxPoints);
        const newValues = [...prev.values, value].slice(-maxPoints);
        return { labels: newLabels, values: newValues };
      });
    }, interval);

    return () => clearInterval(timer);
  }, [getLatestValue, interval, maxPoints]);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: title,
        data: chartData.values,
        borderColor: color,
        backgroundColor: color + "20",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: title },
    },
    animation: {
      duration: 300,
      easing: "easeInOutCubic",
    },
    scales: {
      x: {
        ticks: {
          color: "#666",
          maxTicksLimit: 5, // ✅ cuma tampilkan 5 label waktu
        },
        grid: { color: "rgba(220,220,220,0.2)" },
      },
      y: {
        beginAtZero: true,
        title: { display: !!unit, text: unit },
        ticks: { color: "#666" },
        grid: { color: "rgba(220,220,220,0.2)" },
      },
    },
  } as const;

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg h-80">
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
}
