// ActivityGraph.js
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the required components for Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ActivityGraph = ({ data }) => {
  // Create an array of labels for the hours (00 to 23)
  const labels = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));

  // Map the activity data to match the labels, defaulting to 0 if no data is provided for an hour
  const activityData = labels.map((hour) => data[parseInt(hour, 10)] || 0);

  // Calculate total activity time, inactivity time, and rate
  const totalScreenshots = activityData.reduce((sum, value) => sum + value, 0); // Total screenshots
  const totalActivityTime = (totalScreenshots * 30) / 3600; // Convert total screenshots to hours (30 seconds per screenshot)
  const totalInactivityTime = 24 - activityData.filter((value) => value > 0).length; // Hours with no activity
  const activityRate = (totalScreenshots * 30) / (24 * 3600) * 100; // Rate in percentage (based on total possible time in 24 hours)

  // Define the data and appearance for the chart
  const chartData = {
    labels,
    datasets: [
      {
        label: "Activity (Screenshots per Hour)",
        data: activityData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.3, // Smooth line
      },
    ],
  };

  // Configure chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 120,
        title: {
          display: true,
          text: "Screenshots",
        },
      },
      x: {
        title: {
          display: true,
          text: "Hours",
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div>
      <div style={{ width: "100%", height: "400px" }}>
        <Line data={chartData} options={options} />
      </div>
      {/* Display total activity time, inactivity time, and activity rate */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p className="text-green-500"><strong>Total Activity Time:</strong> {totalActivityTime.toFixed(2)} hours</p>
        <p className="text-red-500"><strong>Total Inactivity Time:</strong> {totalInactivityTime} hours</p>
        <p><strong>Activity Rate:</strong> {activityRate.toFixed(2)}%</p>
      </div>
    </div>
  );
};

export default ActivityGraph;