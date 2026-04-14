import axios from 'axios';

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export default {
  login: (data) => API.post("/auth/login", data),
  register: (data) => API.post("/auth/register", data),
};