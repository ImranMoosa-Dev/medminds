import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "../../utils/AxiosConfig";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_BASEURL}/api/V1/auth/verify-email/${token}`,
        );

        setStatus("success");
        setMessage(data.message || "Email verified successfully!");

        // auto redirect after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Verification failed or link expired.",
        );
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === "loading" && (
          <>
            <div style={styles.spinner}></div>
            <h2>Verifying your email...</h2>
            <p>Please wait while we activate your account.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={styles.successIcon}>✅</div>
            <h2>Email Verified!</h2>
            <p>{message}</p>
            <p>Redirecting you to login...</p>

            <Link to="/login" style={styles.button}>
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div style={styles.errorIcon}>❌</div>
            <h2>Verification Failed</h2>
            <p>{message}</p>

            <Link to="/account-confirmation" style={styles.button}>
              Resend Email
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5",
    fontFamily: "Arial",
  },
  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
    width: "400px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #ddd",
    borderTop: "4px solid #0b63b7",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px",
  },
  successIcon: {
    fontSize: "50px",
    marginBottom: "10px",
  },
  errorIcon: {
    fontSize: "50px",
    marginBottom: "10px",
  },
  button: {
    display: "inline-block",
    marginTop: "20px",
    padding: "10px 20px",
    background: "#0b63b7",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
  },
};

export default VerifyEmail;
