const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const uploadRoute = require('./api/upload');
const fetchScreenshotsRoute = require('./api/fetchScreenshots');
const healthCheckRoute = require('./api/healthCheck');
const employeesWithScreenshot = require('./api/employees');
const cleanOldData = require('./api/cleanOldData');
const login = require('./api/manager');

const app = express();
const PORT = 3337;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/login', login);
app.use('/api/upload', uploadRoute);
app.use('/api/screenshots', fetchScreenshotsRoute);
app.use('/api/ping', healthCheckRoute);
app.use('/api/employees', employeesWithScreenshot);
app.use('/api/clean-old-data', cleanOldData);

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
