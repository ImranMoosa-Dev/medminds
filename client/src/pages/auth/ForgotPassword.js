import { useState } from "react";
import axios from "../../utils/AxiosConfig";
// import "../../scripts/script";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email) {
      window.alert("Please enter your email address.");
      return;
    }
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_BASEURL}/api/v1/auth/forgot-password`,
        { email },
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <meta charSet="UTF-8" />
      <title>MedMinds | Forgot Password</title>
      <link rel="stylesheet" href="style.css" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style
        dangerouslySetInnerHTML={{
          __html:
            '\n      :root {\n        --bg-primary: #ffffff;\n        --bg-secondary: #f0f4f8;\n        --text-primary: #1a1a1a;\n        --text-secondary: #666666;\n        --border-color: #e0e0e0;\n        --blue: #0b63b7;\n        --blue-dark: #0a4a8f;\n        --shadow: 0 8px 32px rgba(11, 99, 183, 0.12);\n      }\n      [data-theme="dark"] {\n        --bg-primary: #1e2535;\n        --bg-secondary: #141b2b;\n        --text-primary: #f0f4ff;\n        --text-secondary: #94a3b8;\n        --border-color: #2e3d58;\n        --shadow: 0 8px 32px rgba(0, 0, 0, 0.4);\n      }\n\n      *,\n      *::before,\n      *::after {\n        box-sizing: border-box;\n        margin: 0;\n        padding: 0;\n      }\n\n      body {\n        font-family: "Inter", system-ui, sans-serif;\n        background: var(--bg-secondary);\n        color: var(--text-primary);\n        min-height: 100vh;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        padding: 20px;\n        transition:\n          background 0.3s,\n          color 0.3s;\n      }\n\n      .login-card {\n        background: var(--bg-primary);\n        border: 1px solid var(--border-color);\n        border-radius: 18px;\n        box-shadow: var(--shadow);\n        padding: 40px;\n        width: 100%;\n        max-width: 440px;\n      }\n\n      .brand-container {\n        display: flex;\n        align-items: center;\n        gap: 16px;\n        margin-bottom: 28px;\n      }\n      .logo {\n        width: 72px;\n        height: 72px;\n        border-radius: 14px;\n        object-fit: cover;\n        flex-shrink: 0;\n      }\n      .brand-text h1 {\n        font-size: 22px;\n        font-weight: 700;\n        color: var(--blue);\n        line-height: 1.2;\n      }\n      .brand-text p {\n        font-size: 12px;\n        color: var(--text-secondary);\n        margin-top: 3px;\n        text-transform: uppercase;\n        letter-spacing: 0.6px;\n      }\n\n      .alert {\n        padding: 12px 15px;\n        border-radius: 8px;\n        margin-bottom: 18px;\n        font-size: 13px;\n        display: none;\n        animation: slideDown 0.25s ease;\n      }\n      .alert.show {\n        display: block;\n      }\n      .alert.success {\n        background: #d4edda;\n        color: #155724;\n        border-left: 4px solid #28a745;\n      }\n      .alert.error {\n        background: #fde8e8;\n        color: #7a1d1d;\n        border-left: 4px solid #e53e3e;\n      }\n      [data-theme="dark"] .alert.success {\n        background: #1e4620;\n        color: #90ee90;\n      }\n      [data-theme="dark"] .alert.error {\n        background: #4a1a1a;\n        color: #ff9999;\n      }\n      @keyframes slideDown {\n        from {\n          opacity: 0;\n          transform: translateY(-8px);\n        }\n        to {\n          opacity: 1;\n          transform: translateY(0);\n        }\n      }\n\n      .form-group {\n        margin-bottom: 18px;\n      }\n      .form-group label {\n        display: block;\n        font-size: 13px;\n        font-weight: 600;\n        color: var(--text-primary);\n        margin-bottom: 7px;\n      }\n      .form-group input {\n        width: 100%;\n        padding: 12px 14px;\n        border: 1.5px solid var(--border-color);\n        border-radius: 10px;\n        font-size: 14px;\n        font-family: inherit;\n        background: var(--bg-secondary);\n        color: var(--text-primary);\n        transition:\n          border-color 0.2s,\n          box-shadow 0.2s;\n      }\n      .form-group input::placeholder {\n        color: var(--text-secondary);\n      }\n      .form-group input:focus {\n        outline: none;\n        border-color: var(--blue);\n        box-shadow: 0 0 0 3px rgba(11, 99, 183, 0.12);\n        background: var(--bg-primary);\n      }\n\n      .btn-submit {\n        width: 100%;\n        padding: 13px;\n        background: linear-gradient(135deg, var(--blue), var(--blue-dark));\n        color: #fff;\n        border: none;\n        border-radius: 10px;\n        font-size: 15px;\n        font-weight: 700;\n        font-family: inherit;\n        cursor: pointer;\n        transition:\n          opacity 0.2s,\n          transform 0.12s;\n        box-shadow: 0 4px 16px rgba(11, 99, 183, 0.25);\n      }\n      .btn-submit:hover {\n        opacity: 0.9;\n        transform: translateY(-1px);\n      }\n      .btn-submit:active {\n        transform: translateY(0);\n      }\n      .btn-submit:disabled {\n        opacity: 0.6;\n        cursor: not-allowed;\n        transform: none;\n      }\n\n      .info-text {\n        font-size: 13px;\n        color: var(--text-secondary);\n        line-height: 1.6;\n        text-align: center;\n        margin-top: 16px;\n      }\n\n      .form-footer {\n        text-align: center;\n        margin-top: 14px;\n        font-size: 13px;\n        color: var(--text-secondary);\n      }\n      .form-footer a {\n        color: var(--blue);\n        font-weight: 600;\n        text-decoration: none;\n      }\n      .form-footer a:hover {\n        text-decoration: underline;\n      }\n\n      .divider {\n        margin-top: 24px;\n        padding-top: 18px;\n        border-top: 1px solid var(--border-color);\n        text-align: center;\n      }\n      .secure-badge {\n        display: inline-flex;\n        align-items: center;\n        gap: 6px;\n        font-size: 11px;\n        color: var(--text-secondary);\n        font-weight: 600;\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n\n      @media (max-width: 480px) {\n        body {\n          align-items: flex-start;\n          padding-top: 40px;\n        }\n        .login-card {\n          padding: 28px 22px;\n          border-radius: 14px;\n        }\n        .logo {\n          width: 58px;\n          height: 58px;\n        }\n        .brand-text h1 {\n          font-size: 19px;\n        }\n      }\n      @media (max-width: 360px) {\n        body {\n          padding: 12px;\n          padding-top: 24px;\n        }\n        .login-card {\n          padding: 22px 16px;\n        }\n      }\n    ',
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
            <p>Recover your account</p>
          </div>
        </div>
        <div id="resetAlert" className="alert" role="alert" />
        <form id="resetForm" onSubmit={handlePasswordReset}>
          <div className="form-group">
            <label htmlFor="resetEmail">Email Address</label>
            <input
              type="email"
              id="resetEmail"
              placeholder="name@medical.com"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" id="resetBtn" className="btn-submit">
            Send Reset Link
          </button>
        </form>
        <p className="info-text">
          We'll send a password reset link to your registered email address.
        </p>
        <div className="form-footer">
          Remember your password? <a href="index.html">Sign In</a>
        </div>
        <div className="divider">
          <span className="secure-badge">
            <svg
              width={13}
              height={13}
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

export default ForgotPassword;
