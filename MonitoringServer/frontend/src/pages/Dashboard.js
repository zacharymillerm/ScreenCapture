import React, { useState, useEffect } from "react";
import { fetchAllEmployeesWithLastScreenshot } from "../api/api";
import { useNavigate } from "react-router-dom";
import config from "../config";

function getTimeDifferenceAndColor(timestamp) {
  const now = new Date();
  // Convert UTC timestamp to EST (UTC-5)
  const past = new Date(timestamp);
  const estOffset = -5 * 60 * 60 * 1000; // EST offset in milliseconds
  const pastEst = new Date(past.getTime() + estOffset);
  
  const diffInMs = now - pastEst;

  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let timeText = "";
  let colorClass = "";

  if (seconds < 60) {
    timeText = `${seconds} secs ago`;
    colorClass = "bg-green-300";
  } else if (minutes < 5) {
    timeText = `${minutes} mins ago`;
    colorClass = "bg-green-300";
  } else if (minutes < 60) {
    timeText = `${minutes} mins ago`;
    colorClass = "bg-yellow-300";
  } else if (hours < 24) {
    timeText = `${hours} hours ago`;
    colorClass = "bg-red-300";
  } else {
    timeText = `${days} days ago`;
    colorClass = "bg-red-300";
  }

  return { timeText, colorClass };
}

const Dashboard = () => {
  const [employeesData, setEmployeesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const { data } = await fetchAllEmployeesWithLastScreenshot();
      setEmployeesData(data.employees || []);

      // Save to localStorage for the EmployeeDetail component
      localStorage.setItem("employees", JSON.stringify(data.employees || []));
    } catch (error) {
      console.error("Error fetching employees and screenshots:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(() => {
      fetchData();
    }, 30000); // Fetch data every 30 seconds

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleEmployeeClick = (employeeId) => {
    navigate(`/details/${employeeId}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Employees</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employeesData.map((employee) => {
          const { timeText, colorClass } = employee.latestScreenshot
            ? getTimeDifferenceAndColor(employee.latestScreenshot.timestamp)
            : { timeText: "No recent activity", colorClass: "bg-gray-300" };

          return (
            <div
              key={employee.id}
              onClick={() => handleEmployeeClick(employee.id)}
              className="border p-4 rounded shadow hover:shadow-lg cursor-pointer"
            >
              <h1 className="text-lg font-semibold">{employee.name}</h1>
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-600">ID: {employee.id}</p>
                <p
                  className={`font-semibold text-gray-600 ${colorClass} w-fit px-2`}
                >
                  Last seen: {timeText}
                </p>
              </div>
              {employee.latestScreenshot ? (
                <img
                  src={`${config.SERVER_URL}${employee.latestScreenshot.url}`}
                  alt="Latest Screenshot"
                  className="mt-2 rounded h-48"
                />
              ) : (
                <p className="mt-2 text-sm text-red-500">
                  No screenshot available
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
