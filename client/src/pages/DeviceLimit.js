import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/SupabaseClient";
import "../styles/device-limit.css";

const DeviceLimit = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [devices, setDevices] = useState([]);
  const [alert, setAlert] = useState({ msg: "", type: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Device Limit – MedMinds";
    const isKicked = sessionStorage.getItem("mm_kicked") === "1";
    const pendingDevices = sessionStorage.getItem("mm_pending_devices");

    const init = async () => {
      if (isKicked) {
        sessionStorage.removeItem("mm_kicked");
        setMode("kicked");
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !pendingDevices) {
        navigate("/");
        return;
      }
      try {
        setDevices(JSON.parse(pendingDevices));
      } catch {
        setDevices([]);
      }
      setMode("limit");
    };
    init();
  }, [navigate]);

  const showAlert = (msg, type = "error") => setAlert({ msg, type });

  const logoutOtherDevices = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user)
        throw new Error("Session expired. Please login again.");

      await supabase.from("user_sessions").delete().eq("user_id", user.id);
      await supabase.auth.signOut({ scope: "others" });

      const token =
        "sess_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
      const ua = navigator.userAgent;
      const device = /mobile/i.test(ua)
        ? "Mobile"
        : /tablet/i.test(ua)
          ? "Tablet"
          : "Desktop";
      const browser = /chrome/i.test(ua)
        ? "Chrome"
        : /firefox/i.test(ua)
          ? "Firefox"
          : /safari/i.test(ua)
            ? "Safari"
            : /edge/i.test(ua)
              ? "Edge"
              : "Browser";

      localStorage.setItem("mm_session_token", token);
      await supabase.from("user_sessions").insert({
        user_id: user.id,
        session_token: token,
        device_info: `${device} / ${browser}`,
        last_active: new Date().toISOString(),
      });

      sessionStorage.removeItem("mm_pending_userid");
      sessionStorage.removeItem("mm_pending_devices");

      showAlert("✅ Other devices logged out! Redirecting...", "success");
      setTimeout(() => {
        const adminEmails = [
          "admin@medminds.com",
          "service.medminds@gmail.com",
        ];
        navigate(
          adminEmails.includes(user.email) ? "/admin" : "/quiz-selection",
        );
      }, 1200);
    } catch (e) {
      showAlert(e.message || "Error — please try again.");
      setLoading(false);
    }
  };

  const cancelAndGoBack = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("mm_session_token");
    sessionStorage.removeItem("mm_pending_userid");
    sessionStorage.removeItem("mm_pending_devices");
    navigate("/");
  };

  const deviceIcons = { Mobile: "📱", Tablet: "📟", Desktop: "💻" };
  const heading =
    mode === "kicked" ? "You Were Logged Out" : "Device Limit Reached";
  const subtitle =
    mode === "kicked" ? (
      "Another device logged into your account and you were logged out from this device."
    ) : mode === "limit" ? (
      <>
        Your account is already active on{" "}
        <strong>
          {devices.length} device{devices.length !== 1 ? "s" : ""}
        </strong>
        .<br />
        Logout those devices to continue here.
      </>
    ) : (
      "Loading..."
    );

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />
      <div className="card">
        <div className="icon-wrap" id="iconWrap">
          🔐
        </div>
        <h1 id="heading">{heading}</h1>
        <p className="subtitle" id="subtitle">
          {subtitle}
        </p>

        <div
          id="alertBox"
          className={`alert ${alert.type} ${alert.msg ? "show" : ""}`}
        >
          {alert.msg}
        </div>

        {mode === "limit" && (
          <div className="devices-box" id="devicesBox">
            <h3>⚠️ Currently Active Devices</h3>
            <div id="devicesList">
              {devices.length ? (
                devices.map((d, i) => {
                  const icon =
                    deviceIcons[d.device?.split("/")[0]?.trim()] || "💻";
                  const time = d.since
                    ? new Date(d.since).toLocaleString("en-PK", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Unknown time";
                  return (
                    <div className="device-item" key={i}>
                      <span className="device-icon">{icon}</span>
                      <div>
                        <div className="device-name">
                          {d.device || "Unknown Device"}
                        </div>
                        <div className="device-time">Logged in: {time}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="device-item">
                  <span className="device-icon">📱</span>
                  <div className="device-name">Active devices</div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="btn-group" id="btnGroup">
          {mode === "kicked" && (
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              → Go to Login
            </button>
          )}
          {mode === "limit" && (
            <>
              <button
                className="btn btn-danger"
                id="logoutBtn"
                disabled={loading}
                onClick={logoutOtherDevices}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Processing...
                  </>
                ) : (
                  "🚪 Logout Other Devices & Continue Here"
                )}
              </button>
              <button className="btn btn-secondary" onClick={cancelAndGoBack}>
                ← Cancel — Go Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DeviceLimit;
