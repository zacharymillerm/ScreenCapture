const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// New API to fetch all employees and their latest screenshots
router.get('/', (req, res) => {
    // Use process.cwd() for absolute path or verify __dirname correctness
    const baseDir = path.join(process.cwd(), 'uploads');
    console.log('Resolved uploads path:', baseDir);

    if (!fs.existsSync(baseDir)) {
        return res.status(404).send({ error: 'No employee data found', path: baseDir });
    }

    const employees = fs.readdirSync(baseDir).map((employeeId) => {
        const employeeDir = path.join(baseDir, employeeId);
        if (!fs.lstatSync(employeeDir).isDirectory()) {
            return null;
        }

        const screenshots = fs.readdirSync(employeeDir).filter((file) => {
            try {
                const [datePart, timePart] = file.split('_');
                const fileDate = new Date(`${datePart}T${timePart.split('.')[0].replace(/-/g, ':')}`);
                return !isNaN(fileDate); // Only include valid dates
            } catch (err) {
                console.error('Error parsing filename:', file);
                return false;
            }
        });

        if (screenshots.length > 0) {
            const latestScreenshot = screenshots
                .map((file) => ({
                    file,
                    date: new Date(`${file.split('_')[0]}T${file.split('_')[1].split('.')[0].replace(/-/g, ':')}`),
                }))
                .sort((a, b) => b.date - a.date)[0]; // Get the most recent screenshot

            return {
                id: employeeId,
                latestScreenshot: {
                    url: `/uploads/${employeeId}/${latestScreenshot.file}`,
                    timestamp: latestScreenshot.date,
                },
            };
        }

        return { id: employeeId, latestScreenshot: null }; // No screenshots for this employee
    });

    // Filter out null values (non-directories or errors)
    const filteredEmployees = employees.filter((emp) => emp !== null);

    res.status(200).send({ employees: filteredEmployees });
});

module.exports = router;
