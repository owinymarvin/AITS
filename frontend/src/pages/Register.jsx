import React, { useState, useEffect } from "react";
import { register, getColleges } from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import { TextField, MenuItem, Button, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import "../pages/auth.css";

function Register() {
  const { code } = useParams();
  const [colleges, setColleges] = useState([]);
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "STUDENT", // Default role can be "STUDENT"
    password: "",
    college_code: code || "", // Add course_code to form data
  });
  const [registrationStatus, setRegistrationStatus] = useState({
    success: false,
    message: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    const loadCollege = async () => {
      try {
        const collegeData = await getColleges();
        setColleges(collegeData);
      } catch (err) {
        setRegistrationStatus({
          success: false,
          message: "Could not load colleges. Please try again later.",
        });
        console.error("Error loading colleges:", err);
        setError("Could not load colleges. Please try again later.");
      }
    };

    loadCollege();
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
      setTimeout(() => {
        navigate("/login");
      }, 2000);
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

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper register-wrapper">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
        
        <div className="auth-card register-card">
          <div className="auth-header">
            <div className="logo-badge">
              <span>AITS</span>
            </div>
            <h1>Create an Account</h1>
            
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <TextField
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  variant="outlined"
                  placeholder="First name"
                  className="auth-input"
                  fullWidth
                  required
                  inputProps={{ maxLength: 50 }}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <TextField
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  variant="outlined"
                  placeholder="Last name"
                  className="auth-input"
                  fullWidth
                  required
                  inputProps={{ maxLength: 50 }}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <TextField
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
                placeholder="example@email.com"
                className="auth-input"
                fullWidth
                required
                inputProps={{ maxLength: 100 }}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <TextField
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                variant="outlined"
                placeholder="Your phone number"
                className="auth-input"
                fullWidth
                inputProps={{ maxLength: 10 }}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <TextField
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                variant="outlined"
                placeholder="Create a strong password"
                className="auth-input"
                fullWidth
                required
                inputProps={{ maxLength: 50 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        className="password-toggle"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="college_code">College</label>
              <TextField
                select
                id="college_code"
                name="college_code"
                value={formData.college_code}
                onChange={handleChange}
                variant="outlined"
                className="auth-input select-input"
                fullWidth
                required
              >
                <MenuItem value="">Select Your College</MenuItem>
                {colleges.map((college) => (
                  <MenuItem key={college.id} value={college.code}>
                    {college.code}
                  </MenuItem>
                ))}
              </TextField>
            </div>

            {registrationStatus.message && (
              <div className={`status-message ${registrationStatus.success ? "success" : "error"}`}>
                {registrationStatus.message}
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="auth-button"
            >
              Create Account
            </Button>
            
            <div className="auth-divider">
              <span>Already have an account?</span>
            </div>
            
            <Button
              variant="outlined"
              fullWidth
              className="auth-button secondary-button"
              onClick={goToLogin}
            >
              Log In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
