import React from "react";

const AdminNotifications = () => {
  return (
    <div>
      {/* ══ NOTIFICATIONS ══ */}
      <div id="notifications" className="tab-panel">
        <div className="sec-hdr">
          <h2 className="sec-title">🔔 Notifications</h2>
          <button
            className="btn btn-blue"
            onClick={() => call("toggleNotificationForm")}
          >
            + New Notification
          </button>
        </div>
        <div
          id="notificationForm"
          className="form-box"
          style={{ display: "none" }}
        >
          <h3>📢 Send Update to Students</h3>
          <form onSubmit={(e) => call("sendBulkNotification", e)}>
            <div className="form-row">
              <div className="fg">
                <label>Recipients *</label>
                <select
                  id="recipientType"
                  onChange={() => call("updateRecipientOptions")}
                  required
                  defaultValue=""
                >
                  <option value="">— Choose —</option>
                  <option value="all">All Students</option>
                  <option value="batch">Specific Batch</option>
                </select>
              </div>
              <div
                className="fg"
                id="batchSelectorWrap"
                style={{ display: "none" }}
              >
                <label>Batch *</label>
                <select id="notificationBatch" defaultValue="">
                  <option value="">— Choose Batch —</option>
                </select>
              </div>
            </div>
            <div className="fg">
              <label>Subject *</label>
              <input
                type="text"
                id="notificationSubject"
                placeholder="e.g. New Quiz Available"
                required
              />
            </div>
            <div className="fg">
              <label>Message *</label>
              <textarea
                id="notificationMessage"
                placeholder="Enter message…"
                required
                style={{ minHeight: "120px" }}
              ></textarea>
            </div>
            <div className="fg">
              <label>
                <input
                  type="checkbox"
                  id="scheduleNotification"
                  onChange={() => call("toggleScheduleTime")}
                />{" "}
                Schedule for later
              </label>
              <input
                type="datetime-local"
                id="notificationScheduleTime"
                style={{ display: "none", marginTop: "8px" }}
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-gray"
                onClick={() => call("toggleNotificationForm")}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-blue">
                Send Notification
              </button>
            </div>
          </form>
        </div>
        <div id="notificationHistory"></div>
      </div>
    </div>
  );
};

export default AdminNotifications;
