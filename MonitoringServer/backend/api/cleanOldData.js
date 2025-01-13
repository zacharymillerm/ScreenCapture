const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.delete('/', (req, res) => {

    const { days } = req.body;
    const baseDir = path.join(process.cwd(), 'uploads');
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - days);

    if (!fs.existsSync(baseDir)) {
        return res.status(404).send({ success: false, message: 'No employee data found.' });
    }

    try {
        fs.readdirSync(baseDir).forEach((employeeId) => {
            const employeeDir = path.join(baseDir, employeeId);

            if (fs.lstatSync(employeeDir).isDirectory()) {
                fs.readdirSync(employeeDir).forEach((file) => {
                    const filePath = path.join(employeeDir, file);
                    try {
                        const [datePart, timePart] = file.split('_');
                        const fileDate = new Date(`${datePart}T${timePart.split('.')[0].replace(/-/g, ':')}`);
                        
                        if (!isNaN(fileDate) && fileDate < twoWeeksAgo) {
                            fs.unlinkSync(filePath); // Remove file
                        }
                    } catch (err) {
                        console.error('Error parsing or removing file:', filePath, err);
                    }
                });
            }
        });
        console.log("Old data removed successfully by admin request.");
        res.status(200).send({ success: true, message: 'Old data removed successfully.' });
    } catch (err) {
        console.error('Error cleaning old data:', err);
        res.status(500).send({ success: false, message: 'Failed to clean old data.' });
    }
});

module.exports = router;
