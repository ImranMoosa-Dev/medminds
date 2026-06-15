import React, { useEffect, useState, useRef } from "react";
import axios from "../../utils/AxiosConfig";
import "../../styles/admin.css";

const AdminNotifications = () => {
  const [showForm, setShowForm] = useState(false);
  const [recipientType, setRecipientType] = useState("");
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [scheduled, setScheduled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const { data } = await axios.get("/api/v1/batches/all");
        setBatches(data.batches || data || []);
      } catch {
        setBatches([]);
      }
    };
    loadBatches();
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const { data } = await axios.get("/api/v1/notifications/history");
        setHistory(data.notifications || data || []);
      } catch {
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setSendError("");
    setSending(true);

    const payload = {
      recipientType,
      subject,
      message,
    };
    if (recipientType === "batch") payload.batchId = selectedBatch;
    if (scheduled) payload.scheduleTime = scheduleTime;

    try {
      await axios.post("/api/v1/notifications/send", payload);
      setShowForm(false);
      setRecipientType("");
      setSelectedBatch("");
      setSubject("");
      setMessage("");
      setScheduled(false);
      setScheduleTime("");
      const { data } = await axios.get("/api/v1/notifications/history");
      setHistory(data.notifications || data || []);
    } catch (err) {
      setSendError(
        err.response?.data?.message || "Failed to send notification"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div id="notifications" className="tab-panel">
        <div className="sec-hdr">
          <h2 className="sec-title">🔔 Notifications</h2>
          <button
            className="btn btn-blue"
            onClick={() => setShowForm(!showForm)}
          >
            + New Notification
          </button>
        </div>

        {showForm && (
          <div className="form-box">
            <h3>📢 Send Update to Students</h3>
            <form onSubmit={handleSend}>
              <div className="form-row">
                <div className="fg">
                  <label>Recipients *</label>
                  <select
                    value={recipientType}
                    onChange={(e) => setRecipientType(e.target.value)}
                    required
                  >
                    <option value="">— Choose —</option>
                    <option value="all">All Students</option>
                    <option value="batch">Specific Batch</option>
                  </select>
                </div>
                {recipientType === "batch" && (
                  <div className="fg">
                    <label>Batch *</label>
                    <select
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                    >
                      <option value="">— Choose Batch —</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="fg">
                <label>Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
              <div className="fg">
                <label>Message *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  style={{ minHeight: "120px" }}
                />
              </div>
              <div className="fg">
                <label>
                  <input
                    type="checkbox"
                    checked={scheduled}
                    onChange={(e) => setScheduled(e.target.checked)}
                  />{" "}
                  Schedule for later
                </label>
                {scheduled && (
                  <input
                    type="datetime-local"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    style={{ marginTop: "8px" }}
                  />
                )}
              </div>
              {sendError && (
                <div className="no-data" style={{ color: "var(--red)" }}>
                  {sendError}
                </div>
              )}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-gray"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-blue"
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Send Notification"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div id="notificationHistory">
          {historyLoading ? (
            <div className="no-data">Loading...</div>
          ) : history.length === 0 ? (
            <div className="no-data">No notifications sent yet</div>
          ) : (
            history.map((item) => (
              <div className="notification-item" key={item.id}>
                <strong>{item.subject}</strong>
                <p>{item.message}</p>
                <small>{new Date(item.created_at).toLocaleString()}</small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
