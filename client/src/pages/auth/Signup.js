import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { userRegister } from "../../api/authApi";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    district: "",
    whatsapp: "",
    status: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      fullName,
      fatherName,
      district,
      whatsapp,
      status,
      email,
      password,
      confirmPassword,
    } = formData;

    if (!fullName) return showAlert("Please enter your first name", "error");
    if (!fatherName) return showAlert("Please enter your last name", "error");
    if (!status) return showAlert("Please enter your status", "error");
    if (!email) return showAlert("Please enter your email", "error");
    if (!district) return showAlert("Please enter a District", "error");
    if (!whatsapp)
      return showAlert("Please enter your WhatsApp number", "error");
    if (!password) return showAlert("Please enter a password", "error");
    if (password.length < 8)
      return alert(
        "Password must be at least 8 characters and contain a number.",
        "error",
      );
    if (password !== confirmPassword)
      return showAlert("Passwords do not match", "error");

    try {
      // Register User
      const data = await userRegister(
        fullName,
        fatherName,
        district,
        whatsapp,
        status,
        email,
        password,
        confirmPassword,
      );

      if (!data.success) {
        throw new Error(data.error || "Signup failed.");
      }

      // toast.success(data.message || "Account created! Await approval.");
      setTimeout(() => {
        navigate(`/account-confirmation/${email}`);
      }, 1000);
    } catch (e) {
      console.error("Signup error:", e);
      toast.error(e.message || "Failed to create account");
    }
  };

  function showAlert(message, type = "error") {
    const alert = document.getElementById("formAlert");
    alert.textContent = message;
    alert.className = `alert ${type} show`;
    setTimeout(() => alert.classList.remove("show"), 5000);
  }
  return (
    <div>
      <meta charSet="UTF-8" />
      <title>MedMinds | Sign Up</title>
      <link rel="stylesheet" href="style.css" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style
        dangerouslySetInnerHTML={{
          __html:
            '\n      :root {\n        --bg-primary: #ffffff;\n        --bg-secondary: #f5f5f5;\n        --text-primary: #1a1a1a;\n        --text-secondary: #666666;\n        --border-color: #e0e0e0;\n        --gradient-start: #0b63b7;\n        --gradient-end: #0a4a8f;\n        --accent-red: #ff6b6b;\n      }\n\n      [data-theme="dark"] {\n        --bg-primary: #1a1a1a;\n        --bg-secondary: #2d2d2d;\n        --text-primary: #ffffff;\n        --text-secondary: #cccccc;\n        --border-color: #404040;\n        --gradient-start: #0b63b7;\n        --gradient-end: #0a4a8f;\n        --accent-red: #ff8888;\n      }\n\n      * {\n        color-scheme: light dark;\n      }\n\n      body {\n        background-color: var(--bg-secondary);\n        color: var(--text-primary);\n        transition:\n          background-color 0.3s,\n          color 0.3s;\n      }\n\n      .login-wrapper {\n        background-color: var(--bg-secondary);\n      }\n\n      .login-card {\n        background-color: var(--bg-primary);\n        border: 1px solid var(--border-color);\n      }\n\n      .form-group input,\n      .form-group textarea,\n      .form-group select {\n        background-color: var(--bg-secondary);\n        color: var(--text-primary);\n        border-color: var(--border-color);\n      }\n\n      .form-group input::placeholder,\n      .form-group textarea::placeholder {\n        color: var(--text-secondary);\n      }\n\n      .alert {\n        padding: 12px 15px;\n        border-radius: 6px;\n        margin-bottom: 15px;\n        font-size: 13px;\n        display: none;\n        animation: slideDown 0.3s;\n      }\n\n      @keyframes slideDown {\n        from {\n          transform: translateY(-10px);\n          opacity: 0;\n        }\n        to {\n          transform: translateY(0);\n          opacity: 1;\n        }\n      }\n\n      .alert.show {\n        display: block;\n      }\n\n      .alert.success {\n        background-color: #d4edda;\n        color: #155724;\n        border-left: 4px solid #28a745;\n      }\n\n      .alert.error {\n        background-color: #f8d7da;\n        color: #721c24;\n        border-left: 4px solid #f5222d;\n      }\n\n      [data-theme="dark"] .alert.success {\n        background-color: #1e4620;\n        color: #90ee90;\n      }\n\n      [data-theme="dark"] .alert.error {\n        background-color: #4a1a1a;\n        color: #ff9999;\n      }\n\n      @keyframes spin {\n        to {\n          transform: rotate(360deg);\n        }\n      }\n\n      .back-link {\n        text-align: center;\n        margin-top: 15px;\n        font-size: 13px;\n        color: var(--text-secondary);\n      }\n\n      .back-link a {\n        background: none;\n        border: none;\n        color: var(--gradient-start);\n        cursor: pointer;\n        font-weight: 600;\n        text-decoration: none;\n      }\n\n      .back-link a:hover {\n        text-decoration: underline;\n      }\n    ',
        }}
      />
      <main className="login-wrapper">
        <section className="login-card" aria-labelledby="brand">
          <div className="brand-container">
            <img
              src="WhatsApp Image 2026-01-06 at 10.22.40 AM (1).jpeg"
              alt="MedMinds Logo"
              className="logo"
            />
            <div className="brand-text">
              <h1 id="brand">MedMinds</h1>
              <p>Create your account</p>
            </div>
          </div>
          <div id="formAlert" className="alert" />
          {/* Sign Up Form */}
          <form id="signupForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="signupFullName">Full Name</label>
              <input
                type="text"
                id="signupFullName"
                placeholder="John"
                required
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="signupfatherName">Father Name</label>
              <input
                type="text"
                id="signupfatherName"
                placeholder="Doe"
                required
                onChange={(e) =>
                  setFormData({ ...formData, fatherName: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="signupDistrict">District</label>
              <input
                type="text"
                id="signupDistrict"
                placeholder="Badin"
                required
                onChange={(e) =>
                  setFormData({ ...formData, district: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="signupStatus">Status</label>
              <input
                type="text"
                id="signupStatus"
                placeholder="Student"
                required
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="signupEmail">Email Address</label>
              <input
                type="email"
                id="signupEmail"
                placeholder="name@medical.com"
                required
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="signupWhatsapp">Whatsapp Number</label>
              <input
                type="tel"
                id="signupWhatsapp"
                placeholder="+92 98765 43210"
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="signupPassword">Password</label>
              <input
                type="password"
                id="signupPassword"
                placeholder="••••••••"
                required
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="signupConfirmPassword">Confirm Password</label>
              <input
                type="password"
                id="signupConfirmPassword"
                placeholder="••••••••"
                required
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
            </div>
            <div className="action-buttons">
              <button type="submit" className="btn btn-primary">
                Create Account
              </button>
            </div>
          </form>
          <div className="back-link">
            Already have an account? <a href="/login">Sign In</a>
          </div>
          <div className="divider">
            <span className="secure-badge">
              <svg
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 2.18l6 2.25v4.66c0 3.99-2.53 7.74-6 8.71-3.47-.97-6-4.72-6-8.71V6.43l6-2.25z" />
              </svg>
              Secure Medical Assessment Portal
            </span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Signup;
