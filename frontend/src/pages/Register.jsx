import React, { useState, useEffect } from "react";
import { register, getFaculties } from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import { TextField, MenuItem, Button } from "@mui/material";

function Register() {
  const { code } = useParams();
  const [faculties, setFaculties] = useState([]);
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "STUDENT", // Default role can be "STUDENT"
    password: "",
    faculty_code: code || "", // Add course_code to form data
  });
  const [registrationStatus, setRegistrationStatus] = useState({
    success: false,
    message: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    const loadFaculty = async () => {
      try {
        const facultyData = await getFaculties();
        setFaculties(facultyData);
      } catch (err) {
        setRegistrationStatus({
          success: false,
          message: "Could not load faculties. Please try again later.",
        });
        console.error("Error loading faculties:", err);
        setError("Could not load faculties. Please try again later.");
      }
    };

    loadFaculty();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegistrationStatus({
      success: false,
      message: "",
    });

    try {
      const response = await register(formData);

      // Handle successful registration with verification
      setRegistrationStatus({
        success: true,
        message:
          response.message ||
          "Registration successful. Please check your email to verify your account.",
      });

      // Optional: Redirect after a delay or show verification instructions
      navigate("/login");
    } catch (error) {
      // Handle registration errors
      const errorMessage = error.response?.data?.details
        ? Object.values(error.response.data.details).flat()[0]
        : "Registration failed. Please try again.";

      setRegistrationStatus({
        success: false,
        message: errorMessage,
      });
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center">
      <div className="row w-100  align-items-center login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="mb-2">
            <div className="form-header">
              <h3>AITS Student Registration</h3>
            </div>
          </div>
          <TextField
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            select
            label="Faculty"
            name="faculty_code"
            value={formData.faculty_code}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          >
            <MenuItem value="">Select Faculty</MenuItem>
            {faculties.map((faculty) => (
              <MenuItem key={faculty.id} value={faculty.code}>
                {faculty.code}
              </MenuItem>
            ))}
          </TextField>

          {registrationStatus.message && (
            <div
              className={`alert ${
                registrationStatus.success ? "alert-success" : "alert-danger"
              }`}
            >
              {registrationStatus.message}
            </div>
          )}

          {error && <div className="error">{error}</div>}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 1 }}
            style={{ height: "50px", borderRadius: "48px" }}
          >
            Register
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Register;
