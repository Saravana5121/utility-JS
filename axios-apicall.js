// Create an Axios instance with default config (baseURL, timeout, default headers):contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}.
const axiosInstance = axios.create({
  baseURL: 'https://api.example.com',  // Set your base API URL here
  timeout: 10000,                      // Request timeout (ms)
  headers: {
    'Content-Type': 'application/json' // Default content type
  }
});

// Request interceptor to add an auth token (example):contentReference[oaicite:2]{index=2}.
axiosInstance.interceptors.request.use(
  (config) => {
    // Attach auth token if present (browser example)
    const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling (example).
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // You could check error.response.status, log out user on 401, etc.
    return Promise.reject(error);
  }
);

/**
 * Universal HTTP request function supporting async/await or callback.
 * - Supports GET, POST, PUT, DELETE, PATCH (all HTTP methods):contentReference[oaicite:3]{index=3}.
 * - Accepts options: { method, url, data, params, headers }.
 * - Handles JSON and multipart/form-data automatically:contentReference[oaicite:4]{index=4}.
 */
const httpRequest = (options = {}, callback) => {
  const { method = 'GET', url, data = null, params = null, headers = {} } = options;
  const config = {
    method,
    url,
    params,
    data,
    // Merge any custom headers; axiosInstance has default Content-Type for JSON
    headers: { ...axiosInstance.defaults.headers.common, ...headers }
  };

  // If data is a FormData object, set header for multipart/form-data (Axios will handle serialization):contentReference[oaicite:5]{index=5}.
  if (data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  }

  // Perform the request using the Axios instance
  const promise = axiosInstance.request(config).then(res => res.data);

  // If a callback is provided, use Node-style callback (error-first)
  if (typeof callback === 'function') {
    promise.then(result => callback(null, result))
           .catch(err => callback(err));
  }

  return promise; // Returns a Promise (async/await friendly):contentReference[oaicite:6]{index=6}.
};

// Example usage:

// 1. GET request with query parameters (async/await)
(async () => {
  try {
    const users = await httpRequest({
      method: 'GET',
      url: '/users',
      params: { page: 2 }
    });
    console.log('GET response:', users);
  } catch (err) {
    console.error('GET error:', err);
  }
})();

// 2. POST request with JSON body (using callback)
const newUser = { name: 'Alice', age: 30 };
httpRequest(
  { method: 'POST', url: '/users', data: newUser },
  (err, data) => {
    if (err) {
      console.error('POST error:', err);
    } else {
      console.log('POST response:', data);
    }
  }
);
