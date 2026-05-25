import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
);

export default function ProgressChart({ tasks }) {
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.length - completed;

  // Subject-wise count
  const subjectMap = {};
  tasks.forEach(task => {
    subjectMap[task.subject] = (subjectMap[task.subject] || 0) + 1;
  });

  const barData = {
    labels: Object.keys(subjectMap),
    datasets: [
      {
        label: "Tasks",
        data: Object.values(subjectMap),
        backgroundColor: "#2563eb",
      },
    ],
  };

  const doughnutData = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [completed, pending],
        backgroundColor: ["#16a34a", "#f97316"],
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4 text-center">
          Subject-wise Tasks
        </h3>
        <Bar data={barData} />
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4 text-center">
          Completion Status
        </h3>
        <Doughnut data={doughnutData} />
      </div>
    </div>
  );
}
