// src/components/StatsCard.jsx
import React from "react";

export default function StatsCard({ icon, label, value, color }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow flex items-center gap-4">
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-lg ${color}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
