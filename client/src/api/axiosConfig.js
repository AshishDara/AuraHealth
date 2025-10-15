import axios from 'axios';

// Create a new instance of axios with a base URL
const api = axios.create({
  baseURL: 'http://localhost:5001/api/v1',
});

// Request Interceptor: Runs before every request is sent
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

// Response Interceptor: Runs after every response is received
api.interceptors.response.use(
  // The first function handles successful (2xx) responses
  (response) => {
    return response;
  },
  // The second function handles error responses
  (error) => {
    // Check if the specific error is a 401 Unauthorized error
    if (error.response && error.response.status === 401) {
      console.log("Authentication error (401). Logging out and redirecting.");
      
      // 1. Remove the invalid user info from local storage.
      localStorage.removeItem('userInfo');
      
      // 2. Force a redirect to the login page.
      window.location.href = '/login';
    }
    
    // For all other errors, just pass them along
    return Promise.reject(error);
  }
);

export default api;