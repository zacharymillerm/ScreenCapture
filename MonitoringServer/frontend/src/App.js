import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import DangerZone from "./pages/DangerZone";
import EmployeeDetail from "./pages/EmployeeDetail";
import LoginPage from "./pages/LoginPage";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("eagle_vision"))
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(Boolean(localStorage.getItem("eagle_vision")));
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Header already includes Navbar */}
        <Header setIsAuthenticated={setIsAuthenticated} />
        <main className="flex-grow p-4">
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/dangerzone"
              element={
                isAuthenticated ? <DangerZone /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/details/:employeeId"
              element={
                isAuthenticated ? <EmployeeDetail /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/login"
              element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />}
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
