import React, { useState } from "react";
import { cleanOldData } from "../api/api";

const DangerZone = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRemoveOldData = async (days) => {
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await cleanOldData(days);
      if (response.data.success) {
        setSuccessMessage("Old data removed successfully!");
      } else {
        setErrorMessage("Failed to remove old data.");
      }
    } catch (err) {
      setErrorMessage("An error occurred while removing old data.");
    }
  };

  const confirmAndRemoveData = (days) => {
    const confirmationMessage =
      days === -1
        ? "Are you sure you want to remove ALL data? This action cannot be undone."
        : "Are you sure you want to remove data older than 2 weeks?";
    
    if (window.confirm(confirmationMessage)) {
      handleRemoveOldData(days);
    }
  };

  return (
    <div className="p-4 space-x-4">
      <h1 className="text-2xl font-bold">Danger Zone</h1>
      <button
        onClick={() => confirmAndRemoveData(14)}
        className="bg-yellow-500 text-white px-4 py-2 rounded mt-4"
      >
        Remove data older than 2 weeks
      </button>
      <button
        onClick={() => confirmAndRemoveData(-1)}
        className="bg-red-500 text-white px-4 py-2 rounded mt-4"
      >
        Remove all data
      </button>
      {successMessage && (
        <p className="text-green-500 mt-4">{successMessage}</p>
      )}
      {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
    </div>
  );
};

export default DangerZone;