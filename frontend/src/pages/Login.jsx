// frontend/src/pages/Login.js
import React, { useState } from "react";
import { login, getCurrentUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { TextField, Button } from "@mui/material";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      const userData = await getCurrentUser();
      setUser(userData);
      navigate("/dashboard");
    } catch (error) {
      setError("Invalid username or password");
      console.error("Login error:", error);
    }
  };

  const handleSignup = function () {
    navigate("/register");
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center">
      <div className="row w-100  align-items-center login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Welcome to the AITS platform</h2>
          <div className="mb-2">
            <div className="form-header">
              <h3>Sign in to your dashboard</h3>
            </div>
          </div>

          <TextField
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            style={{ height: "50px", borderRadius: "48px" }}
          >
            Login
          </Button>
          <p>Don't have an account?</p>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 1 }}
            style={{ height: "50px", borderRadius: "48px" }}
            onClick={handleSignup}
          >
            Sign Up here
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Login;
