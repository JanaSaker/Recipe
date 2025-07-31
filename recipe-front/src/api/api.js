import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // change port if needed
  withCredentials: true // if you’re using cookies for auth
});

export default api;
