import React, { useState } from "react";
import { resendVerificationEmail } from "../services/api";
import { useNavigate } from "react-router-dom";

function ResendVerification() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: "" });

    try {
      await resendVerificationEmail(email);
      setStatus({
        loading: false,
        success: true,
        error: "",
      });

      // Redirect or show success message
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setStatus({
        loading: false,
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to resend verification email",
      });
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <form onSubmit={handleSubmit}>
            <h2 className="text-center mb-4">Resend Verification Email</h2>

            {status.error && (
              <div className="alert alert-danger">{status.error}</div>
            )}

            {status.success && (
              <div className="alert alert-success">
                Verification email resent successfully! Redirecting to login...
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={status.loading}
            >
              {status.loading ? "Sending..." : "Resend Verification Email"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResendVerification;
