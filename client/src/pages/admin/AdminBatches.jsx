import React, { useEffect, useState, useRef } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import axios from "../../utils/AxiosConfig";
import "../../styles/admin.css";

const BASE = process.env.REACT_APP_BASEURL;

const AdminBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [newBatch, setNewBatch] = useState({
    name: "",
    academicYear: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [scheduleBatchId, setScheduleBatchId] = useState("");
  const [scheduleCsvRows, setScheduleCsvRows] = useState([]);
  const [scheduleCsvFileName, setScheduleCsvFileName] = useState("");
  const [schedulePreviewVisible, setSchedulePreviewVisible] = useState(false);
  const [scheduleUploading, setScheduleUploading] = useState(false);
  const [scheduleStatus, setScheduleStatus] = useState("");
  const [scheduleDragOver, setScheduleDragOver] = useState(false);
  const [expandedBatchId, setExpandedBatchId] = useState(null);
  const [batchStudents, setBatchStudents] = useState({});

  const scheduleCsvRef = useRef(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${BASE}/api/v1/batches/all`);
      setBatches(Array.isArray(data) ? data : data?.batches || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  const toggleCreateForm = () => {
    setShowCreateForm((prev) => !prev);
  };

  const handleNewBatchChange = (e) => {
    const { name, value } = e.target;
    setNewBatch((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setCreateSubmitting(true);
    try {
      await axios.post(`${BASE}/api/v1/batches/create`, {
        name: newBatch.name,
        academicYear: newBatch.academicYear,
        startDate: newBatch.startDate || null,
        endDate: newBatch.endDate || null,
        description: newBatch.description,
      });
      setShowCreateForm(false);
      setNewBatch({ name: "", academicYear: "", startDate: "", endDate: "", description: "" });
      await fetchBatches();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to create batch");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleToggleOpen = async (batchId, currentOpen, name) => {
    if (!window.confirm(`${currentOpen ? "Close" : "Open"} batch "${name}"?`)) return;
    try {
      await axios.post(`${BASE}/api/v1/batches/toggle-open/${batchId}`);
      await fetchBatches();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to toggle batch");
    }
  };

  const handleDelete = async (batchId, name) => {
    if (!window.confirm(`Delete batch "${name}"? Students will be unassigned.`)) return;
    try {
      await axios.delete(`${BASE}/api/v1/batches/${batchId}`);
      await fetchBatches();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to delete batch");
    }
  };

  const handleViewStudents = async (batchId) => {
    if (expandedBatchId === batchId) {
      setExpandedBatchId(null);
      return;
    }
    setExpandedBatchId(batchId);
    if (batchStudents[batchId]) return;
    try {
      const { data } = await axios.get(`${BASE}/api/v1/batches/${batchId}/students`);
      setBatchStudents((prev) => ({
        ...prev,
        [batchId]: Array.isArray(data) ? data : data?.students || [],
      }));
    } catch (err) {
      setBatchStudents((prev) => ({
        ...prev,
        [batchId]: [],
      }));
    }
  };

  const handleScheduleCsvChange = (e) => {
    const file = e.target.files?.[0];
    if (file) parseScheduleCsv(file);
  };

  const handleScheduleDrop = (e) => {
    e.preventDefault();
    setScheduleDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) parseScheduleCsv(file);
  };

  const parseScheduleCsv = (file) => {
    if (!file || !file.name.endsWith(".csv")) {
      alert("Please select a CSV file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (!text) return;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) {
        alert("CSV must have a header row and at least one data row.");
        return;
      }
      const rows = lines.slice(1).map((line, i) => {
        const cols = line.split(",").map((c) => c.trim());
        return {
          id: i + 1,
          test_no: cols[0] || "",
          date: cols[1] || "",
          day: cols[2] || "",
          subject: cols[3] || "",
          chapter: cols[4] || "",
        };
      });
      setScheduleCsvRows(rows);
      setScheduleCsvFileName(file.name);
      setSchedulePreviewVisible(true);
      setScheduleStatus("");
    };
    reader.readAsText(file);
  };

  const clearScheduleCsv = () => {
    setScheduleCsvRows([]);
    setScheduleCsvFileName("");
    setSchedulePreviewVisible(false);
    setScheduleStatus("");
    if (scheduleCsvRef.current) scheduleCsvRef.current.value = "";
  };

  const uploadSchedule = async () => {
    if (!scheduleBatchId) {
      alert("Please select a batch.");
      return;
    }
    if (!scheduleCsvRows.length) {
      alert("Please select a CSV file.");
      return;
    }
    setScheduleUploading(true);
    setScheduleStatus("Uploading...");
    try {
      await axios.post(`${BASE}/api/v1/batches/schedule/upload`, {
        batchId: scheduleBatchId,
        rows: scheduleCsvRows,
      });
      setScheduleStatus("Schedule uploaded successfully!");
      clearScheduleCsv();
    } catch (err) {
      setScheduleStatus(err.response?.data?.message || err.message || "Upload failed");
    } finally {
      setScheduleUploading(false);
    }
  };

  const downloadTemplate = () => {
    const header = "test_no,date,day,subject,chapter";
    const sample = "1,2025-01-15,Wednesday,Physics,Kinematics";
    const blob = new Blob([header + "\n" + sample], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="sec-hdr">
        <h2 className="sec-title">Batch Management</h2>
        <button className="btn btn-blue" onClick={toggleCreateForm}>
          + Create Batch
        </button>
      </div>

      {showCreateForm && (
        <div className="form-box" style={{ marginBottom: 24 }}>
          <h3>Create New Batch</h3>
          <form onSubmit={handleCreateBatch}>
            <div className="form-row">
              <div className="fg">
                <label>Batch Name *</label>
                <input
                  type="text"
                  name="name"
                  value={newBatch.name}
                  onChange={handleNewBatchChange}
                  placeholder="e.g. MDCAT 2026 Batch A"
                  required
                />
              </div>
              <div className="fg">
                <label>Academic Year *</label>
                <input
                  type="text"
                  name="academicYear"
                  value={newBatch.academicYear}
                  onChange={handleNewBatchChange}
                  placeholder="2025-2026"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="fg">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={newBatch.startDate}
                  onChange={handleNewBatchChange}
                />
              </div>
              <div className="fg">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={newBatch.endDate}
                  onChange={handleNewBatchChange}
                />
              </div>
            </div>
            <div className="fg">
              <label>Description</label>
              <textarea
                name="description"
                value={newBatch.description}
                onChange={handleNewBatchChange}
                placeholder="Brief description"
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-gray" onClick={toggleCreateForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-blue" disabled={createSubmitting}>
                {createSubmitting ? "Creating..." : "Create Batch"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="shimmer" style={{ marginBottom: 16 }} />
      ) : error ? (
        <div className="no-data" style={{ color: "var(--red)" }}>
          {error}
        </div>
      ) : batches.length === 0 ? (
        <div className="no-data">No batches yet</div>
      ) : (
        <div className="batch-grid">
          {batches.map((batch) => {
            const isOpen = batch.is_open;
            const studentCount = batch.student_count || batch.studentCount || 0;
            const barWidth = Math.min(studentCount * 4, 100);
            return (
              <div className="batch-card" key={batch._id || batch.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                    gap: 8,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>
                      {batch.name}
                    </div>
                    <span
                      className={`pill ${isOpen ? "pill-green" : "pill-orange"}`}
                      style={{ marginTop: 4, display: "inline-block" }}
                    >
                      {isOpen ? "Open" : "Closed"}
                      {batch.academicYear || batch.academicYear
                        ? ` \u00b7 ${batch.academicYear || batch.academicYear}`
                        : ""}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      className={`btn btn-sm ${isOpen ? "btn-orange" : "btn-green"}`}
                      onClick={() =>
                        handleToggleOpen(
                          batch._id || batch.id,
                          isOpen,
                          batch.name
                        )
                      }
                      title={isOpen ? "Close batch" : "Open batch"}
                    >
                      {isOpen ? "Close" : "Open"}
                    </button>
                    <button
                      className="btn btn-red btn-sm"
                      onClick={() =>
                        handleDelete(batch._id || batch.id, batch.name)
                      }
                      title="Delete batch"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
                  {batch.description || "No description"}
                </p>
                <div
                  style={{
                    background: "#f9f9f9",
                    padding: 10,
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      marginBottom: 6,
                    }}
                  >
                    <span>Students</span>
                    <span style={{ fontWeight: 700, color: "var(--blue)" }}>
                      {studentCount}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 5,
                      background: "#e0e0e0",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${barWidth}%`,
                        background:
                          "linear-gradient(90deg,var(--blue),var(--blue-mid))",
                      }}
                    />
                  </div>
                </div>
                <button
                  className="btn btn-gray btn-sm"
                  onClick={() => handleViewStudents(batch._id || batch.id)}
                >
                  {expandedBatchId === (batch._id || batch.id)
                    ? "Hide Students"
                    : "View Students"}
                </button>
                {expandedBatchId === (batch._id || batch.id) && (
                  <div
                    style={{
                      marginTop: 12,
                      borderTop: "1px solid var(--border)",
                      paddingTop: 10,
                      maxHeight: 250,
                      overflowY: "auto",
                    }}
                  >
                    {!batchStudents[batch._id || batch.id] ? (
                      <div className="no-data">Loading...</div>
                    ) : batchStudents[batch._id || batch.id].length === 0 ? (
                      <div className="no-data">No students enrolled</div>
                    ) : (
                      batchStudents[batch._id || batch.id].map((stu) => (
                        <div
                          key={stu._id || stu.id || stu.email}
                          style={{
                            background: "#f9f9f9",
                            padding: "8px 10px",
                            borderRadius: 6,
                            borderLeft: "3px solid var(--blue)",
                            fontSize: 12,
                            marginBottom: 6,
                          }}
                        >
                          <strong>
                            {[stu.first_name, stu.lastName]
                              .filter(Boolean)
                              .join(" ") || stu.name || "N/A"}
                          </strong>
                          <div style={{ color: "var(--muted)" }}>{stu.email}</div>
                          <div style={{ color: "#9ca3af", fontSize: 11 }}>
                            {stu.district || "N/A"}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="sec-hdr" style={{ marginTop: 32 }}>
        <h2 className="sec-title">Batch Test Schedule</h2>
      </div>
      <div className="form-box" style={{ marginBottom: 0 }}>
        <h3>Upload Schedule via CSV</h3>
        <p
          style={{
            fontSize: 13,
            color: "var(--muted)",
            margin: "8px 0 18px",
          }}
        >
          Upload a CSV with columns:{" "}
          <strong>test_no, date, day, subject, chapter</strong>. This will
          replace the existing schedule for the selected batch.
        </p>
        <div className="form-row">
          <div className="fg">
            <label>Select Batch *</label>
            <select
              value={scheduleBatchId}
              onChange={(e) => setScheduleBatchId(e.target.value)}
            >
              <option value="">Choose a batch</option>
              {batches.map((b) => (
                <option key={b._id || b.id} value={b._id || b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          className={`csv-zone ${scheduleDragOver ? "csv-zone-dragover" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setScheduleDragOver(true);
          }}
          onDragLeave={() => setScheduleDragOver(false)}
          onDrop={handleScheduleDrop}
          style={{
            borderColor: scheduleDragOver ? "var(--blue)" : undefined,
            background: scheduleDragOver ? "#e4f0ff" : undefined,
          }}
        >
          <div className="csv-zone-header">
            <span className="csv-zone-label">CSV File</span>
          </div>
          <div
            className="csv-drop-area"
            onClick={() => scheduleCsvRef.current?.click()}
          >
            <div className="csv-drop-icon">📄</div>
            <div className="csv-drop-text">
              <strong>Click to browse</strong> or drag & drop a CSV file
            </div>
            <div className="csv-hint">
              Columns: test_no · date · day · subject · chapter
            </div>
            <input
              ref={scheduleCsvRef}
              type="file"
              accept=".csv"
              className="csv-file-input"
              style={{ display: "none" }}
              onChange={handleScheduleCsvChange}
            />
          </div>

          {schedulePreviewVisible && (
            <div className="csv-preview show">
              <span className="csv-preview-icon">✅</span>
              <div className="csv-preview-info">
                <div className="csv-count">{scheduleCsvRows.length} rows</div>
                <div className="csv-fname">{scheduleCsvFileName}</div>
              </div>
              <button
                className="csv-clear"
                onClick={clearScheduleCsv}
                title="Remove"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button className="btn btn-gray btn-sm" onClick={downloadTemplate}>
            Download Template
          </button>
          <button
            className="btn btn-blue"
            onClick={uploadSchedule}
            disabled={
              scheduleUploading || !scheduleBatchId || !scheduleCsvRows.length
            }
          >
            {scheduleUploading ? "Uploading..." : "Upload Schedule"}
          </button>
          {scheduleStatus && (
            <span style={{ fontSize: 12, color: "var(--muted)" }}>
              {scheduleStatus}
            </span>
          )}
        </div>

        {schedulePreviewVisible && scheduleCsvRows.length > 0 && (
          <div
            style={{
              marginTop: 18,
              overflowX: "auto",
              maxHeight: 300,
            }}
          >
            <table className="tbl">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Test No</th>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Subject</th>
                  <th>Chapter</th>
                </tr>
              </thead>
              <tbody>
                {scheduleCsvRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.test_no}</td>
                    <td>{row.date}</td>
                    <td>{row.day}</td>
                    <td>{row.subject}</td>
                    <td>{row.chapter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBatches;
