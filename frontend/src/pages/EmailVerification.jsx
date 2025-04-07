import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../services/api";

function EmailVerification() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState({
    loading: true,
    success: false,
    message: "",
  });

  useEffect(() => {
    const performEmailVerification = async () => {
      try {
        const response = await verifyEmail(token);

        setVerificationStatus({
          loading: false,
          success: true,
          message: response.message || "Email verified successfully!",
        });

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        setVerificationStatus({
          loading: false,
          success: false,
          message:
            error.response?.data?.message ||
            "Email verification failed. Please try again.",
        });
      }
    };

    if (token) {
      performEmailVerification();
    }
  }, [token, navigate]);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div
            className={`alert ${
              verificationStatus.success ? "alert-success" : "alert-danger"
            }`}
          >
            {verificationStatus.loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm mr-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Verifying your email...
              </>
            ) : (
              verificationStatus.message
            )}
          </div>

          {!verificationStatus.success && !verificationStatus.loading && (
            <div className="text-center">
              <button
                onClick={() => navigate("/resend-verification")}
                className="btn btn-primary"
              >
                Resend Verification Email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmailVerification;
