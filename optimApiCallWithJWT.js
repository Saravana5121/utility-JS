// validating the token expiration
function isTokenExpired(token) {
  try {
    // Assumes jwt_decode is loaded globally via CDN
    const decoded = jwt_decode(token);
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch (e) {
    console.error("Error decoding token:", e);
    return true;
  }
}

// checking if the token is valid if not redirect to login page
(function () {
  const token = localStorage.getItem("jtck");
  if (!token || isTokenExpired(token)) {
    window.location.href = "/login.html";
  }
})();

// Create an Axios instance with default config
// Assumes axios is loaded globally via CDN
const axiosInstance = axios.create({
  baseURL: "https://api.example.com", // Set your base API URL here
  timeout: 10000, // Request timeout (ms)
  headers: {
    "Content-Type": "application/json", // Default content type
  },
});

// Request interceptor to add the auth token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jtck");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration or unauthorized errors
    if (error.response?.status === 401) {
      console.error("Unauthorized access. Redirecting to login.");
      localStorage.removeItem("jtck"); // Clear invalid token
      window.location.href = "/login.html";
    }
    return Promise.reject(error);
  }
);

/**
 * Modern, async/await based universal HTTP request function.
 * - Supports all HTTP methods (GET, POST, PUT, DELETE, etc.).
 * - Accepts an Axios configuration object { method, url, data, params, headers }.
 * - Automatically handles JSON and multipart/form-data.
 * @param {object} options - Axios request configuration.
 * @returns {Promise<any>} A promise that resolves with the response data.
 */
const httpRequest = async (options = {}) => {
  try {
    if (options.data instanceof FormData) {
      options.headers = {
        ...options.headers,
        // Note: Axios will overwrite this to add the correct boundary.
        'Content-Type': 'multipart/form-data',
      };
    }
    const response = await axiosInstance.request(options);
    return response.data;
  } catch (error) {
    console.error(`HTTP Request Failed: ${error.message}`, {
      config: error.config,
      response: error.response?.data,
    });
    // Re-throw the error so the calling function can handle it in its own context
    throw error;
  }
};
