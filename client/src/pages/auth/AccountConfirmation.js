import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const STYLE = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  --gradient-start: #0b63b7;
  --gradient-end: #0a4a8f;
  --accent-red: #ff6b6b;
  --success-green: #28a745;
}

.account-confirmation-root {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: var(--bg-secondary);
  min-height: 100vh;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirmation-wrapper {
  width: 100%;
  max-width: 500px;
  padding: 20px;
  margin: 0 auto;
}

.confirmation-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(11, 99, 183, 0.1);
  border: 1px solid var(--border-color);
  text-align: center;
}

.icon-box {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(11, 99, 183, 0.1) 0%, rgba(10, 74, 143, 0.05) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 40px;
  border: 2px solid rgba(11, 99, 183, 0.2);
}

.card-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--gradient-start);
  margin-bottom: 12px;
}

.card-header p {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 8px;
}

.email-display {
  background: var(--bg-secondary);
  padding: 12px 16px;
  border-radius: 6px;
  margin: 20px 0;
  font-weight: 600;
  color: var(--gradient-start);
  word-break: break-all;
  border: 1px solid var(--border-color);
}

.steps {
  text-align: left;
  background: linear-gradient(135deg, rgba(11, 99, 183, 0.05) 0%, rgba(10, 74, 143, 0.02) 100%);
  padding: 20px;
  border-radius: 8px;
  margin: 24px 0;
  border: 1px solid var(--border-color);
}

.step {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 13px;
  line-height: 1.6;
}

.step:last-child {
  margin-bottom: 0;
}

.step-number {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: var(--gradient-start);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
}

.step-text {
  color: var(--text-secondary);
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 28px;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
  color: white;
  box-shadow: 0 4px 12px rgba(11, 99, 183, 0.2);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(11, 99, 183, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--border-color);
}

.btn-secondary a {
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}

.timer {
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: 16px;
}

.timer strong {
  color: var(--gradient-start);
}

.alert {
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 13px;
  animation: slideDown 0.3s;
}

@keyframes slideDown {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.alert.success {
  background: rgba(40, 167, 69, 0.2);
  color: #155724;
  border-left: 4px solid var(--success-green);
}

.alert.error {
  background: rgba(220, 53, 69, 0.2);
  color: #721c24;
  border-left: 4px solid var(--accent-red);
}

.loading {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--gradient-start);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .confirmation-card {
    padding: 24px;
  }

  .card-header h1 {
    font-size: 20px;
  }

  .button-group {
    gap: 10px;
  }

  .btn {
    padding: 10px 16px;
    font-size: 13px;
  }
}
`;

function AccountConfirmation() {
  const navigate = useNavigate();
  const { email } = useParams();
  //   const [email, setEmail] = useState("loading...");
  const [alert, setAlert] = useState({ message: "", type: "error" });
  const [countdown, setCountdown] = useState(60);
  const [isCooldown, setIsCooldown] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabaseClientRef = useRef(null);
  const countdownRef = useRef(null);
  const alertTimerRef = useRef(null);
  console.log("acount confirm email", email);

  const showAlert = (message, type = "error") => {
    setAlert({ message, type });
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    alertTimerRef.current = window.setTimeout(() => {
      setAlert({ message: "", type: "error" });
    }, 5000);
  };

  const startResendCooldown = () => {
    setIsCooldown(true);
    setCountdown(60);
    if (countdownRef.current) clearInterval(countdownRef.current);

    countdownRef.current = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          clearInterval(countdownRef.current);
          setIsCooldown(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  };

  const resendEmail = async () => {
    if (!email) {
      showAlert("Email not found. Please go back and sign up again.", "error");
      return;
    }

    if (isCooldown || isSubmitting) return;
  };

  return (
    <div className="account-confirmation-root">
      <style>{STYLE}</style>
      <div className="confirmation-wrapper">
        <div className="confirmation-card">
          <div className="icon-box">✉️</div>
          <div className="card-header">
            <h1>Check Your Email</h1>
            <p>Account created successfully!</p>
          </div>

          <div
            id="alertBox"
            className={`alert ${alert.type}`}
            style={{ display: alert.message ? "block" : "none" }}
          >
            {alert.message}
          </div>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            We've sent a confirmation link to:
          </p>
          <div className="email-display" id="emailDisplay">
            {email}
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-text">
                Check your email inbox (and spam folder)
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-text">
                Click the confirmation link from MedMinds
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-text">
                You'll be redirected to batch enrollment
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-text">
                Complete your enrollment to access courses
              </div>
            </div>
          </div>

          <div className="button-group">
            <button
              id="resendBtn"
              className="btn btn-primary"
              type="button"
              disabled={isCooldown || isSubmitting}
              onClick={resendEmail}
            >
              {isSubmitting ? (
                <span className="loading" />
              ) : (
                <span id="resendText">📧 Resend Confirmation Email</span>
              )}
            </button>
            <button className="btn btn-secondary" type="button">
              <Link to="/login">← Back to Login</Link>
            </button>
          </div>

          <div className="timer">
            <p>
              Didn't receive the email? <strong>Check your spam folder</strong>{" "}
              {isCooldown ? (
                <strong id="resendCountdown">
                  wait <span id="countdown">{countdown}</span>s
                </strong>
              ) : null}
              to resend
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountConfirmation;
