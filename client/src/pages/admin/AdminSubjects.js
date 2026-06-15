import React from "react";

const AdminSubjects = () => {
  return (
    <div>
      {/* ══ SUBJECTS ══ */}
      <div id="subjects" className="tab-panel">
        <div className="sec-hdr">
          <h2 className="sec-title">📚 Subjects</h2>
          <button
            className="btn btn-blue btn-sm"
            onClick={() => call("openAddSubjectModal")}
          >
            ＋ Add Subject
          </button>
        </div>

        <div
          className="stats-grid"
          style={{ marginBottom: "20px" }}
          id="subjectStatsGrid"
        >
          <div className="stat-box">
            <div className="stat-label">Total Subjects</div>
            <div id="subjTotalCount" className="stat-num">
              —
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Total Questions Tagged</div>
            <div id="subjTotalTagged" className="stat-num">
              —
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Untagged Questions</div>
            <div id="subjUntagged" className="stat-num">
              —
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
            gap: "14px",
            marginBottom: "24px",
          }}
          id="subjectStatsCards"
        ></div>

        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "24px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "18px",
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: "'Merriweather',serif",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--text)",
                }}
              >
                📖 Topics & Subtopics Manager
              </h3>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--muted)",
                  marginTop: "3px",
                }}
              >
                Manage topics and subtopics for each subject
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <select
                id="topicSubjectFilter"
                onChange={() => call("loadTopicsAdmin")}
                style={{
                  padding: "8px 12px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontFamily: "'DM Sans',sans-serif",
                }}
                defaultValue=""
              >
                <option value="">All Subjects</option>
              </select>
              <button
                onClick={() => call("openAddTopicModal")}
                style={{
                  background: "var(--blue-main)",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                + Add Topic
              </button>
            </div>
          </div>

          <div id="topicsAdminList">
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "var(--muted)",
              }}
            >
              Loading topics…
            </div>
          </div>
        </div>

        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "24px",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              fontFamily: "'Merriweather',serif",
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: "6px",
            }}
          >
            📥 Upload Questions with Topics/Subtopics
          </h3>
          <p
            style={{
              fontSize: "12px",
              color: "var(--muted)",
              marginBottom: "16px",
            }}
          >
            CSV columns:{" "}
            <strong>
              question, option_a, option_b, option_c, option_d, correct_answer,
              explanation, subject, topic, subtopic
            </strong>
          </p>

          <div style={{ marginBottom: "14px" }}>
            <label
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--text)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Assign to Quiz (optional)
            </label>
            <select
              id="topicCsvQuizId"
              style={{
                width: "100%",
                maxWidth: "340px",
                padding: "9px 12px",
                border: "1.5px solid var(--border)",
                borderRadius: "8px",
                fontSize: "13px",
                background: "var(--bg)",
                color: "var(--text)",
                fontFamily: "'DM Sans',sans-serif",
              }}
              defaultValue=""
            >
              <option value="">— No quiz (question bank only) —</option>
            </select>
          </div>

          <div
            id="topicCsvDropzone"
            style={{
              border: "2px dashed var(--border)",
              borderRadius: "10px",
              padding: "28px",
              textAlign: "center",
              cursor: "pointer",
              transition: "border-color .2s",
              background: "var(--bg)",
            }}
            onClick={() => document.getElementById("topicCsvInput").click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = "var(--blue-main)";
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
            }}
            onDrop={(e) => call("handleTopicCsvDrop", e)}
          >
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>📄</div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--text)",
              }}
            >
              Drop CSV here or click to browse
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                marginTop: "4px",
              }}
            >
              Columns: question · option_a–d · correct_answer · explanation ·
              subject · topic · subtopic
            </div>
          </div>
          <input
            type="file"
            id="topicCsvInput"
            accept=".csv"
            style={{ display: "none" }}
            onChange={(e) => call("handleTopicCsvFile", e.target.files[0])}
          />

          <div
            id="topicCsvPreview"
            style={{ display: "none", marginTop: "14px" }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: "8px",
              }}
              id="topicCsvInfo"
            ></div>
            <div
              id="topicCsvTable"
              style={{
                overflowX: "auto",
                maxHeight: "240px",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            ></div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => call("uploadTopicCsv")}
                id="uploadTopicCsvBtn"
                style={{
                  background: "var(--green)",
                  color: "white",
                  border: "none",
                  padding: "9px 20px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                ⬆️ Upload Questions
              </button>
              <button
                onClick={() => call("clearTopicCsv")}
                style={{
                  background: "var(--bg)",
                  color: "var(--muted)",
                  border: "1.5px solid var(--border)",
                  padding: "9px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                Clear
              </button>
            </div>
            <div
              id="topicCsvStatus"
              style={{
                marginTop: "10px",
                fontSize: "13px",
                fontWeight: 600,
              }}
            ></div>
          </div>
        </div>

        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "18px",
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: "'Merriweather',serif",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--text)",
                }}
              >
                🔍 Question Bank Browser
              </h3>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--muted)",
                  marginTop: "3px",
                }}
              >
                Browse questions by subject, topic, and subtopic
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <select
                id="qbSubject"
                onChange={() => call("loadQbTopics")}
                style={{
                  padding: "7px 10px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontFamily: "'DM Sans',sans-serif",
                }}
                defaultValue=""
              >
                <option value="">All Subjects</option>
              </select>
              <select
                id="qbTopic"
                onChange={() => call("loadQbSubtopics")}
                style={{
                  padding: "7px 10px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontFamily: "'DM Sans',sans-serif",
                }}
                defaultValue=""
              >
                <option value="">All Topics</option>
              </select>
              <select
                id="qbSubtopic"
                onChange={() => call("loadQbQuestions")}
                style={{
                  padding: "7px 10px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontFamily: "'DM Sans',sans-serif",
                }}
                defaultValue=""
              >
                <option value="">All Subtopics</option>
              </select>
              <button
                onClick={() => call("loadQbQuestions")}
                style={{
                  background: "var(--blue-main)",
                  color: "white",
                  border: "none",
                  padding: "7px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                Browse
              </button>
            </div>
          </div>

          <div
            id="qbStats"
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "14px",
            }}
          ></div>
          <div
            id="qbResults"
            style={{ fontSize: "13px", color: "var(--muted)" }}
          >
            Select filters above to browse questions.
          </div>
        </div>

        {/* TOPIC MODAL */}
        <div
          id="topicModal"
          style={{
            display: "none",
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            zIndex: 1000,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "var(--card)",
              borderRadius: "var(--radius)",
              padding: "28px",
              width: "100%",
              maxWidth: "440px",
              margin: "20px",
              boxShadow: "0 20px 60px rgba(0,0,0,.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Merriweather',serif",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
                id="topicModalTitle"
              >
                Add Topic
              </h3>
              <button
                onClick={() => call("closeTopicModal")}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "var(--muted)",
                }}
              >
                ✕
              </button>
            </div>
            <input type="hidden" id="topicEditId" />
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: ".5px",
                }}
              >
                Subject *
              </label>
              <select
                id="topicSubject"
                style={{
                  width: "100%",
                  marginTop: "5px",
                  padding: "9px 12px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontFamily: "'DM Sans',sans-serif",
                }}
                onChange={() => call("loadSubtopicSubjectSelect")}
                defaultValue=""
              >
                <option value="">Select subject…</option>
              </select>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: ".5px",
                }}
              >
                Topic Name *
              </label>
              <input
                type="text"
                id="topicName"
                placeholder="e.g. Bioenergetics"
                style={{
                  width: "100%",
                  marginTop: "5px",
                  padding: "9px 12px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              />
            </div>
            <div
              id="topicModalAlert"
              style={{
                display: "none",
                background: "var(--red-bg)",
                color: "var(--red)",
                padding: "10px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                marginBottom: "12px",
              }}
            ></div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => call("closeTopicModal")}
                style={{
                  background: "var(--bg)",
                  color: "var(--muted)",
                  border: "1.5px solid var(--border)",
                  padding: "9px 18px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                id="saveTopicBtn"
                onClick={() => call("saveTopic")}
                style={{
                  background: "var(--blue-main)",
                  color: "white",
                  border: "none",
                  padding: "9px 20px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                Save Topic
              </button>
            </div>
          </div>
        </div>

        {/* SUBTOPIC MODAL */}
        <div
          id="subtopicModal"
          style={{
            display: "none",
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            zIndex: 1000,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "var(--card)",
              borderRadius: "var(--radius)",
              padding: "28px",
              width: "100%",
              maxWidth: "440px",
              margin: "20px",
              boxShadow: "0 20px 60px rgba(0,0,0,.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Merriweather',serif",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
                id="subtopicModalTitle"
              >
                Add Subtopic
              </h3>
              <button
                onClick={() => call("closeSubtopicModal")}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "var(--muted)",
                }}
              >
                ✕
              </button>
            </div>
            <input type="hidden" id="subtopicEditId" />
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: ".5px",
                }}
              >
                Topic *
              </label>
              <select
                id="subtopicTopic"
                style={{
                  width: "100%",
                  marginTop: "5px",
                  padding: "9px 12px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontFamily: "'DM Sans',sans-serif",
                }}
                defaultValue=""
              >
                <option value="">Select topic…</option>
              </select>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: ".5px",
                }}
              >
                Subtopic Name *
              </label>
              <input
                type="text"
                id="subtopicName"
                placeholder="e.g. Krebs Cycle"
                style={{
                  width: "100%",
                  marginTop: "5px",
                  padding: "9px 12px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              />
            </div>
            <div
              id="subtopicModalAlert"
              style={{
                display: "none",
                background: "var(--red-bg)",
                color: "var(--red)",
                padding: "10px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                marginBottom: "12px",
              }}
            ></div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => call("closeSubtopicModal")}
                style={{
                  background: "var(--bg)",
                  color: "var(--muted)",
                  border: "1.5px solid var(--border)",
                  padding: "9px 18px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                id="saveSubtopicBtn"
                onClick={() => call("saveSubtopic")}
                style={{
                  background: "var(--blue-main)",
                  color: "white",
                  border: "none",
                  padding: "9px 20px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                Save Subtopic
              </button>
            </div>
          </div>
        </div>

        {/* Subject Table */}
        <div className="card">
          <div className="card-hdr">
            <span className="card-title">📋 Subject List</span>
            <button
              className="btn btn-gray btn-sm"
              onClick={() => call("loadSubjectsTab")}
            >
              🔄 Refresh
            </button>
          </div>
          <div className="card-body">
            <div className="tbl-wrap">
              <table className="tbl" id="subjectsTable">
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}>#</th>
                    <th>Subject Name</th>
                    <th style={{ textAlign: "center" }}>Total Questions</th>
                    <th style={{ textAlign: "center" }}>Color</th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody id="subjectsTbody">
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                        color: "var(--muted)",
                        padding: "32px",
                      }}
                    >
                      Loading…
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSubjects;
