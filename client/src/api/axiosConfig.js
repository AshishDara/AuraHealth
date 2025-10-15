import axios from 'axios';

// Create a new instance of axios
const api = axios.create({
  baseURL: 'http://localhost:5001/api/v1',
});

// THIS IS THE KEY FIX: The Interceptor
// This function runs BEFORE every single request is sent.
api.interceptors.request.use(
  (config) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (userInfo && userInfo.token) {
      // If the user is logged in, add the token to the request headers
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;