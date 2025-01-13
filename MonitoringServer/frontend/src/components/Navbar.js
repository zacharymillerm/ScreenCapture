import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("eagle_vision");

  const handleLogout = () => {
    localStorage.removeItem("eagle_vision"); // Clear the localStorage key
    setIsAuthenticated(false); // Update state immediately
    navigate("/login"); // Redirect to login page
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="flex justify-end">
        <Link
          to="/"
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
        >
          All Employees
        </Link>
        <Link
          to="/dangerzone"
          className="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600"
        >
          Clean History
        </Link>
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
