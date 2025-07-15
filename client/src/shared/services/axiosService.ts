import axios from "axios";
import env from "@/config/env";

const axiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response, // Return the response if successful
  async (error) => {
    const originalRequest = error.config;

    // Prevent refresh token request from being intercepted and retried
    if (originalRequest?.url === "/api/users/refresh") {
      return Promise.reject(error); // Don't retry the refresh token request
    }

    // Check if the error is 401 (Unauthorized) and the request hasn't been retried
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request as retried

      try {
        // Call the refresh token endpoint to get a new access token

        const response = await axiosInstance.post(
          "/api/users/refresh",
          {},
          {
            headers: {
              Cookie: originalRequest.headers.Cookie,
            },
          }
        );

        if (response.status === 200) {
          // Retry the original request with the new token
          originalRequest.headers.Cookie = response.headers["set-cookie"];
          const originalResponse = await axiosInstance(originalRequest);
          originalResponse.headers["set-cookie"] =
            response.headers["set-cookie"];
          return originalResponse;
        }
      } catch (err) {
        console.log("Failed to refresh token");

        return Promise.reject(err);
      }
    }

    return Promise.reject(error); // Return the error if it's not a 401
  }
);

export default axiosInstance;
