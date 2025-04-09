// frontend/src/services/api.js
import axios from "axios";

const API_URL = "http://localhost:8000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor for JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(`${API_URL}/users/token/refresh/`, {
          refresh: refreshToken,
        });

        if (response.data.access) {
          localStorage.setItem("access_token", response.data.access);
          // Update the auth header for the original request
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${response.data.access}`;
          // Retry the original request
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, log out the user
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users/register/`, userData);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Auth service functions
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/users/token/`, {
      email,
      password,
    });

    if (response.data.access) {
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      // Get user data after successful login
      const userResponse = await api.get("/users/me/");
      if (userResponse.data) {
        localStorage.setItem("user", JSON.stringify(userResponse.data));
      }

      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  window.location.href = "/login"; // Forces full reload
};

export const getCurrentUser = async () => {
  // First check localStorage for cached user data
  const userData = localStorage.getItem("user");
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (e) {
      // If JSON parsing fails, clear the invalid data
      localStorage.removeItem("user");
      console.error("Error parsing user data:", e);
    }
  }

  // Only try API if we have an access token
  const token = localStorage.getItem("access_token");
  if (!token) {
    return null;
  }

  try {
    const response = await api.get("/users/me/");
    if (response && response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    // If unauthorized, clear user data
    if (error.response?.status === 401) {
      logout();
    }
    return null;
  }
};

export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post(`${API_URL}/users/token/refresh/`, {
      refresh: refreshToken,
    });

    if (response.data.access) {
      localStorage.setItem("access_token", response.data.access);
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Error refreshing token:", error);
    logout();
    throw error;
  }
};

// Dashboard API functions
export const getStudentDashboard = async () => {
  try {
    const response = await api.get("/dashboard/student/");
    return response.data;
  } catch (error) {
    console.error("Error fetching student dashboard:", error);
    throw error;
  }
};

export const getLecturerDashboard = async () => {
  try {
    const response = await api.get("/dashboard/lecturer/");
    return response.data;
  } catch (error) {
    console.error("Error fetching lecturer dashboard:", error);
    throw error;
  }
};

export const getAdminDashboard = async () => {
  try {
    const response = await api.get("/dashboard/admin/");
    return response.data;
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    throw error;
  }
};

// services/api.js (or your API utility file)
export const getUsers = async () => {
  try {
    const response = await api.get("/users/users/");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const getLecturers = async () => {
  try {
    const response = await api.get("/users/users/");
    const data = response.data;
    // Filter the data to only include lecturers
    const lecturers = data.filter((user) => user.role === "LECTURER");
    return lecturers;
  } catch (error) {
    console.error("Error fetching lecturers:", error);
    return [];
  }
};

// College API functions
export const createCollege = async (collegeData) => {
  try {
    const response = await api.post("/admin/api/college/add/", collegeData);
    return response.data;
  } catch (error) {
    console.error("Error creating college:", error);
    throw error;
  }
};

export const getColleges = async () => {
  const token = localStorage.getItem("access_token");

  try {
    // Use the axios instance with auth interceptors
    const response = await api.get("/college/");
    return response.data;
  } catch (error) {
    console.error("Error fetching colleges:", error);
    throw error;
  }
};

export const getDepartments = async () => {
  try {
    // Use the api instance which already has token handling
    const response = await api.get("/department/");
    return response.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};

export const createDepartment = async (departmentData) => {
  try {
    const response = await api.post(
      "/admin/api/department/add/",
      departmentData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error creating department:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getIssues = async () => {
  try {
    // Use the api instance which already has token handling
    const response = await api.get("/issues/");
    return response.data;
  } catch (error) {
    console.error("Error fetching issues:", error);
    throw error;
  }
};

export const createIssue = async (issueData) => {
  try {
    const response = await api.post("/admin/api/issue/add/", issueData);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating issue:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getCourses = async () => {
  try {
    const response = await api.get("/course/");
    return response.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

export const createCourse = async (courseData) => {
  try {
    const response = await api.post("/admin/api/course/add/", courseData);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating course:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export default api;
