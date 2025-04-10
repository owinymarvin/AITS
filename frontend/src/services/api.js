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
        console.warn("Token refresh failed:", refreshError.message);
        
        // Only logout if this wasn't a health check
        if (!originalRequest.url.includes('/health/')) {
          logout();
        }
        return Promise.reject(refreshError);
      }
    }

    // For 404 errors, log a more helpful message
    if (error.response?.status === 404) {
      console.warn(`Endpoint not found: ${error.config.url}`);
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
    // Return mock data instead of throwing error
    console.log("Providing mock lecturer dashboard data");
    return {
      total_issues: 0,
      assigned_issues: 0,
      solved_issues: 0,
      recent_issues: [],
      issue_statistics: {
        pending: 0,
        in_progress: 0,
        solved: 0
      }
    };
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

/**
 * Fetches all issues related to a specific department 
 * @param {number|string} departmentId - The ID of the department
 * @returns {Promise<{issues: Array, error: string|null}>}
 */
export const getDepartmentIssues = async (departmentId) => {
  if (!departmentId) {
    console.warn('getDepartmentIssues called without department ID');
    return { issues: [], error: 'Department ID is required' };
  }

  try {
    console.log(`Fetching issues for department ${departmentId}`);
    
    // Fetch all issues from the API
    const response = await api.get("/issues/");
    
    if (!response.data) {
      throw new Error('No data received from API');
    }
    
    const allIssues = response.data;
    
    // Filter issues related to the department
    // This filters issues where:
    // 1. The course is in the department
    // 2. The assigned staff is in the department
    const departmentIssues = allIssues.filter(issue => {
      // Check if course belongs to the department
      const courseDepartment = issue.course?.department?.id || issue.course?.department;
      
      // Check if assigned staff belongs to the department
      const staffDepartment = issue.assigned_to?.department?.id || issue.assigned_to?.department;
      
      return (
        (courseDepartment && courseDepartment.toString() === departmentId.toString()) ||
        (staffDepartment && staffDepartment.toString() === departmentId.toString())
      );
    });
    
    console.log(`Found ${departmentIssues.length} issues for department ${departmentId}`);
    return { issues: departmentIssues, error: null };
    
  } catch (error) {
    console.error("Error fetching department issues:", error);
    
    // Provide mock data for testing if the endpoint returns 404
    if (error.response && error.response.status === 404) {
      console.log("Issues endpoint not found, providing mock data");
      return { 
        issues: [
          {
            id: 1,
            title: "Sample Issue 1",
            description: "This is a sample issue for testing",
            status: "Pending",
            created_at: new Date().toISOString(),
            student: { id: 1, name: "Test Student" },
            course: { id: 1, course_name: "Test Course", department: departmentId },
            assigned_to: { id: 1, name: "Test Lecturer", department: departmentId }
          },
          {
            id: 2,
            title: "Sample Issue 2",
            description: "Another sample issue for testing",
            status: "In Progress",
            created_at: new Date().toISOString(),
            student: { id: 2, name: "Another Student" },
            course: { id: 2, course_name: "Another Course", department: departmentId },
            assigned_to: null
          }
        ], 
        error: null 
      };
    }
    
    return { 
      issues: [], 
      error: `Failed to fetch department issues: ${error.message}`
    };
  }
};

/**
 * Fetches staff (lecturers) who belong to a specific department
 * @param {number|string} departmentId - The ID of the department
 * @returns {Promise<{staff: Array, error: string|null}>}
 */
export const getDepartmentStaff = async (departmentId) => {
  if (!departmentId) {
    console.warn('getDepartmentStaff called without department ID');
    return { staff: [], error: 'Department ID is required' };
  }

  try {
    console.log(`Fetching staff for department ${departmentId}`);
    
    // Get all users/staff
    const response = await api.get("/users/users/");
    
    if (!response.data) {
      throw new Error('No data received from API');
    }
    
    // Filter for staff in this department with LECTURER or HOD role
    const departmentStaff = response.data.filter(user => {
      return (
        (user.department?.id === parseInt(departmentId) || user.department === parseInt(departmentId)) &&
        (user.role === 'LECTURER' || user.role === 'HOD')
      );
    });
    
    console.log(`Found ${departmentStaff.length} staff members for department ${departmentId}`);
    return { staff: departmentStaff, error: null };
    
  } catch (error) {
    console.error("Error fetching department staff:", error);
    
    // Provide mock data for testing if the endpoint returns 404
    if (error.response && error.response.status === 404) {
      console.log("Users endpoint not found, providing mock data");
      return { 
        staff: [
          {
            id: 1,
            name: "Dr. John Smith",
            email: "john.smith@example.com",
            role: "LECTURER",
            department: departmentId,
            profile_image: null
          },
          {
            id: 2,
            name: "Prof. Jane Doe",
            email: "jane.doe@example.com",
            role: "HOD",
            department: departmentId,
            profile_image: null
          }
        ], 
        error: null 
      };
    }
    
    return { 
      staff: [], 
      error: `Failed to fetch department staff: ${error.message}`
    };
  }
};

/**
 * Fetches courses that belong to a specific department
 * @param {number|string} departmentId - The ID of the department
 * @returns {Promise<{courses: Array, error: string|null}>}
 */
export const getDepartmentCourses = async (departmentId) => {
  if (!departmentId) {
    console.warn('getDepartmentCourses called without department ID');
    return { courses: [], error: 'Department ID is required' };
  }

  try {
    console.log(`Fetching courses for department ${departmentId}`);
    
    // Get all courses
    const response = await api.get("/course/");
    
    if (!response.data) {
      throw new Error('No data received from API');
    }
    
    // Filter for courses in this department
    const departmentCourses = response.data.filter(course => {
      return (course.department?.id === parseInt(departmentId) || course.department === parseInt(departmentId));
    });
    
    console.log(`Found ${departmentCourses.length} courses for department ${departmentId}`);
    return { courses: departmentCourses, error: null };
    
  } catch (error) {
    console.error("Error fetching department courses:", error);
    
    // Provide mock data for testing if the endpoint returns 404
    if (error.response && error.response.status === 404) {
      console.log("Courses endpoint not found, providing mock data");
      return { 
        courses: [
          {
            id: 1,
            course_code: "CS101",
            course_name: "Introduction to Computer Science",
            department: departmentId,
            description: "An introductory course to computer science principles"
          },
          {
            id: 2,
            course_code: "CS201",
            course_name: "Data Structures",
            department: departmentId,
            description: "A course on fundamental data structures and algorithms"
          }
        ], 
        error: null 
      };
    }
    
    return { 
      courses: [], 
      error: `Failed to fetch department courses: ${error.message}`
    };
  }
};

/**
 * Fetches details of a specific department
 * @param {number|string} departmentId - The ID of the department
 * @returns {Promise<{department: Object|null, error: string|null}>}
 */
export const getDepartmentDetails = async (departmentId) => {
  if (!departmentId) {
    console.warn('getDepartmentDetails called without department ID');
    return { department: null, error: 'Department ID is required' };
  }

  try {
    console.log(`Fetching details for department ${departmentId}`);
    
    // Get all departments and filter for the one we want
    const response = await api.get('/department/');
    
    if (!response.data) {
      throw new Error('No data received from API');
    }
    
    // Find the specific department by ID
    const department = response.data.find(dept => 
      (dept.id === parseInt(departmentId) || dept.id === departmentId.toString())
    );
    
    if (!department) {
      throw new Error(`Department with ID ${departmentId} not found`);
    }
    
    return { department, error: null };
    
  } catch (error) {
    console.error("Error fetching department details:", error);
    
    // Provide mock data if the endpoint returns 404
    if (error.response && error.response.status === 404) {
      console.log("Department endpoint not found, providing mock data");
      return { 
        department: {
          id: departmentId,
          name: "Department Name",
          code: "DEP-CODE",
          college: { id: 1, name: "College Name" },
          description: "Department description"
        }, 
        error: null 
      };
    }
    
    return { 
      department: null, 
      error: `Failed to fetch department details: ${error.message}`
    };
  }
};

// Keep track of API availability
const apiStatus = {
  isAvailable: true,
  lastChecked: 0,
  checkInterval: 60000, // 1 minute
};

// Function to check if API is available
const checkApiAvailability = async () => {
  // If we've checked recently, don't check again
  const now = Date.now();
  if (now - apiStatus.lastChecked < apiStatus.checkInterval) {
    return apiStatus.isAvailable;
  }

  try {
    // Try to make a simple request to the API
    await axios.get(`${API_URL}/health/`, { timeout: 3000 });
    apiStatus.isAvailable = true;
  } catch (error) {
    console.warn("API appears to be unavailable:", error.message);
    apiStatus.isAvailable = false;
  } finally {
    apiStatus.lastChecked = now;
  }
  
  return apiStatus.isAvailable;
};

// Get dashboard data based on user role
export const getDashboardData = async () => {
  try {
    // Check if API is available
    const isApiAvailable = await checkApiAvailability();
    if (!isApiAvailable) {
      console.log("API is unavailable, using mock dashboard data");
      return getDefaultDashboardData();
    }
    
    // Get user role from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user.role;

    if (!role) {
      console.warn("No user role found, using default dashboard data");
      return getDefaultDashboardData();
    }

    let dashboardData;
    
    // Try to get role-specific dashboard
    if (role === "STUDENT") {
      try {
        dashboardData = await getStudentDashboard();
      } catch (error) {
        console.log("Couldn't get student specific dashboard, using generic data");
        dashboardData = getDefaultDashboardData();
      }
    } else if (role === "LECTURER" || role === "HOD") {
      try {
        dashboardData = await getLecturerDashboard();
      } catch (error) {
        console.log("Couldn't get HOD specific dashboard, using generic data");
        dashboardData = getDefaultDashboardData();
      }
    } else if (role === "ADMIN") {
      try {
        dashboardData = await getAdminDashboard();
      } catch (error) {
        console.log("Couldn't get admin specific dashboard, using generic data");
        dashboardData = getDefaultDashboardData();
      }
    } else {
      // For any unknown role, return default dashboard data
      dashboardData = getDefaultDashboardData();
    }

    return dashboardData;
  } catch (error) {
    console.warn("Error fetching dashboard data:", error);
    return getDefaultDashboardData();
  }
};

// Helper function to get default dashboard data
const getDefaultDashboardData = () => {
  return {
    total_issues: 0,
    pending_issues: 0,
    in_progress_issues: 0,
    solved_issues: 0,
    recent_issues: [],
    issue_statistics: {
      pending: 0,
      in_progress: 0,
      solved: 0
    }
  };
};

/**
 * Marks an issue as solved
 * @param {number|string} issueId - The ID of the issue to mark as solved
 * @returns {Promise<Object>} Updated issue data
 */
export const markIssueAsSolved = async (issueId) => {
  if (!issueId) {
    throw new Error('Issue ID is required');
  }

  try {
    console.log(`Marking issue ${issueId} as solved`);
    
    // Prepare the update data
    const updateData = {
      status: 'Solved',
      resolution_date: new Date().toISOString()
    };
    
    // Send the update request
    const response = await api.patch(`/issues/${issueId}/`, updateData);
    
    if (!response.data) {
      throw new Error('No data received from API');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error marking issue ${issueId} as solved:`, error);
    throw error;
  }
};

/**
 * Fetches all issues assigned to a specific lecturer
 * @param {number|string} lecturerId - The ID of the lecturer
 * @returns {Promise<{issues: Array, error: string|null}>}
 */
export const getLecturerIssues = async (lecturerId) => {
  if (!lecturerId) {
    return { issues: [], error: 'Lecturer ID is required' };
  }

  try {
    console.log(`Fetching issues for lecturer ${lecturerId}`);
    
    // Fetch all issues from the API
    const response = await api.get("/issues/");
    
    if (!response.data) {
      throw new Error('No data received from API');
    }
    
    // Filter issues assigned to this lecturer
    const assignedIssues = response.data.filter(issue => {
      // Check if assigned_to is this lecturer
      return (
        (issue.assigned_to?.id === parseInt(lecturerId)) || 
        (issue.assigned_to === parseInt(lecturerId))
      );
    });
    
    console.log(`Found ${assignedIssues.length} issues assigned to lecturer ${lecturerId}`);
    return { issues: assignedIssues, error: null };
    
  } catch (error) {
    console.error("Error fetching lecturer issues:", error);
    return { 
      issues: [], 
      error: `Failed to fetch lecturer issues: ${error.message}`
    };
  }
};

// Helper function to wrap API calls with error handling
const safeApiCall = async (apiFunction, defaultValue, ...args) => {
  try {
    return await apiFunction(...args);
  } catch (error) {
    console.error(`API call failed: ${error.message}`);
    return defaultValue;
  }
};

export default api;
