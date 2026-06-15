import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "../../utils/AxiosConfig";
import "../../styles/admin.css";

const BASE_URL = process.env.REACT_APP_BASEURL;

const AdminSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectModalMode, setSubjectModalMode] = useState("add");
  const [subjectFormName, setSubjectFormName] = useState("");
  const [subjectFormColor, setSubjectFormColor] = useState("#0b63b7");
  const [subjectFormIcon, setSubjectFormIcon] = useState("");
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [subjectAlert, setSubjectAlert] = useState("");

  const [topics, setTopics] = useState([]);
  const [topicsFilterSubject, setTopicsFilterSubject] = useState("");
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topicModalMode, setTopicModalMode] = useState("add");
  const [topicFormName, setTopicFormName] = useState("");
  const [topicFormSubject, setTopicFormSubject] = useState("");
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [topicAlert, setTopicAlert] = useState("");

  const [subtopics, setSubtopics] = useState([]);
  const [subtopicsFilterTopic, setSubtopicsFilterTopic] = useState("");
  const [subtopicsLoading, setSubtopicsLoading] = useState(false);
  const [showSubtopicModal, setShowSubtopicModal] = useState(false);
  const [subtopicModalMode, setSubtopicModalMode] = useState("add");
  const [subtopicFormName, setSubtopicFormName] = useState("");
  const [subtopicFormTopic, setSubtopicFormTopic] = useState("");
  const [editingSubtopicId, setEditingSubtopicId] = useState(null);
  const [subtopicAlert, setSubtopicAlert] = useState("");

  const [topicCsvQuizId, setTopicCsvQuizId] = useState("");
  const [topicCsvRows, setTopicCsvRows] = useState([]);
  const [topicCsvFileName, setTopicCsvFileName] = useState("");
  const [topicCsvPreviewVisible, setTopicCsvPreviewVisible] = useState(false);
  const [topicCsvUploading, setTopicCsvUploading] = useState(false);
  const [topicCsvStatus, setTopicCsvStatus] = useState("");
  const [topicCsvDragOver, setTopicCsvDragOver] = useState(false);

  const [qbSubject, setQbSubject] = useState("");
  const [qbTopic, setQbTopic] = useState("");
  const [qbSubtopic, setQbSubtopic] = useState("");
  const [qbTopics, setQbTopics] = useState([]);
  const [qbSubtopics, setQbSubtopics] = useState([]);
  const [qbQuestions, setQbQuestions] = useState([]);
  const [qbLoading, setQbLoading] = useState(false);
  const [qbStats, setQbStats] = useState({ total: 0, correct: 0, incorrect: 0 });

  const [subjectStats, setSubjectStats] = useState({ totalSubjects: 0, totalTagged: 0, untagged: 0 });
  const [subjectCards, setSubjectCards] = useState([]);

  const topicCsvInputRef = useRef(null);

  const parseTopicCsv = (text) => {
    const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
    if (!lines.length) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    return lines.slice(1).map((line, i) => {
      const values = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
      const row = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
      return { id: `csv-${Date.now()}-${i}`, ...row };
    });
  };

  const loadSubjects = async () => {
    try {
      setSubjectsLoading(true);
      const res = await axios.get(`${BASE_URL}/api/v1/subjects`);
      setSubjects(res.data.subjects || res.data || []);
    } catch {
      setSubjects([]);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const loadTopics = async () => {
    try {
      setTopicsLoading(true);
      const res = await axios.get(`${BASE_URL}/api/v1/topics`);
      const allTopics = res.data.topics || res.data || [];
      setTopics(allTopics);
      if (topicsFilterSubject) {
        const filtered = allTopics.filter(t => String(t.subject_id) === String(topicsFilterSubject));
        setTopics(filtered);
      }
    } catch {
      setTopics([]);
    } finally {
      setTopicsLoading(false);
    }
  };

  const loadTopicsBySubject = async (subjectId) => {
    try {
      const ids = subjectId ? [subjectId] : subjects.map(s => s.id);
      const res = await axios.post(`${BASE_URL}/api/v1/topics/by-subjects`, { subject_ids: ids });
      const all = res.data.topics || res.data || [];
      if (subjectId) {
        const filtered = all.filter(t => String(t.subject_id) === String(subjectId));
        setTopics(filtered);
      } else {
        setTopics(all);
      }
      return all;
    } catch {
      setTopics([]);
      return [];
    }
  };

  const loadTopicsAdmin = async () => {
    const val = document ? topicsFilterSubject : topicsFilterSubject;
    const ids = val ? [val] : subjects.map(s => s.id);
    if (!ids.length) {
      setTopics([]);
      return;
    }
    try {
      setTopicsLoading(true);
      const res = await axios.post(`${BASE_URL}/api/v1/topics/by-subjects`, { subject_ids: ids });
      const allTopics = res.data.topics || res.data || [];
      setTopics(allTopics);
    } catch {
      setTopics([]);
    } finally {
      setTopicsLoading(false);
    }
  };

  useEffect(() => {
    if (subjects.length > 0) {
      loadTopicsAdmin();
    }
  }, [topicsFilterSubject, subjects.length]);

  const loadSubtopics = async () => {
    try {
      setSubtopicsLoading(true);
      const res = await axios.get(`${BASE_URL}/api/v1/subtopics`);
      const all = res.data.subtopics || res.data || [];
      if (subtopicsFilterTopic) {
        const filtered = all.filter(s => String(s.topic_id) === String(subtopicsFilterTopic));
        setSubtopics(filtered);
      } else {
        setSubtopics(all);
      }
    } catch {
      setSubtopics([]);
    } finally {
      setSubtopicsLoading(false);
    }
  };

  const loadSubtopicsByTopic = async (topicId) => {
    try {
      const ids = topicId ? [topicId] : topics.map(t => t.id);
      if (!ids.length) return [];
      const res = await axios.post(`${BASE_URL}/api/v1/subtopics/by-topics`, { topic_ids: ids });
      const all = res.data.subtopics || res.data || [];
      if (topicId) {
        const filtered = all.filter(s => String(s.topic_id) === String(topicId));
        setSubtopics(filtered);
      } else {
        setSubtopics(all);
      }
      return all;
    } catch {
      setSubtopics([]);
      return [];
    }
  };

  const loadSubjectStats = async () => {
    try {
      const [subjectsRes, questionsRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/v1/subjects`),
        axios.get(`${BASE_URL}/api/v1/questions/all`).catch(() => ({ data: { questions: [] } })),
      ]);
      const allSubjects = subjectsRes.data.subjects || subjectsRes.data || [];
      const allQuestions = questionsRes.data?.questions || questionsRes.data || [];
      const totalSubjects = allSubjects.length;
      const tagged = allQuestions.filter(q => q.subject_id || q.subject).length;
      const untagged = allQuestions.length - tagged;
      setSubjectStats({ totalSubjects, totalTagged: tagged, untagged });
    } catch {
      setSubjectStats({ totalSubjects: 0, totalTagged: 0, untagged: 0 });
    }
  };

  const loadSubjectCards = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/subjects`);
      const allSubjects = res.data.subjects || res.data || [];
      const qRes = await axios.get(`${BASE_URL}/api/v1/questions/all`).catch(() => ({ data: { questions: [] } }));
      const allQuestions = qRes.data?.questions || qRes.data || [];
      const cards = allSubjects.map(s => {
        const count = allQuestions.filter(q => {
          const qSubj = q.subject_id || q.subject;
          return String(qSubj) === String(s.id) || String(qSubj) === String(s._id);
        }).length;
        return {
          ...s,
          questionCount: count,
          color: s.color || "#0b63b7",
          icon: s.icon || "📚",
          name: s.name,
        };
      });
      setSubjectCards(cards);
    } catch {
      setSubjectCards([]);
    }
  };

  const loadQbTopics = async () => {
    setQbTopic("");
    setQbSubtopic("");
    setQbSubtopics([]);
    setQbQuestions([]);
    setQbStats({ total: 0, correct: 0, incorrect: 0 });
    if (!qbSubject) {
      setQbTopics([]);
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/topics/by-subjects`, { subject_ids: [qbSubject] });
      setQbTopics(res.data.topics || res.data || []);
    } catch {
      setQbTopics([]);
    }
  };

  const loadQbSubtopics = async () => {
    setQbSubtopic("");
    setQbQuestions([]);
    setQbStats({ total: 0, correct: 0, incorrect: 0 });
    if (!qbTopic) {
      setQbSubtopics([]);
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/subtopics/by-topics`, { topic_ids: [qbTopic] });
      setQbSubtopics(res.data.subtopics || res.data || []);
    } catch {
      setQbSubtopics([]);
    }
  };

  const loadQbQuestions = async () => {
    try {
      setQbLoading(true);
      const params = {};
      if (qbSubject) params.subject = qbSubject;
      if (qbTopic) params.topic = qbTopic;
      if (qbSubtopic) params.subtopic = qbSubtopic;
      const res = await axios.get(`${BASE_URL}/api/v1/questions/by-filters`, { params });
      const questions = res.data.questions || res.data || [];
      setQbQuestions(questions);
      const total = questions.length;
      let correct = 0;
      let incorrect = 0;
      questions.forEach(q => {
        if (q.stats) {
          correct += q.stats.correct || 0;
          incorrect += q.stats.incorrect || 0;
        }
      });
      setQbStats({ total, correct, incorrect });
    } catch {
      setQbQuestions([]);
      setQbStats({ total: 0, correct: 0, incorrect: 0 });
    } finally {
      setQbLoading(false);
    }
  };

  useEffect(() => {
    loadQbTopics();
  }, [qbSubject]);

  useEffect(() => {
    loadQbSubtopics();
  }, [qbTopic]);

  const openAddSubjectModal = () => {
    setSubjectModalMode("add");
    setSubjectFormName("");
    setSubjectFormColor("#0b63b7");
    setSubjectFormIcon("");
    setEditingSubjectId(null);
    setSubjectAlert("");
    setShowSubjectModal(true);
  };

  const openEditSubjectModal = (subject) => {
    setSubjectModalMode("edit");
    setSubjectFormName(subject.name || "");
    setSubjectFormColor(subject.color || "#0b63b7");
    setSubjectFormIcon(subject.icon || "");
    setEditingSubjectId(subject.id || subject._id);
    setSubjectAlert("");
    setShowSubjectModal(true);
  };

  const closeSubjectModal = () => {
    setShowSubjectModal(false);
    setSubjectAlert("");
  };

  const saveSubject = async () => {
    if (!subjectFormName.trim()) {
      setSubjectAlert("Subject name is required");
      return;
    }
    try {
      if (subjectModalMode === "add") {
        await axios.post(`${BASE_URL}/api/v1/subjects/create`, {
          name: subjectFormName.trim(),
          color: subjectFormColor,
          icon: subjectFormIcon || undefined,
        });
      } else {
        await axios.put(`${BASE_URL}/api/v1/subjects/${editingSubjectId}`, {
          name: subjectFormName.trim(),
          color: subjectFormColor,
          icon: subjectFormIcon || undefined,
        });
      }
      closeSubjectModal();
      await Promise.all([loadSubjects(), loadSubjectStats(), loadSubjectCards()]);
    } catch (err) {
      setSubjectAlert(err?.response?.data?.message || "Failed to save subject");
    }
  };

  const deleteSubject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/v1/subjects/${id}`);
      await Promise.all([loadSubjects(), loadSubjectStats(), loadSubjectCards()]);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete subject");
    }
  };

  const openAddTopicModal = (subjectId) => {
    setTopicModalMode("add");
    setTopicFormName("");
    setTopicFormSubject(subjectId || topicsFilterSubject || "");
    setEditingTopicId(null);
    setTopicAlert("");
    setShowTopicModal(true);
  };

  const openEditTopicModal = (topic) => {
    setTopicModalMode("edit");
    setTopicFormName(topic.name || "");
    setTopicFormSubject(topic.subject_id || topic.subject || "");
    setEditingTopicId(topic.id || topic._id);
    setTopicAlert("");
    setShowTopicModal(true);
  };

  const closeTopicModal = () => {
    setShowTopicModal(false);
    setTopicAlert("");
  };

  const saveTopic = async () => {
    if (!topicFormName.trim()) {
      setTopicAlert("Topic name is required");
      return;
    }
    if (!topicFormSubject) {
      setTopicAlert("Please select a subject");
      return;
    }
    try {
      if (topicModalMode === "add") {
        await axios.post(`${BASE_URL}/api/v1/topics/create`, {
          name: topicFormName.trim(),
          subject: topicFormSubject,
        });
      } else {
        await axios.put(`${BASE_URL}/api/v1/topics/${editingTopicId}`, {
          name: topicFormName.trim(),
          subject: topicFormSubject,
        });
      }
      closeTopicModal();
      await loadTopicsAdmin();
    } catch (err) {
      setTopicAlert(err?.response?.data?.message || "Failed to save topic");
    }
  };

  const deleteTopic = async (id) => {
    if (!window.confirm("Are you sure you want to delete this topic?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/v1/topics/${id}`);
      await loadTopicsAdmin();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete topic");
    }
  };

  const openAddSubtopicModal = (topicId) => {
    setSubtopicModalMode("add");
    setSubtopicFormName("");
    setSubtopicFormTopic(topicId || subtopicsFilterTopic || "");
    setEditingSubtopicId(null);
    setSubtopicAlert("");
    setShowSubtopicModal(true);
  };

  const openEditSubtopicModal = (subtopic) => {
    setSubtopicModalMode("edit");
    setSubtopicFormName(subtopic.name || "");
    setSubtopicFormTopic(subtopic.topic_id || subtopic.topic || "");
    setEditingSubtopicId(subtopic.id || subtopic._id);
    setSubtopicAlert("");
    setShowSubtopicModal(true);
  };

  const closeSubtopicModal = () => {
    setShowSubtopicModal(false);
    setSubtopicAlert("");
  };

  const saveSubtopic = async () => {
    if (!subtopicFormName.trim()) {
      setSubtopicAlert("Subtopic name is required");
      return;
    }
    if (!subtopicFormTopic) {
      setSubtopicAlert("Please select a topic");
      return;
    }
    try {
      if (subtopicModalMode === "add") {
        await axios.post(`${BASE_URL}/api/v1/subtopics/create`, {
          name: subtopicFormName.trim(),
          topic: subtopicFormTopic,
        });
      } else {
        await axios.put(`${BASE_URL}/api/v1/subtopics/${editingSubtopicId}`, {
          name: subtopicFormName.trim(),
          topic: subtopicFormTopic,
        });
      }
      closeSubtopicModal();
      await loadSubtopicsByTopic(subtopicsFilterTopic || undefined);
    } catch (err) {
      setSubtopicAlert(err?.response?.data?.message || "Failed to save subtopic");
    }
  };

  const deleteSubtopic = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subtopic?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/v1/subtopics/${id}`);
      await loadSubtopicsByTopic(subtopicsFilterTopic || undefined);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete subtopic");
    }
  };

  const handleTopicCsvDrop = (e) => {
    e.preventDefault();
    setTopicCsvDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleTopicCsvFile(file);
  };

  const handleTopicCsvFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      setTopicCsvStatus("Please select a CSV file");
      return;
    }
    setTopicCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const rows = parseTopicCsv(text);
      if (!rows.length) {
        setTopicCsvStatus("No valid rows found in CSV");
        return;
      }
      setTopicCsvRows(rows);
      setTopicCsvPreviewVisible(true);
      setTopicCsvStatus("");
    };
    reader.readAsText(file);
  };

  const uploadTopicCsv = async () => {
    if (!topicCsvRows.length) return;
    try {
      setTopicCsvUploading(true);
      setTopicCsvStatus("Uploading...");
      const formData = new FormData();
      const blob = new Blob([topicCsvRows.map(r => {
        const headers = Object.keys(r).filter(k => k !== "id");
        return headers.map(h => r[h] || "").join(",");
      }).join("\n")], { type: "text/csv" });
      formData.append("file", blob, topicCsvFileName || "questions.csv");
      if (topicCsvQuizId) formData.append("quiz_id", topicCsvQuizId);
      await axios.post(`${BASE_URL}/api/v1/questions/upload-csv`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTopicCsvStatus("Upload successful!");
      setTopicCsvRows([]);
      setTopicCsvPreviewVisible(false);
      setTopicCsvFileName("");
    } catch (err) {
      setTopicCsvStatus(err?.response?.data?.message || "Upload failed");
    } finally {
      setTopicCsvUploading(false);
    }
  };

  const clearTopicCsv = () => {
    setTopicCsvRows([]);
    setTopicCsvPreviewVisible(false);
    setTopicCsvFileName("");
    setTopicCsvStatus("");
    if (topicCsvInputRef.current) topicCsvInputRef.current.value = "";
  };

  const loadSubjectsTab = () => {
    loadSubjects();
    loadSubjectStats();
    loadSubjectCards();
  };

  useEffect(() => {
    const init = async () => {
      await loadSubjects();
      await loadSubjectStats();
      await loadSubjectCards();
      await loadTopicsAdmin();
    };
    init();
  }, []);

  const csvHeaders = useMemo(() => {
    if (!topicCsvRows.length) return [];
    return Object.keys(topicCsvRows[0]).filter(k => k !== "id");
  }, [topicCsvRows]);

  const filteredTopics = useMemo(() => {
    if (!topicsFilterSubject) return topics;
    return topics.filter(t => String(t.subject_id) === String(topicsFilterSubject));
  }, [topics, topicsFilterSubject]);

  const filteredSubtopics = useMemo(() => {
    if (!subtopicsFilterTopic) return subtopics;
    return subtopics.filter(s => String(s.topic_id) === String(subtopicsFilterTopic));
  }, [subtopics, subtopicsFilterTopic]);

  return (
    <div>
      <div id="subjects" className="tab-panel">
        <div className="sec-hdr">
          <h2 className="sec-title">📚 Subjects</h2>
          <button className="btn btn-blue btn-sm" onClick={() => openAddSubjectModal()}>
            ＋ Add Subject
          </button>
        </div>

        <div className="stats-grid" style={{ marginBottom: "20px" }}>
          <div className="stat-box">
            <div className="stat-label">Total Subjects</div>
            <div className="stat-num">{subjectStats.totalSubjects}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Total Questions Tagged</div>
            <div className="stat-num">{subjectStats.totalTagged}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Untagged Questions</div>
            <div className="stat-num">{subjectStats.untagged}</div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          {subjectCards.map((card) => (
            <div
              key={card.id || card._id}
              style={{
                background: "var(--card)",
                border: `1px solid var(--border)`,
                borderRadius: "var(--radius)",
                padding: "16px 14px",
                boxShadow: "var(--shadow)",
                borderTop: `3px solid ${card.color || "#0b63b7"}`,
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "6px" }}>{card.icon || "📚"}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", marginBottom: "3px" }}>
                {card.name}
              </div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: card.color || "var(--blue)" }}>
                {card.questionCount}
              </div>
              <div style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".4px" }}>
                Questions
              </div>
            </div>
          ))}
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
              <h3 style={{ fontFamily: "'Merriweather',serif", fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>
                📖 Topics & Subtopics Manager
              </h3>
              <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "3px" }}>
                Manage topics and subtopics for each subject
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <select
                value={topicsFilterSubject}
                onChange={(e) => { setTopicsFilterSubject(e.target.value); }}
                style={{
                  padding: "8px 12px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>
                ))}
              </select>
              <button
                onClick={() => openAddTopicModal()}
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
            {topicsLoading ? (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--muted)" }}>
                Loading topics…
              </div>
            ) : filteredTopics.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--muted)" }}>
                No topics found. Add a topic to get started.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {filteredTopics.map((topic) => (
                  <div
                    key={topic.id || topic._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "var(--bg)",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>
                        {topic.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                        {subjects.find(s => String(s.id || s._id) === String(topic.subject_id || topic.subject))?.name || "—"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <button
                        className="btn btn-gray btn-xs"
                        onClick={() => openAddSubtopicModal(topic.id || topic._id)}
                      >
                        + Subtopic
                      </button>
                      <button
                        className="btn btn-gray btn-xs"
                        onClick={() => openEditTopicModal(topic)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-red btn-xs"
                        onClick={() => deleteTopic(topic.id || topic._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: "18px", borderTop: "1px solid var(--border)", paddingTop: "18px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: "12px" }}>
              <select
                value={subtopicsFilterTopic}
                onChange={(e) => { setSubtopicsFilterTopic(e.target.value); setSubtopics([]); }}
                style={{
                  padding: "7px 10px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontFamily: "'DM Sans',sans-serif",
                  flex: 1,
                  minWidth: "160px",
                }}
              >
                <option value="">All Topics</option>
                {filteredTopics.map((t) => (
                  <option key={t.id || t._id} value={t.id || t._id}>{t.name}</option>
                ))}
              </select>
              <button
                onClick={() => loadSubtopicsByTopic(subtopicsFilterTopic || undefined)}
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
                Load Subtopics
              </button>
            </div>
            <div id="subtopicsList">
              {subtopicsLoading ? (
                <div style={{ textAlign: "center", padding: "14px", color: "var(--muted)", fontSize: "13px" }}>
                  Loading subtopics…
                </div>
              ) : filteredSubtopics.length === 0 ? (
                <div style={{ textAlign: "center", padding: "14px", color: "var(--muted)", fontSize: "13px" }}>
                  {subtopicsFilterTopic ? "No subtopics for this topic." : "Select a topic and click Load Subtopics."}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {filteredSubtopics.map((sub) => (
                    <div
                      key={sub.id || sub._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        background: "var(--card)",
                        borderRadius: "6px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>
                        {sub.name}
                      </span>
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button
                          className="btn btn-gray btn-xs"
                          onClick={() => openEditSubtopicModal(sub)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-red btn-xs"
                          onClick={() => deleteSubtopic(sub.id || sub._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
          <h3 style={{ fontFamily: "'Merriweather',serif", fontSize: "16px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
            📥 Upload Questions with Topics/Subtopics
          </h3>
          <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "16px" }}>
            CSV columns:{" "}
            <strong>
              question, option_a, option_b, option_c, option_d, correct_answer,
              explanation, subject, topic, subtopic
            </strong>
          </p>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", display: "block", marginBottom: "6px" }}>
              Assign to Quiz (optional)
            </label>
            <select
              value={topicCsvQuizId}
              onChange={(e) => setTopicCsvQuizId(e.target.value)}
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
            >
              <option value="">— No quiz (question bank only) —</option>
            </select>
          </div>

          <div
            style={{
              border: `2px dashed ${topicCsvDragOver ? "var(--blue-main)" : "var(--border)"}`,
              borderRadius: "10px",
              padding: "28px",
              textAlign: "center",
              cursor: "pointer",
              transition: "border-color .2s",
              background: "var(--bg)",
            }}
            onClick={() => topicCsvInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setTopicCsvDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setTopicCsvDragOver(false); }}
            onDrop={(e) => handleTopicCsvDrop(e)}
          >
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>📄</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>
              Drop CSV here or click to browse
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
              Columns: question · option_a–d · correct_answer · explanation · subject · topic · subtopic
            </div>
          </div>
          <input
            type="file"
            ref={topicCsvInputRef}
            accept=".csv"
            style={{ display: "none" }}
            onChange={(e) => handleTopicCsvFile(e.target.files[0])}
          />

          {topicCsvPreviewVisible && topicCsvRows.length > 0 && (
            <div style={{ marginTop: "14px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>
                {topicCsvRows.length} row(s) loaded from {topicCsvFileName}
              </div>
              <div style={{
                overflowX: "auto",
                maxHeight: "240px",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      {csvHeaders.map((h) => (
                        <th key={h} style={{ fontSize: "11px", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topicCsvRows.slice(0, 50).map((row) => (
                      <tr key={row.id}>
                        {csvHeaders.map((h) => (
                          <td key={h} style={{ fontSize: "12px", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {row[h] || ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {topicCsvRows.length > 50 && (
                  <div style={{ textAlign: "center", padding: "8px", fontSize: "12px", color: "var(--muted)" }}>
                    … and {topicCsvRows.length - 50} more rows
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={uploadTopicCsv}
                  disabled={topicCsvUploading}
                  style={{
                    background: "var(--green)",
                    color: "white",
                    border: "none",
                    padding: "9px 20px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: topicCsvUploading ? "not-allowed" : "pointer",
                    opacity: topicCsvUploading ? 0.55 : 1,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {topicCsvUploading ? "⏳ Uploading..." : "⬆️ Upload Questions"}
                </button>
                <button
                  onClick={clearTopicCsv}
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
              {topicCsvStatus && (
                <div style={{ marginTop: "10px", fontSize: "13px", fontWeight: 600, color: topicCsvStatus.includes("successful") ? "var(--green)" : topicCsvStatus.includes("Uploading") ? "var(--blue-main)" : "var(--red)" }}>
                  {topicCsvStatus}
                </div>
              )}
            </div>
          )}
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
              <h3 style={{ fontFamily: "'Merriweather',serif", fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>
                🔍 Question Bank Browser
              </h3>
              <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "3px" }}>
                Browse questions by subject, topic, and subtopic
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <select
                value={qbSubject}
                onChange={(e) => setQbSubject(e.target.value)}
                style={{
                  padding: "7px 10px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>
                ))}
              </select>
              <select
                value={qbTopic}
                onChange={(e) => setQbTopic(e.target.value)}
                style={{
                  padding: "7px 10px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                <option value="">All Topics</option>
                {qbTopics.map((t) => (
                  <option key={t.id || t._id} value={t.id || t._id}>{t.name}</option>
                ))}
              </select>
              <select
                value={qbSubtopic}
                onChange={(e) => setQbSubtopic(e.target.value)}
                style={{
                  padding: "7px 10px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                <option value="">All Subtopics</option>
                {qbSubtopics.map((s) => (
                  <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>
                ))}
              </select>
              <button
                onClick={loadQbQuestions}
                disabled={qbLoading}
                style={{
                  background: "var(--blue-main)",
                  color: "white",
                  border: "none",
                  padding: "7px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: qbLoading ? "not-allowed" : "pointer",
                  opacity: qbLoading ? 0.55 : 1,
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                {qbLoading ? "..." : "Browse"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
            {qbStats.total > 0 && (
              <>
                <div style={{
                  background: "var(--bg)",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}>
                  Total: <span style={{ color: "var(--blue)" }}>{qbStats.total}</span>
                </div>
                <div style={{
                  background: "var(--bg)",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}>
                  Correct: <span style={{ color: "var(--green)" }}>{qbStats.correct}</span>
                </div>
                <div style={{
                  background: "var(--bg)",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}>
                  Incorrect: <span style={{ color: "var(--red)" }}>{qbStats.incorrect}</span>
                </div>
              </>
            )}
          </div>
          <div style={{ fontSize: "13px", color: "var(--muted)" }}>
            {qbLoading ? (
              "Loading questions..."
            ) : qbQuestions.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {qbQuestions.map((q, idx) => (
                  <div
                    key={q.id || q._id || idx}
                    style={{
                      padding: "12px 14px",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      background: "var(--bg)",
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
                      {idx + 1}. {q.question}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: "12px" }}>
                      {["option_a", "option_b", "option_c", "option_d"].map((opt) => (
                        q[opt] ? (
                          <div key={opt} style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            background: opt === "correct_answer" || q.correct_answer === opt ? "#dcfce7" : "transparent",
                            fontWeight: opt === "correct_answer" || q.correct_answer === opt ? 700 : 400,
                          }}>
                            <span style={{ fontWeight: 700, marginRight: "4px" }}>{opt.replace("option_", "").toUpperCase()}.</span>
                            {q[opt]}
                          </div>
                        ) : null
                      ))}
                    </div>
                    {q.explanation && (
                      <div style={{ marginTop: "6px", fontSize: "11px", color: "var(--muted)", fontStyle: "italic" }}>
                        {q.explanation}
                      </div>
                    )}
                    <div style={{ marginTop: "6px", display: "flex", gap: "8px", flexWrap: "wrap", fontSize: "11px" }}>
                      {q.subject && <span style={{ background: "#dbeafe", padding: "2px 8px", borderRadius: "4px" }}>{q.subject}</span>}
                      {q.topic && <span style={{ background: "#f3e8ff", padding: "2px 8px", borderRadius: "4px" }}>{q.topic}</span>}
                      {q.subtopic && <span style={{ background: "#dcfce7", padding: "2px 8px", borderRadius: "4px" }}>{q.subtopic}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              "Select filters above to browse questions."
            )}
          </div>
        </div>

        {showTopicModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,.5)",
              zIndex: 1000,
              display: "flex",
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
                <h3 style={{ fontFamily: "'Merriweather',serif", fontSize: "16px", fontWeight: 700 }}>
                  {topicModalMode === "add" ? "Add Topic" : "Edit Topic"}
                </h3>
                <button
                  onClick={closeTopicModal}
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
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".5px" }}>
                  Subject *
                </label>
                <select
                  value={topicFormSubject}
                  onChange={(e) => setTopicFormSubject(e.target.value)}
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
                >
                  <option value="">Select subject…</option>
                  {subjects.map((s) => (
                    <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".5px" }}>
                  Topic Name *
                </label>
                <input
                  type="text"
                  value={topicFormName}
                  onChange={(e) => setTopicFormName(e.target.value)}
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
              {topicAlert && (
                <div style={{
                  background: "var(--red-bg)",
                  color: "var(--red)",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  marginBottom: "12px",
                }}>
                  {topicAlert}
                </div>
              )}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  onClick={closeTopicModal}
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
                  onClick={saveTopic}
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
        )}

        {showSubtopicModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,.5)",
              zIndex: 1000,
              display: "flex",
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
                <h3 style={{ fontFamily: "'Merriweather',serif", fontSize: "16px", fontWeight: 700 }}>
                  {subtopicModalMode === "add" ? "Add Subtopic" : "Edit Subtopic"}
                </h3>
                <button
                  onClick={closeSubtopicModal}
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
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".5px" }}>
                  Topic *
                </label>
                <select
                  value={subtopicFormTopic}
                  onChange={(e) => setSubtopicFormTopic(e.target.value)}
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
                >
                  <option value="">Select topic…</option>
                  {topics.map((t) => (
                    <option key={t.id || t._id} value={t.id || t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".5px" }}>
                  Subtopic Name *
                </label>
                <input
                  type="text"
                  value={subtopicFormName}
                  onChange={(e) => setSubtopicFormName(e.target.value)}
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
              {subtopicAlert && (
                <div style={{
                  background: "var(--red-bg)",
                  color: "var(--red)",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  marginBottom: "12px",
                }}>
                  {subtopicAlert}
                </div>
              )}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  onClick={closeSubtopicModal}
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
                  onClick={saveSubtopic}
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
        )}

        <div className="card">
          <div className="card-hdr">
            <span className="card-title">📋 Subject List</span>
            <button className="btn btn-gray btn-sm" onClick={loadSubjectsTab}>
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
                  {subjectsLoading ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                        Loading…
                      </td>
                    </tr>
                  ) : subjects.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                        No subjects found.
                      </td>
                    </tr>
                  ) : (
                    subjects.map((subject, idx) => (
                      <tr key={subject.id || subject._id}>
                        <td style={{ fontWeight: 600 }}>{idx + 1}</td>
                        <td>
                          <span style={{ marginRight: "6px" }}>{subject.icon || "📚"}</span>
                          {subject.name}
                        </td>
                        <td style={{ textAlign: "center", fontWeight: 700 }}>
                          {subjectCards.find(s => String(s.id || s._id) === String(subject.id || subject._id))?.questionCount || 0}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span
                            style={{
                              display: "inline-block",
                              width: "20px",
                              height: "20px",
                              borderRadius: "4px",
                              background: subject.color || "#0b63b7",
                              verticalAlign: "middle",
                            }}
                          />
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                            <button
                              className="btn btn-gray btn-xs"
                              onClick={() => openEditSubjectModal(subject)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn btn-red btn-xs"
                              onClick={() => deleteSubject(subject.id || subject._id)}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showSubjectModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            zIndex: 1000,
            display: "flex",
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
              maxWidth: "480px",
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
              <h3 style={{ fontFamily: "'Merriweather',serif", fontSize: "16px", fontWeight: 700 }}>
                {subjectModalMode === "add" ? "Add Subject" : "Edit Subject"}
              </h3>
              <button
                onClick={closeSubjectModal}
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
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".5px" }}>
                Subject Name *
              </label>
              <input
                type="text"
                value={subjectFormName}
                onChange={(e) => setSubjectFormName(e.target.value)}
                placeholder="e.g. Biology"
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
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".5px" }}>
                Color
              </label>
              <input
                type="color"
                value={subjectFormColor}
                onChange={(e) => setSubjectFormColor(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: "5px",
                  padding: "4px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "8px",
                  background: "var(--bg)",
                  cursor: "pointer",
                  height: "40px",
                }}
              />
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".5px" }}>
                Icon (emoji)
              </label>
              <input
                type="text"
                value={subjectFormIcon}
                onChange={(e) => setSubjectFormIcon(e.target.value)}
                placeholder="e.g. 🧬"
                maxLength={2}
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
            {subjectAlert && (
              <div style={{
                background: "var(--red-bg)",
                color: "var(--red)",
                padding: "10px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                marginBottom: "12px",
              }}>
                {subjectAlert}
              </div>
            )}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={closeSubjectModal}
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
                onClick={saveSubject}
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
                {subjectModalMode === "add" ? "Add Subject" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubjects;
