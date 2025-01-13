import axios from "axios";
import config from "../config";

const { SERVER_URL } = config;

export const fetchScreenshots = (employeeId, startDate, endDate) => {
  return axios.get(`${SERVER_URL}/api/screenshots`, {
    params: { employeeId, startDate, endDate },
  });
};

export const fetchAllEmployeesWithLastScreenshot = () =>
  axios.get(`${SERVER_URL}/api/employees`);

export const cleanOldData = (days) => {
  return axios.delete(`${SERVER_URL}/api/clean-old-data`, {
    data: { days },
  });
};

export const login = (username, password) =>
  axios.post(`${SERVER_URL}/api/login`, {username, password});
