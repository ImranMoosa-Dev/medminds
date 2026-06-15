import React from "react";
import AdminLayout from "../../components/layout/AdminLayout";

const AdminBatches = () => {
  // ── BATCHES ──────────────────────────────────────────────────────────────────
  function toggleAddBatchForm() {
    const f = document.getElementById("addBatchForm");
    f.style.display = f.style.display === "none" ? "block" : "none";
    if (f.style.display === "block")
      document.getElementById("batchName").focus();
  }
  // async function submitNewBatch(event) {
  //   event.preventDefault();
  //   try {
  //     const { error } = await supabaseClient.from("batches").insert([
  //       {
  //         name: document.getElementById("batchName").value,
  //         description: document.getElementById("batchDescription").value,
  //         academic_year:
  //           document.getElementById("batchAcademicYear").value || null,
  //         start_date: document.getElementById("batchStartDate").value || null,
  //         end_date: document.getElementById("batchEndDate").value || null,
  //         is_open: true,
  //       },
  //     ]);
  //     if (error) throw error;
  //     alert("✅ Batch created!");
  //     document.getElementById("addBatchForm").style.display = "none";
  //     event.target.reset();
  //     await loadAllBatches();
  //   } catch (e) {
  //     alert("Error: " + e.message);
  //   }
  // }

  // async function loadAllBatches() {
  //   const el = document.getElementById("batchesList");
  //   el.innerHTML = '<div class="no-data">Loading…</div>';
  //   try {
  //     const { data, error } = await supabaseClient
  //       .from("batches")
  //       .select("*")
  //       .order("created_at", { ascending: false });
  //     if (error) throw error;
  //     if (!data?.length) {
  //       el.innerHTML = '<div class="no-data">No batches yet</div>';
  //       return;
  //     }
  //     const withCounts = await Promise.all(
  //       data.map(async (b) => {
  //         const { count } = await supabaseClient
  //           .from("users")
  //           .select("id", { count: "exact", head: true })
  //           .eq("batch_id", b.id);
  //         return { ...b, student_count: count || 0 };
  //       }),
  //     );
  //     el.innerHTML = `<div class="batch-grid">${withCounts
  //       .map((b) => {
  //         const sc = b.is_open ? "#16a34a" : "#dc2626";
  //         const st = b.is_open ? "✅ Open" : "🔒 Closed";
  //         return `<div class="batch-card">
  //         <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;gap:8px">
  //           <div>
  //             <div style="font-size:16px;font-weight:700">${b.name}</div>
  //             <span class="pill" style="background:${sc}18;color:${sc};font-size:11px;margin-top:4px;display:inline-block">${st}${b.academic_year ? " · " + b.academic_year : ""}</span>
  //           </div>
  //           <div style="display:flex;gap:6px;flex-shrink:0">
  //             <button class="btn btn-xs" style="background:${b.is_open ? "var(--orange)" : "var(--green)"};color:#fff" onclick="toggleBatchOpen('${b.id}',${b.is_open},'${b.name.replace(/'/g, "\\'")}')">
  //               ${b.is_open ? "🔒" : "✅"}
  //             </button>
  //             <button class="btn btn-red btn-xs" onclick="deleteBatch('${b.id}','${b.name.replace(/'/g, "\\'")}')">🗑</button>
  //           </div>
  //         </div>
  //         <p style="font-size:13px;color:var(--muted);margin-bottom:12px">${b.description || "No description"}</p>
  //         <div style="background:#f9f9f9;padding:10px;border-radius:8px;margin-bottom:12px">
  //           <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px">
  //             <span>Students</span><span style="font-weight:700;color:var(--blue)">${b.student_count}</span>
  //           </div>
  //           <div style="height:5px;background:#e0e0e0;border-radius:3px;overflow:hidden">
  //             <div style="height:100%;width:${Math.min(b.student_count * 4, 100)}%;background:linear-gradient(90deg,var(--blue),var(--blue-mid))"></div>
  //           </div>
  //         </div>
  //         <button class="btn btn-gray btn-sm" onclick="expandBatchDetails('${b.id}')">👥 View Students</button>
  //         <div id="bdet-${b.id}" style="display:none;margin-top:12px;border-top:1px solid var(--border);padding-top:10px">
  //           <div id="bstu-${b.id}" style="max-height:250px;overflow-y:auto"><div class="no-data">Loading…</div></div>
  //         </div>
  //       </div>`;
  //       })
  //       .join("")}</div>`;
  //   } catch (e) {
  //     el.innerHTML = `<div class="no-data" style="color:var(--red)">Error: ${e.message}</div>`;
  //   }
  // }

  // async function expandBatchDetails(id) {
  //   const wrap = document.getElementById(`bdet-${id}`);
  //   if (wrap.style.display === "block") {
  //     wrap.style.display = "none";
  //     return;
  //   }
  //   wrap.style.display = "block";
  //   const el = document.getElementById(`bstu-${id}`);
  //   try {
  //     const { data, error } = await supabaseClient
  //       .from("users")
  //       .select("*")
  //       .eq("batch_id", id);
  //     if (error) throw error;
  //     if (!data?.length) {
  //       el.innerHTML = '<div class="no-data">No students enrolled</div>';
  //       return;
  //     }
  //     el.innerHTML = data
  //       .map(
  //         (u) => `
  //       <div style="background:#f9f9f9;padding:8px 10px;border-radius:6px;border-left:3px solid var(--blue);font-size:12px;margin-bottom:6px">
  //         <strong>${((u.first_name || "") + " " + (u.last_name || "")).trim() || "N/A"}</strong>
  //         <div style="color:var(--muted)">${u.email}</div>
  //         <div style="color:#9ca3af;font-size:11px">${u.district || "N/A"}</div>
  //       </div>`,
  //       )
  //       .join("");
  //   } catch (e) {
  //     el.innerHTML = `<div class="no-data" style="color:var(--red)">${e.message}</div>`;
  //   }
  // }

  // async function deleteBatch(id, name) {
  //   if (!confirm(`Delete batch "${name}"? Students will be unassigned.`)) return;
  //   try {
  //     await supabaseClient
  //       .from("users")
  //       .update({ batch_id: null })
  //       .eq("batch_id", id);
  //     const { error } = await supabaseClient
  //       .from("batches")
  //       .delete()
  //       .eq("id", id);
  //     if (error) throw error;
  //     alert("✅ Batch deleted");
  //     await loadAllBatches();
  //   } catch (e) {
  //     alert("Error: " + e.message);
  //   }
  // }

  // async function toggleBatchOpen(id, current, name) {
  //   const newState = !current;
  //   if (!confirm(`${newState ? "Open" : "Close"} batch "${name}"?`)) return;
  //   try {
  //     const { error } = await supabaseClient
  //       .from("batches")
  //       .update({ is_open: newState })
  //       .eq("id", id);
  //     if (error) throw error;
  //     await loadAllBatches();
  //   } catch (e) {
  //     alert("Error: " + e.message);
  //   }
  // }

  // ── BATCH SCHEDULE UPLOAD ────────────────────────────────────────────────────
  // async function loadScheduleBatchSelect() {
  //   const sel = document.getElementById("scheduleBatchSelect");
  //   if (!sel) return;
  //   try {
  //     const { data } = await supabaseClient
  //       .from("batches")
  //       .select("id, name")
  //       .order("name");
  //     sel.innerHTML =
  //       '<option value="">— Choose a batch —</option>' +
  //       (data || [])
  //         .map((b) => `<option value="${b.id}">${b.name}</option>`)
  //         .join("");
  //   } catch (e) {
  //     console.error("loadScheduleBatchSelect:", e);
  //   }
  // }
  return (
    <AdminLayout>
      {/* ══ BATCHES ══ */}
      <div id="batches" className="tab-panel">
        <div className="sec-hdr">
          <h2 className="sec-title">🗂 Batch Management</h2>
          <button
            className="btn btn-blue"
            // onClick={() => call("toggleAddBatchForm")}
          >
            + Create Batch
          </button>
        </div>
        <div id="addBatchForm" className="form-box" style={{ display: "none" }}>
          <h3>➕ Create New Batch</h3>
          {/* <form onSubmit={(e) => call("submitNewBatch", e)}> */}
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-row">
              <div className="fg">
                <label>Batch Name *</label>
                <input
                  type="text"
                  id="batchName"
                  placeholder="e.g. MDCAT 2026 Batch A"
                  required
                />
              </div>
              <div className="fg">
                <label>Academic Year *</label>
                <input
                  type="text"
                  id="batchAcademicYear"
                  placeholder="2025-2026"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="fg">
                <label>Start Date</label>
                <input type="date" id="batchStartDate" />
              </div>
              <div className="fg">
                <label>End Date</label>
                <input type="date" id="batchEndDate" />
              </div>
            </div>
            <div className="fg">
              <label>Description</label>
              <textarea
                id="batchDescription"
                placeholder="Brief description"
              ></textarea>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-gray"
                // onClick={() => call("toggleAddBatchForm")}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-blue">
                Create Batch
              </button>
            </div>
          </form>
        </div>
        <div id="batchesList"></div>

        <div className="sec-hdr" style={{ marginTop: "32px" }}>
          <h2 className="sec-title">📅 Batch Test Schedule</h2>
        </div>
        <div className="form-box" style={{ marginBottom: 0 }}>
          <h3>📂 Upload Schedule via CSV</h3>
          <p
            style={{
              fontSize: "13px",
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
              <select id="scheduleBatchSelect" defaultValue="">
                <option value="">— Choose a batch —</option>
              </select>
            </div>
          </div>
          <div
            id="scheduleDropZone"
            style={{
              border: "2px dashed var(--border)",
              borderRadius: "10px",
              padding: "28px",
              textAlign: "center",
              cursor: "pointer",
              transition: "border-color 0.2s",
              marginBottom: "14px",
            }}
            onClick={() => document.getElementById("scheduleCsvInput").click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = "var(--blue)";
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
            }}
            // onDrop={(e) => call("handleScheduleDrop", e)}
          >
            <input
              type="file"
              id="scheduleCsvInput"
              accept=".csv"
              style={{ display: "none" }}
              // onChange={(e) => call("handleSchedulePreview", e)}
            />
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📄</div>
            <div style={{ fontSize: "13px", color: "var(--muted)" }}>
              <strong style={{ color: "var(--blue)" }}>Click to browse</strong>{" "}
              or drag &amp; drop a CSV file
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--muted)",
                marginTop: "6px",
              }}
            >
              Columns: test_no · date · day · subject · chapter
            </div>
          </div>
          <div
            id="schedulePreviewInfo"
            style={{
              display: "none",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "14px",
              alignItems: "center",
              gap: "12px",
              flexDirection: "row",
            }}
          >
            <span style={{ fontSize: "20px" }}>✅</span>
            <div style={{ flex: 1 }}>
              <div
                id="scheduleRowCount"
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "var(--green)",
                }}
              >
                0 rows
              </div>
              <div
                id="scheduleCsvName"
                style={{ fontSize: "11px", color: "var(--muted)" }}
              ></div>
            </div>
            <button
              // onClick={() => call("clearScheduleCsv")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
                fontSize: "20px",
                padding: "2px",
              }}
              title="Remove"
            >
              ✕
            </button>
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn btn-gray btn-sm"
              // onClick={() => call("downloadScheduleTemplate")}
            >
              ⬇ Download Template
            </button>
            <button
              id="scheduleUploadBtn"
              className="btn btn-blue"
              // onClick={() => call("uploadSchedule")}
              disabled
            >
              ⬆ Upload Schedule
            </button>
            <span
              id="scheduleUploadStatus"
              style={{ fontSize: "12px", color: "var(--muted)" }}
            ></span>
          </div>
          <div
            id="schedulePreviewTable"
            style={{
              marginTop: "18px",
              display: "none",
              overflowX: "auto",
              maxHeight: "300px",
            }}
          ></div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBatches;
