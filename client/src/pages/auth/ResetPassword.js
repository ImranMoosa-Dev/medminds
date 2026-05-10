import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../utils/AxiosConfig";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!password) {
        toast.error("Please enter your new password.");
        return;
      }

      setLoading(true);

      const { data } = await axios.post(
        `${process.env.REACT_APP_BASEURL}/api/v1/auth/reset-password`,
        {
          token,
          password,
        },
      );

      if (data?.success) {
        toast.success(data.message);

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(data?.message || "Something went wrong.");
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Invalid or expired reset link.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <meta charSet="UTF-8" />
      <title>MedMinds | Reset Password</title>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --bg-primary: #ffffff;
              --bg-secondary: #f0f4f8;
              --text-primary: #1a1a1a;
              --text-secondary: #666666;
              --border-color: #e0e0e0;
              --blue: #0b63b7;
              --blue-dark: #0a4a8f;
              --shadow: 0 8px 32px rgba(11, 99, 183, 0.12);
            }

            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }

            body {
              font-family: "Inter", system-ui, sans-serif;
              background: var(--bg-secondary);
              color: var(--text-primary);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }

            .login-card {
              background: var(--bg-primary);
              border: 1px solid var(--border-color);
              border-radius: 18px;
              box-shadow: var(--shadow);
              padding: 40px;
              width: 100%;
              max-width: 440px;
            }

            .brand-container {
              display: flex;
              align-items: center;
              gap: 16px;
              margin-bottom: 28px;
            }

            .logo {
              width: 72px;
              height: 72px;
              border-radius: 14px;
              object-fit: cover;
              flex-shrink: 0;
            }

            .brand-text h1 {
              font-size: 22px;
              font-weight: 700;
              color: var(--blue);
              line-height: 1.2;
            }

            .brand-text p {
              font-size: 12px;
              color: var(--text-secondary);
              margin-top: 3px;
              text-transform: uppercase;
              letter-spacing: 0.6px;
            }

            .form-group {
              margin-bottom: 18px;
            }

            .form-group label {
              display: block;
              font-size: 13px;
              font-weight: 600;
              margin-bottom: 7px;
            }

            .form-group input {
              width: 100%;
              padding: 12px 14px;
              border: 1.5px solid var(--border-color);
              border-radius: 10px;
              font-size: 14px;
              font-family: inherit;
              background: var(--bg-secondary);
              color: var(--text-primary);
            }

            .form-group input:focus {
              outline: none;
              border-color: var(--blue);
              box-shadow: 0 0 0 3px rgba(11, 99, 183, 0.12);
              background: var(--bg-primary);
            }

            .btn-submit {
              width: 100%;
              padding: 13px;
              background: linear-gradient(
                135deg,
                var(--blue),
                var(--blue-dark)
              );
              color: #fff;
              border: none;
              border-radius: 10px;
              font-size: 15px;
              font-weight: 700;
              cursor: pointer;
              box-shadow: 0 4px 16px rgba(11, 99, 183, 0.25);
            }

            .btn-submit:hover {
              opacity: 0.9;
            }

            .btn-submit:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }

            .info-text {
              font-size: 13px;
              color: var(--text-secondary);
              line-height: 1.6;
              text-align: center;
              margin-top: 16px;
            }

            .form-footer {
              text-align: center;
              margin-top: 14px;
              font-size: 13px;
              color: var(--text-secondary);
            }

            .form-footer a {
              color: var(--blue);
              font-weight: 600;
              text-decoration: none;
            }

            .form-footer a:hover {
              text-decoration: underline;
            }

            .divider {
              margin-top: 24px;
              padding-top: 18px;
              border-top: 1px solid var(--border-color);
              text-align: center;
            }

            .secure-badge {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              font-size: 11px;
              color: var(--text-secondary);
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            @media (max-width: 480px) {
              .login-card {
                padding: 28px 22px;
              }

              .logo {
                width: 58px;
                height: 58px;
              }

              .brand-text h1 {
                font-size: 19px;
              }
            }
          `,
        }}
      />

      <div className="login-card" role="main" aria-labelledby="brand">
        <div className="brand-container">
          <img
            src="./assets/WhatsApp Image 2026-01-06 at 10.22.40 AM (1).jpeg"
            alt="MedMinds Logo"
            className="logo"
          />

          <div className="brand-text">
            <h1 id="brand">Reset Password</h1>
            <p>Create a new secure password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Updating Password..." : "Update Password"}
          </button>
        </form>

        <p className="info-text">
          Choose a strong password to keep your account secure.
        </p>

        <div className="form-footer">
          Remember your password? <Link to="/login">Sign In</Link>
        </div>

        <div className="divider">
          <span className="secure-badge">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 2.18l6 2.25v4.66c0 3.99-2.53 7.74-6 8.71-3.47-.97-6-4.72-6-8.71V6.43l6-2.25z" />
            </svg>
            Secure Medical Assessment Portal
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
