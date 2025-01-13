const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Helper function to convert local time to UTC
const toUtc = (dateStr, timeZone) => {
  return new Date(`${dateStr}T00:00:00${timeZone}`);
};

// Fetch screenshots endpoint
router.get("/", (req, res) => {
  const { employeeId, startDate, endDate } = req.query;

  if (!employeeId) {
    return res.status(400).send({ error: "Employee ID is required" });
  }

  const employeeDir = `uploads/${employeeId}`;
  if (!fs.existsSync(employeeDir)) {
    return res.status(404).send({ error: "Employee ID not found" });
  }

  const serverTimeZone = "-05:00"; // Assuming server is in EST

  // Convert the local startDate and endDate to UTC
  const startUtc = startDate ? toUtc(startDate, serverTimeZone) : null;
  const endUtc = endDate
    ? new Date(toUtc(endDate, serverTimeZone).getTime() + 24 * 60 * 60 * 1000)
    : null;

  const screenshots = fs.readdirSync(employeeDir).filter((file) => {
    try {
      const timestamp = file.split(".")[0];
      const [datePart, timePart] = timestamp.split("_");
      const fileDateTime = new Date(`${datePart}T${timePart.replace(/-/g, ":")}.000Z`);

      // Filter based on startDate and endDate
      return (
        (!startUtc || fileDateTime >= startUtc) && (!endUtc || fileDateTime < endUtc)
      );
    } catch (err) {
      console.error("Error parsing filename:", file);
      return false;
    }
  });

  const filePaths = screenshots.map((file) => path.join(employeeDir, file));
  res.status(200).send({ screenshots: filePaths });
});

module.exports = router;
