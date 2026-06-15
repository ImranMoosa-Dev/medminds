import React, { useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import axios from "../../utils/AxiosConfig";
import { getAllQuizzes } from "../../api/quizApi";
import { getAllSubjects } from "../../api/subjectApi";
import { getAllBatchesApi } from "../../api/batchApi";
import "../../styles/admin.css";

const SUBJECT_META_ADMIN = {
  Biology: { icon: "🧬", color: "#16a34a", bg: "#dcfce7", border: "#86efac" },
  Chemistry: { icon: "⚗️", color: "#0b63b7", bg: "#dbeafe", border: "#93c5fd" },
  Physics: { icon: "⚡", color: "#7c3aed", bg: "#f3e8ff", border: "#c4b5fd" },
  English: { icon: "📖", color: "#d97706", bg: "#fef3c7", border: "#fde68a" },
  "Logical Reasoning": {
    icon: "🧠",
    color: "#dc2626",
    bg: "#fee2e2",
    border: "#fca5a5",
  },
};

const initialQuizForm = {
  name: "",
  description: "",
  quizOrder: 1,
  quizType: "",
  quizSyllabus: "",
  batchIds: [],
  scheduledDate: "",
  csvQuestions: [],
  csvFileName: "",
  csvPreviewVisible: false,
  subjectSelections: {},
  subjectRanges: {},
  csvProgressActive: false,
  csvProgressPct: 0,
  csvProgressLabel: "Uploading questions…",
};

const AdminQuizzes = () => {
  const csvFileInputRef = useRef(null);
  const editQuestionImageRef = useRef(null);

  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [quizForm, setQuizForm] = useState(initialQuizForm);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSyllabus, setFilterSyllabus] = useState("");
  const [sortOption, setSortOption] = useState("order");

  const [selectedQuizIdForQuestions, setSelectedQuizIdForQuestions] =
    useState("");
  const [quizQuestionsMap, setQuizQuestionsMap] = useState({});
  const [quizQuestionsLoading, setQuizQuestionsLoading] = useState(false);

  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryState, setSummaryState] = useState({
    quizName: "Quiz Summary",
    subtitle: "Loading…",
    questionCount: "—",
    attempts: "—",
    avgScore: "—",
    topScore: "—",
    bodyMessage:
      "Quiz summary is unavailable because the current backend does not support detailed quiz summary data.",
  });

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsQuiz, setDetailsQuiz] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editQuiz, setEditQuiz] = useState({
    id: null,
    name: "",
    description: "",
    quizOrder: 1,
    quizType: "",
    quizSyllabus: "",
    batchIds: [],
    questions: [],
    copyFromQuizId: "",
    copyQuizMsg: "",
    questionForm: {
      text: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "",
      explanation: "",
      imageFile: null,
      imagePreview: "",
      imageStatus: "",
    },
  });

  const batchMap = useMemo(() => {
    return (batches || []).reduce((map, batch) => {
      map[batch.id] = batch.name;
      return map;
    }, {});
  }, [batches]);

  const filteredQuizzes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return [...quizzes]
      .filter((quiz) => {
        const matchesSearch =
          !term ||
          quiz.name.toLowerCase().includes(term) ||
          (quiz.description || "").toLowerCase().includes(term) ||
          (quiz.type || "").toLowerCase().includes(term) ||
          (quiz.syllabus || "").toLowerCase().includes(term) ||
          (quiz.subjects || []).some((subject) =>
            subject.toLowerCase().includes(term),
          );
        const matchesType = !filterType || quiz.type === filterType;
        const matchesSyllabus =
          !filterSyllabus || quiz.syllabus === filterSyllabus;
        return matchesSearch && matchesType && matchesSyllabus;
      })
      .sort((a, b) => {
        if (sortOption === "order") {
          return (a.quizOrder || 0) - (b.quizOrder || 0);
        }
        if (sortOption === "name") {
          return String(a.name).localeCompare(String(b.name));
        }
        return 0;
      });
  }, [quizzes, searchTerm, filterType, filterSyllabus, sortOption]);

  useEffect(() => {
    document.title = "MedMinds | Quiz Management";
    loadPageData();
  }, []);

  const normalizeQuizData = (quiz) => {
    const normalized = {
      ...quiz,
      type: quiz.type || quiz.testType || "",
      syllabus: quiz.syllabus || quiz.subject || "",
      subjects:
        quiz.subjects ||
        (quiz.syllabus ? [quiz.syllabus] : quiz.subject ? [quiz.subject] : []),
      batchIds: quiz.batch_id ? [String(quiz.batch_id)] : quiz.batchIds || [],
      is_published:
        quiz.is_published !== undefined
          ? Boolean(quiz.is_published)
          : Boolean(quiz.published),
      quizOrder: quiz.quiz_order || quiz.quizOrder || 0,
      totalQuestions:
        quiz.totalMcqs || quiz.total_questions || quiz.questionCount || 0,
    };
    return normalized;
  };

  const loadPageData = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [quizResp, subjectResp, batchResp] = await Promise.all([
        getAllQuizzes(),
        getAllSubjects(),
        getAllBatchesApi(),
      ]);
      const loadedQuizzes =
        quizResp?.quizzes || quizResp?.data?.quizzes || quizResp || [];
      const normalizedQuizzes = (loadedQuizzes || []).map(normalizeQuizData);
      setQuizzes(normalizedQuizzes);

      const loadedSubjects =
        subjectResp?.subjects ||
        subjectResp?.data?.subjects ||
        subjectResp ||
        [];
      setSubjects(Array.isArray(loadedSubjects) ? loadedSubjects : []);

      const loadedBatches =
        batchResp?.batches || batchResp?.data?.batches || batchResp || [];
      setBatches(Array.isArray(loadedBatches) ? loadedBatches : []);
    } catch (err) {
      setLoadError(
        err?.response?.data?.message ||
          err?.message ||
          "Error loading quiz data",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCreateQuizForm = () => {
    setShowCreateForm((prev) => !prev);
    setQuizForm(initialQuizForm);
  };

  const handleQuizFormChange = (field) => (event) => {
    const value = event.target.value;
    setQuizForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBatchToggle = (batchId) => {
    setQuizForm((prev) => {
      const batchIds = prev.batchIds.includes(batchId)
        ? prev.batchIds.filter((id) => id !== batchId)
        : [...prev.batchIds, batchId];
      return { ...prev, batchIds };
    });
  };

  const handleSubjectToggle = (subjectName) => {
    setQuizForm((prev) => {
      const selected = !prev.subjectSelections[subjectName];
      const subjectSelections = {
        ...prev.subjectSelections,
        [subjectName]: selected,
      };
      const subjectRanges = { ...prev.subjectRanges };
      if (!selected) {
        delete subjectRanges[subjectName];
      }
      return { ...prev, subjectSelections, subjectRanges };
    });
  };

  const handleSubjectRangeChange = (subjectName, field) => (event) => {
    const value = event.target.value;
    setQuizForm((prev) => {
      const subjectRanges = {
        ...prev.subjectRanges,
        [subjectName]: {
          ...prev.subjectRanges[subjectName],
          [field]: value,
        },
      };
      return { ...prev, subjectRanges };
    });
  };

  const getSubjectRangeCount = (subjectName) => {
    const range = quizForm.subjectRanges[subjectName] || {};
    const from = parseInt(range.from, 10) || 0;
    const to = parseInt(range.to, 10) || 0;
    if (from > 0 && to >= from) {
      return to - from + 1;
    }
    return 0;
  };

  const parseCsvToQuestions = (csvText) => {
    const lines = csvText
      .trim()
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);
    if (!lines.length) return [];

    const header = lines[0]
      .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
      .map((value) => value.trim().toLowerCase());

    const requiredHeaders = [
      "question",
      "option_a",
      "option_b",
      "option_c",
      "option_d",
      "correct_answer",
    ];
    const missingHeaders = requiredHeaders.filter(
      (name) => !header.includes(name),
    );
    if (missingHeaders.length) {
      throw new Error(
        `Missing required CSV columns: ${missingHeaders.join(", ")}`,
      );
    }

    return lines.slice(1).map((line, index) => {
      const values = line
        .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map((value) => value.trim().replace(/^"|"$/g, ""));
      const row = {};
      header.forEach((column, columnIndex) => {
        row[column] = values[columnIndex] || "";
      });
      return {
        id: `${Date.now()}-${index}`,
        question: row.question || "",
        option_a: row.option_a || "",
        option_b: row.option_b || "",
        option_c: row.option_c || "",
        option_d: row.option_d || "",
        correct_answer: (row.correct_answer || "").toLowerCase(),
        explanation: row.explanation || "",
      };
    });
  };

  const handleCsvPreview = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Please select a .csv file");
      return;
    }

    try {
      const text = await file.text();
      const parsed = parseCsvToQuestions(text);
      if (!parsed.length) {
        alert("No valid questions found in CSV. Check the format.");
        return;
      }
      setQuizForm((prev) => ({
        ...prev,
        csvQuestions: parsed,
        csvFileName: file.name,
        csvPreviewVisible: true,
      }));
    } catch (err) {
      alert("CSV parse error: " + err.message);
    }
  };

  const clearCsvUpload = () => {
    if (csvFileInputRef.current) {
      csvFileInputRef.current.value = "";
    }
    setQuizForm((prev) => ({
      ...prev,
      csvQuestions: [],
      csvFileName: "",
      csvPreviewVisible: false,
      subjectSelections: {},
      subjectRanges: {},
    }));
  };

  const downloadCSVTemplate = () => {
    const headers = [
      "question",
      "option_a",
      "option_b",
      "option_c",
      "option_d",
      "correct_answer",
      "explanation",
    ];
    const content = `${headers.join(",")}\n"Sample question","A","B","C","D","a","Optional explanation"\n`;
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "quiz_template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateQuizSubmit = async (event) => {
    event.preventDefault();
    if (!quizForm.name.trim()) {
      alert("Quiz Name is required.");
      return;
    }
    if (!quizForm.quizType || !quizForm.quizSyllabus) {
      alert("Quiz Type and Syllabus are required.");
      return;
    }
    if (!quizForm.csvQuestions.length) {
      if (
        !window.confirm(
          "No CSV questions attached. Create quiz without CSV? This quiz will not include question details.",
        )
      ) {
        return;
      }
    }

    setCreateSubmitting(true);
    try {
      const payload = {
        name: quizForm.name.trim(),
        subject: quizForm.quizSyllabus,
        duration: 0,
        totalMcqs: quizForm.csvQuestions.length || 1,
        questions: quizForm.csvQuestions.length
          ? quizForm.csvQuestions.map((_, idx) => idx + 1)
          : [1],
        startTime: quizForm.scheduledDate
          ? new Date(quizForm.scheduledDate).toISOString()
          : new Date().toISOString(),
        endTime: quizForm.scheduledDate
          ? new Date(quizForm.scheduledDate).toISOString()
          : new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        testType: quizForm.quizType,
      };
      await axios.post("/api/v1/quizzes/create", payload);
      await loadPageData();
      setShowCreateForm(false);
      setQuizForm(initialQuizForm);
      alert("Quiz created! Quiz list refreshed.");
    } catch (err) {
      alert(
        "Error creating quiz: " +
          (err?.response?.data?.message || err?.message || "Unknown error"),
      );
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleQuizSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenQuizSummary = (quiz) => {
    setSummaryState({
      quizName: quiz.name || "Quiz Summary",
      subtitle: quiz.syllabus || quiz.subject || "All Questions",
      questionCount: quiz.totalQuestions || "—",
      attempts: "—",
      avgScore: "—",
      topScore: "—",
      bodyMessage:
        "Quiz summary information is currently unavailable for this view.",
    });
    setSummaryModalOpen(true);
  };

  const handleOpenQuizDetails = (quiz) => {
    setDetailsQuiz(quiz);
    setDetailsModalOpen(true);
  };

  const handleShareQuizLink = (quiz) => {
    const link = `${window.location.origin}/quiz-details.html?quiz_id=${quiz.id}`;
    setShareLink(link);
    setShareModalOpen(true);
  };

  const handleCopyShareLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      alert("✅ Copied!");
    } catch (err) {
      alert("Copy failed: " + err.message);
    }
  };

  const handlePublishQuiz = (quiz) => {
    if (!window.confirm(`Publish "${quiz.name}"?`)) return;
    setQuizzes((prev) =>
      prev.map((item) =>
        item.id === quiz.id ? { ...item, is_published: true } : item,
      ),
    );
    alert(`Published "${quiz.name}" locally.`);
  };

  const handleUnpublishQuiz = (quiz) => {
    if (!window.confirm("Unpublish this quiz? Students will not see it."))
      return;
    setQuizzes((prev) =>
      prev.map((item) =>
        item.id === quiz.id ? { ...item, is_published: false } : item,
      ),
    );
    alert(`Unpublished "${quiz.name}" locally.`);
  };

  const handleDeleteQuiz = (quiz) => {
    if (!window.confirm(`Delete "${quiz.name}" and all its questions?`)) return;
    if (!window.confirm("This also deletes all student attempts. Continue?"))
      return;
    setQuizzes((prev) => prev.filter((item) => item.id !== quiz.id));
    if (detailsQuiz?.id === quiz.id) {
      setDetailsModalOpen(false);
      setDetailsQuiz(null);
    }
    alert("✅ Quiz deleted locally.");
  };

  const handleQuestionsQuizChange = (event) => {
    const quizId = event.target.value;
    setSelectedQuizIdForQuestions(quizId);
    if (!quizId) return;
    setQuizQuestionsLoading(true);
    setTimeout(() => {
      setQuizQuestionsLoading(false);
      setQuizQuestionsMap((prev) => ({
        ...prev,
        [quizId]: prev[quizId] || [],
      }));
    }, 120);
  };

  const handleOpenEditQuizModal = (quiz) => {
    setEditQuiz({
      id: quiz.id,
      name: quiz.name || "",
      description: quiz.description || "",
      quizOrder: quiz.quizOrder || 1,
      quizType: quiz.type || "",
      quizSyllabus: quiz.syllabus || "",
      batchIds: quiz.batchIds || [],
      questions: quizQuestionsMap[quiz.id] || [],
      copyFromQuizId: "",
      copyQuizMsg: "",
      questionForm: {
        text: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "",
        explanation: "",
        imageFile: null,
        imagePreview: "",
        imageStatus: "",
      },
    });
    setEditModalOpen(true);
  };

  const handleEditQuizChange = (field) => (event) => {
    const value = event.target.value;
    setEditQuiz((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditBatchToggle = (batchId) => {
    setEditQuiz((prev) => {
      const batchIds = prev.batchIds.includes(batchId)
        ? prev.batchIds.filter((id) => id !== batchId)
        : [...prev.batchIds, batchId];
      return { ...prev, batchIds };
    });
  };

  const handleCopyQuestionsFromQuiz = () => {
    if (!editQuiz.copyFromQuizId) {
      setEditQuiz((prev) => ({
        ...prev,
        copyQuizMsg: "⚠️ Select a source quiz first.",
      }));
      return;
    }
    const source = quizzes.find(
      (quiz) => String(quiz.id) === String(editQuiz.copyFromQuizId),
    );
    if (!source || !source.questions?.length) {
      setEditQuiz((prev) => ({
        ...prev,
        copyQuizMsg: "⚠️ That quiz has no questions to copy.",
      }));
      return;
    }
    setEditQuiz((prev) => ({
      ...prev,
      questions: [...source.questions],
      copyQuizMsg: `✅ ${source.questions.length} questions copied successfully!`,
    }));
  };

  const handleEditQuestionFieldChange = (field) => (event) => {
    const value = event.target.value;
    setEditQuiz((prev) => ({
      ...prev,
      questionForm: { ...prev.questionForm, [field]: value },
    }));
  };

  const handlePreviewQuestionImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setEditQuiz((prev) => ({
      ...prev,
      questionForm: {
        ...prev.questionForm,
        imageFile: file,
        imagePreview: previewUrl,
        imageStatus: `${file.name} (will upload on Add)`,
      },
    }));
  };

  const handleClearQuestionImage = () => {
    if (editQuestionImageRef.current) {
      editQuestionImageRef.current.value = "";
    }
    setEditQuiz((prev) => ({
      ...prev,
      questionForm: {
        ...prev.questionForm,
        imageFile: null,
        imagePreview: "",
        imageStatus: "",
      },
    }));
  };

  const handleSubmitEditQuiz = (event) => {
    event.preventDefault();
    if (!editQuiz.name.trim()) {
      alert("Quiz name is required.");
      return;
    }
    setQuizzes((prev) =>
      prev.map((quiz) =>
        quiz.id === editQuiz.id
          ? {
              ...quiz,
              name: editQuiz.name,
              description: editQuiz.description,
              quizOrder: editQuiz.quizOrder,
              type: editQuiz.quizType,
              syllabus: editQuiz.quizSyllabus,
              subjects: editQuiz.quizSyllabus
                ? [editQuiz.quizSyllabus]
                : quiz.subjects,
              batchIds: editQuiz.batchIds,
            }
          : quiz,
      ),
    );
    setEditModalOpen(false);
    alert("✅ Quiz updated locally.");
  };

  const handleAddQuestionToQuiz = (event) => {
    event.preventDefault();
    const { questionForm } = editQuiz;
    if (
      !questionForm.text.trim() ||
      !questionForm.optionA.trim() ||
      !questionForm.optionB.trim() ||
      !questionForm.optionC.trim() ||
      !questionForm.optionD.trim() ||
      !questionForm.correctAnswer
    ) {
      alert("Please fill out all question fields.");
      return;
    }

    const newQuestion = {
      id: `question-${Date.now()}`,
      question: questionForm.text,
      option_a: questionForm.optionA,
      option_b: questionForm.optionB,
      option_c: questionForm.optionC,
      option_d: questionForm.optionD,
      correct_answer: questionForm.correctAnswer,
      explanation: questionForm.explanation,
      img: questionForm.imagePreview || null,
    };

    setEditQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      questionForm: {
        ...prev.questionForm,
        text: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "",
        explanation: "",
        imageFile: null,
        imagePreview: "",
        imageStatus: "",
      },
    }));
    if (editQuestionImageRef.current) {
      editQuestionImageRef.current.value = "";
    }
  };

  const handleDeleteQuestionFromModal = (questionId) => {
    if (!window.confirm("Delete this question?")) return;
    setEditQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter(
        (question) => question.id !== questionId,
      ),
    }));
  };

  const closeSummaryModal = () => setSummaryModalOpen(false);
  const closeDetailsModal = () => setDetailsModalOpen(false);
  const closeShareModal = () => setShareModalOpen(false);
  const closeEditModal = () => setEditModalOpen(false);

  const handleSummaryOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      closeSummaryModal();
    }
  };

  const handleShareOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      closeShareModal();
    }
  };

  const handleDetailsOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      closeDetailsModal();
    }
  };

  const renderQuizTags = (quiz) => {
    const batchTags = quiz.batchIds?.length
      ? quiz.batchIds.map((id) => (
          <span
            key={`batch-${id}`}
            className="tag"
            style={{ background: "#e0f2fe", color: "#0369a1" }}
          >
            🗂 {batchMap[id] || id}
          </span>
        ))
      : [
          <span
            key="batch-all"
            className="tag"
            style={{ background: "#f3f4f6", color: "#6b7280" }}
          >
            🌐 All Students
          </span>,
        ];

    const typeTag = (
      <span className="tag tag-blue">{quiz.type || "No type"}</span>
    );
    const syllabusTag = (
      <span className="tag tag-purple">{quiz.syllabus || "No syllabus"}</span>
    );

    const subjectTags = (quiz.subjects || []).map((subject) => {
      const meta = SUBJECT_META_ADMIN[subject] || {
        color: "#666",
        bg: "#f3f4f6",
        border: "#d1d5db",
      };
      return (
        <span
          key={`subj-${subject}`}
          className="tag"
          style={{
            background: `${meta.color}22`,
            color: meta.color,
            border: `1px solid ${meta.color}44`,
          }}
        >
          {subject}
        </span>
      );
    });

    return [typeTag, syllabusTag, ...subjectTags, ...batchTags];
  };

  const renderQuestionCard = (question, index) => {
    const correctLetter = (question.correct_answer || "").toUpperCase();
    const options = [
      { letter: "A", text: question.option_a },
      { letter: "B", text: question.option_b },
      { letter: "C", text: question.option_c },
      { letter: "D", text: question.option_d },
    ].filter((option) => option.text);

    return (
      <div
        key={question.id || `${index}-${question.question}`}
        style={{
          background: "#f9f9f9",
          border: "1px solid var(--border)",
          borderLeft: "3px solid var(--blue)",
          padding: 12,
          borderRadius: 8,
          marginBottom: 10,
        }}
      >
        <strong style={{ fontSize: 13, display: "block", marginBottom: 6 }}>
          Q{index + 1}: {question.question}
        </strong>
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
          {options.map((option) => (
            <div key={option.letter}>
              {option.letter}) {option.text}
              {option.letter === correctLetter ? " ✅" : ""}
            </div>
          ))}
        </div>
        {question.explanation ? (
          <div style={{ marginTop: 6, fontSize: 11, color: "var(--green)" }}>
            💡 {question.explanation}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <AdminLayout title="Admin Quiz Management - MedMinds">
      <div className="medminds-admin-root">
        <main className="main-wrap">
          <div id="quizzes" className="tab-panel active">
            <div className="sec-hdr">
              <h2 className="sec-title">📝 Manage Quizzes</h2>
              <button
                className="btn btn-blue"
                onClick={handleToggleCreateQuizForm}
              >
                + Create Quiz
              </button>
            </div>

            <div
              id="addQuizFormContainer"
              className="form-box"
              style={{ display: showCreateForm ? "block" : "none" }}
            >
              <h3>➕ Create New Quiz</h3>
              <form id="addQuizForm" onSubmit={handleCreateQuizSubmit}>
                <div className="form-row">
                  <div className="fg">
                    <label>Quiz Name *</label>
                    <input
                      type="text"
                      id="quizName"
                      placeholder="e.g. Anatomy Week 3"
                      required
                      value={quizForm.name}
                      onChange={handleQuizFormChange("name")}
                    />
                  </div>
                  <div className="fg">
                    <label>Quiz Order *</label>
                    <input
                      type="number"
                      id="quizOrder"
                      placeholder="1"
                      min="1"
                      value={quizForm.quizOrder}
                      onChange={handleQuizFormChange("quizOrder")}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="fg">
                    <label>Quiz Type *</label>
                    <select
                      id="quizType"
                      required
                      value={quizForm.quizType}
                      onChange={handleQuizFormChange("quizType")}
                    >
                      <option value="">— Select Type —</option>
                      <option value="Chapter-wise">Chapter-wise</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Mock">Mock Test</option>
                      <option value="Full-length">Full-length</option>
                    </select>
                  </div>
                  <div className="fg">
                    <label>Syllabus *</label>
                    <select
                      id="quizSyllabus"
                      required
                      value={quizForm.quizSyllabus}
                      onChange={handleQuizFormChange("quizSyllabus")}
                    >
                      <option value="">— Select Syllabus —</option>
                      <option value="Biology">Biology</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="English">English</option>
                      <option value="Logical Reasoning">
                        Logical Reasoning
                      </option>
                      <option value="Biology + Chemistry">
                        Biology + Chemistry
                      </option>
                      <option value="Physics + Chemistry">
                        Physics + Chemistry
                      </option>
                      <option value="Full Syllabus">
                        Full Syllabus (All Subjects)
                      </option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="fg">
                    <label>
                      Assign to Batches
                      <span
                        style={{
                          fontWeight: 400,
                          fontSize: 11,
                          color: "var(--muted)",
                          textTransform: "none",
                          letterSpacing: 0,
                        }}
                      >
                        (tick one or more — leave all unticked for all students)
                      </span>
                    </label>
                    <div
                      id="quizBatchCheckboxes"
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        padding: "10px 12px",
                        border: "1.5px solid #e5e7eb",
                        borderRadius: 8,
                        minHeight: 44,
                        background: "#fafafa",
                      }}
                    >
                      {batches.length === 0 ? (
                        <span style={{ color: "var(--muted)", fontSize: 13 }}>
                          Loading batches…
                        </span>
                      ) : (
                        batches.map((batch) => (
                          <label
                            key={batch.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "5px 10px",
                              border: "1.5px solid var(--border)",
                              borderRadius: 7,
                              cursor: "pointer",
                              fontSize: 13,
                              background: "#fff",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <input
                              type="checkbox"
                              name="createBatch"
                              value={batch.id}
                              checked={quizForm.batchIds.includes(
                                String(batch.id),
                              )}
                              onChange={() =>
                                handleBatchToggle(String(batch.id))
                              }
                            />
                            {batch.name}
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="fg">
                    <label>Schedule Date</label>
                    <input
                      type="datetime-local"
                      id="scheduledDate"
                      value={quizForm.scheduledDate}
                      onChange={handleQuizFormChange("scheduledDate")}
                    />
                  </div>
                </div>

                <div className="fg">
                  <label>Description</label>
                  <textarea
                    id="quizDescription"
                    placeholder="Short description (optional)"
                    value={quizForm.description}
                    onChange={handleQuizFormChange("description")}
                  />
                </div>

                <div className="csv-zone">
                  <div className="csv-zone-header">
                    <span className="csv-zone-label">
                      📂 Upload Questions via CSV
                    </span>
                    <button
                      type="button"
                      className="btn btn-gray btn-sm"
                      onClick={downloadCSVTemplate}
                    >
                      ⬇ Download Template
                    </button>
                  </div>

                  <div
                    className="csv-drop-area"
                    onClick={() => csvFileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      id="csvFileInput"
                      ref={csvFileInputRef}
                      className="csv-file-input"
                      accept=".csv"
                      onChange={handleCsvPreview}
                    />
                    <div className="csv-drop-icon">📄</div>
                    <div className="csv-drop-text">
                      <strong>Click to browse</strong> or drag & drop a CSV file
                    </div>
                    <div className="csv-hint">
                      Columns required: question, option_a, option_b, option_c,
                      option_d, correct_answer, explanation (optional)
                    </div>
                  </div>

                  <div
                    id="csvPreview"
                    className={`csv-preview ${quizForm.csvPreviewVisible ? "show" : ""}`}
                  >
                    <div className="csv-preview-icon">✅</div>
                    <div className="csv-preview-info">
                      <div id="csvCount" className="csv-count">
                        {quizForm.csvQuestions.length} questions
                      </div>
                      <div id="csvFileName" className="csv-fname">
                        {quizForm.csvFileName}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="csv-clear"
                      onClick={clearCsvUpload}
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>

                  <div
                    id="csvProgress"
                    className={`csv-progress ${quizForm.csvProgressActive ? "show" : ""}`}
                  >
                    <div className="progress-track">
                      <div
                        id="csvProgressBar"
                        className="progress-fill"
                        style={{ width: `${quizForm.csvProgressPct}%` }}
                      />
                    </div>
                    <div id="csvProgressLabel" className="progress-label">
                      {quizForm.csvProgressLabel}
                    </div>
                  </div>

                  <div
                    id="subjectRangeSection"
                    className={`subject-range-section ${quizForm.csvQuestions.length > 0 ? "show" : ""}`}
                    style={{
                      display:
                        quizForm.csvQuestions.length > 0 ? "block" : "none",
                    }}
                  >
                    <div className="subject-range-title">
                      🧪 Define Subject Ranges (optional)
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        marginBottom: 12,
                      }}
                    >
                      Select subjects included in this quiz, then define which
                      question numbers belong to each subject.
                    </p>
                    <div className="subject-checkboxes" id="subjectCheckboxes">
                      {subjects.length === 0 ? (
                        <span style={{ fontSize: 12, color: "var(--muted)" }}>
                          Loading subjects…
                        </span>
                      ) : (
                        subjects.map((subject) => (
                          <label
                            className="subject-check-label"
                            key={subject.name}
                          >
                            <input
                              type="checkbox"
                              value={subject.name}
                              checked={Boolean(
                                quizForm.subjectSelections[subject.name],
                              )}
                              onChange={() => handleSubjectToggle(subject.name)}
                            />
                            {subject.icon || "📚"} {subject.name}
                          </label>
                        ))
                      )}
                    </div>
                    <div className="subject-rows" id="subjectRows">
                      {subjects.map((subject) => {
                        const selected = Boolean(
                          quizForm.subjectSelections[subject.name],
                        );
                        const range =
                          quizForm.subjectRanges[subject.name] || {};
                        const count = getSubjectRangeCount(subject.name);
                        return (
                          <div
                            key={subject.name}
                            id={`subjectRow_${subject.name}`}
                            className={`subject-row ${selected ? "show" : ""}`}
                            style={{ display: selected ? "flex" : "none" }}
                          >
                            <span className="subject-row-label">
                              {subject.icon || "📚"} {subject.name}
                            </span>
                            <span
                              style={{ fontSize: 12, color: "var(--muted)" }}
                            >
                              Q
                            </span>
                            <input
                              type="number"
                              id={`subj_${subject.name}_from`}
                              min="1"
                              placeholder="from"
                              value={range.from || ""}
                              onChange={handleSubjectRangeChange(
                                subject.name,
                                "from",
                              )}
                              style={{ width: 80 }}
                            />
                            <span
                              style={{ fontSize: 12, color: "var(--muted)" }}
                            >
                              to Q
                            </span>
                            <input
                              type="number"
                              id={`subj_${subject.name}_to`}
                              min="1"
                              placeholder="to"
                              value={range.to || ""}
                              onChange={handleSubjectRangeChange(
                                subject.name,
                                "to",
                              )}
                              style={{ width: 80 }}
                            />
                            <span
                              className="subject-row-count"
                              id={`subj_${subject.name}_count`}
                            >
                              {count > 0 ? `${count} MCQs` : "— MCQs"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-gray"
                    onClick={handleToggleCreateQuizForm}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="createQuizBtn"
                    className="btn btn-blue"
                  >
                    {createSubmitting ? "Creating…" : "Create Quiz"}
                  </button>
                </div>
              </form>
            </div>

            <div id="quizzesList">
              {loading ? (
                <div className="no-data">Loading…</div>
              ) : loadError ? (
                <div className="no-data" style={{ color: "var(--red)" }}>
                  Error: {loadError}
                </div>
              ) : filteredQuizzes.length === 0 ? (
                <div className="no-data">No quizzes yet. Create one above!</div>
              ) : (
                filteredQuizzes.map((quiz) => (
                  <div className="quiz-card" key={quiz.id}>
                    <div className="quiz-card-top">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="quiz-card-name">
                          {quiz.quizOrder}. {quiz.name}
                        </div>
                        <div className="quiz-card-desc">
                          {quiz.description || "No description"}
                        </div>
                        <div className="quiz-tags">{renderQuizTags(quiz)}</div>
                      </div>
                      <span
                        className={`pill ${
                          quiz.is_published ? "pill-green" : "pill-orange"
                        }`}
                      >
                        {quiz.is_published ? "✅ Published" : "⏳ Draft"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        className="btn btn-sm"
                        style={{ background: "#0284c7", color: "#fff" }}
                        type="button"
                        onClick={() => handleOpenQuizSummary(quiz)}
                      >
                        📊 Summary
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ background: "#7b1fa2", color: "#fff" }}
                        type="button"
                        onClick={() => handleOpenQuizDetails(quiz)}
                      >
                        Details
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ background: "#00897b", color: "#fff" }}
                        type="button"
                        onClick={() => handleShareQuizLink(quiz)}
                      >
                        Share
                      </button>
                      <button
                        className="btn btn-blue btn-sm"
                        type="button"
                        onClick={() => handleOpenEditQuizModal(quiz)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ background: "#5c6bc0", color: "#fff" }}
                        type="button"
                        onClick={() =>
                          alert("Export not available in this version.")
                        }
                        title="Download all questions as Word document"
                      >
                        📄 Export .docx
                      </button>
                      {quiz.is_published ? (
                        <button
                          className="btn btn-orange btn-sm"
                          type="button"
                          onClick={() => handleUnpublishQuiz(quiz)}
                        >
                          ⬇️ Unpublish
                        </button>
                      ) : (
                        <button
                          className="btn btn-green btn-sm"
                          type="button"
                          onClick={() => handlePublishQuiz(quiz)}
                        >
                          📤 Publish
                        </button>
                      )}
                      <button
                        className="btn btn-red btn-sm"
                        type="button"
                        onClick={() => handleDeleteQuiz(quiz)}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="card" style={{ marginTop: 28 }}>
              <div className="card-hdr">
                <span className="card-title">🔍 View Questions by Quiz</span>
              </div>
              <div className="card-body">
                <div className="fg">
                  <label>Select Quiz</label>
                  <select
                    id="quizForQuestions"
                    style={{ maxWidth: 400 }}
                    value={selectedQuizIdForQuestions}
                    onChange={handleQuestionsQuizChange}
                  >
                    <option value="">— Select a quiz —</option>
                    {quizzes.map((quiz) => (
                      <option key={quiz.id} value={quiz.id}>
                        {quiz.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  id="questionsListForQuiz"
                  style={{ maxHeight: 400, overflowY: "auto" }}
                >
                  {quizQuestionsLoading ? (
                    <div className="no-data">Loading…</div>
                  ) : !selectedQuizIdForQuestions ? (
                    <div className="no-data">
                      Select a quiz to view its questions
                    </div>
                  ) : (quizQuestionsMap[selectedQuizIdForQuestions] || [])
                      .length > 0 ? (
                    (quizQuestionsMap[selectedQuizIdForQuestions] || []).map(
                      (question, index) => renderQuestionCard(question, index),
                    )
                  ) : (
                    <div className="no-data">
                      No question details available for this quiz.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <div
          id="quizSummaryModal"
          className={`modal ${summaryModalOpen ? "open" : ""}`}
          onClick={handleSummaryOverlayClick}
        >
          <div className="modal-box">
            <div className="qs-header">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div>
                  <h2 id="qsSummaryTitle">{summaryState.quizName}</h2>
                  <p id="qsSummarySubtitle">{summaryState.subtitle}</p>
                </div>
                <button
                  className="modal-close"
                  onClick={closeSummaryModal}
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: 28,
                    marginTop: -4,
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            <div className="qs-stats-row">
              <div className="qs-stat">
                <div className="qs-stat-num" id="qsStatQuestions">
                  {summaryState.questionCount}
                </div>
                <div className="qs-stat-label">Questions</div>
              </div>
              <div className="qs-stat">
                <div className="qs-stat-num" id="qsStatAttempts">
                  {summaryState.attempts}
                </div>
                <div className="qs-stat-label">Attempts</div>
              </div>
              <div className="qs-stat">
                <div className="qs-stat-num" id="qsStatAvg">
                  {summaryState.avgScore}
                </div>
                <div className="qs-stat-label">Avg Score</div>
              </div>
              <div className="qs-stat">
                <div className="qs-stat-num" id="qsStatTop">
                  {summaryState.topScore}
                </div>
                <div className="qs-stat-label">Top Score</div>
              </div>
            </div>
            <div className="qs-body" id="qsSummaryBody">
              <div className="qs-no-attempts">{summaryState.bodyMessage}</div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-gray" onClick={closeSummaryModal}>
                Close
              </button>
              <button
                className="btn btn-sm"
                style={{ background: "#5c6bc0", color: "#fff" }}
                id="qsExportBtn"
                type="button"
                onClick={() => alert("Export not available in this version.")}
              >
                📄 Export .docx
              </button>
            </div>
          </div>
        </div>

        <div
          id="editQuizModal"
          className={`modal ${editModalOpen ? "open" : ""}`}
        >
          <div className="modal-box" style={{ maxWidth: 740 }}>
            <div className="modal-hdr">
              <span className="modal-title">✏️ Edit Quiz</span>
              <button className="modal-close" onClick={closeEditModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <form
                id="editQuizForm"
                onSubmit={handleSubmitEditQuiz}
                style={{ marginBottom: 24 }}
              >
                <div className="form-row">
                  <div className="fg">
                    <label>Quiz Name *</label>
                    <input
                      type="text"
                      id="editQuizName"
                      required
                      value={editQuiz.name}
                      onChange={handleEditQuizChange("name")}
                    />
                  </div>
                  <div className="fg">
                    <label>Quiz Order *</label>
                    <input
                      type="number"
                      id="editQuizOrder"
                      min="1"
                      required
                      value={editQuiz.quizOrder}
                      onChange={handleEditQuizChange("quizOrder")}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="fg">
                    <label>Type *</label>
                    <select
                      id="editQuizType"
                      required
                      value={editQuiz.quizType}
                      onChange={handleEditQuizChange("quizType")}
                    >
                      <option value="">— Select —</option>
                      <option value="Chapter-wise">Chapter-wise</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Mock">Mock Test</option>
                      <option value="Full-length">Full-length</option>
                    </select>
                  </div>
                  <div className="fg">
                    <label>Syllabus *</label>
                    <select
                      id="editQuizSyllabus"
                      required
                      value={editQuiz.quizSyllabus}
                      onChange={handleEditQuizChange("quizSyllabus")}
                    >
                      <option value="">— Select —</option>
                      <option value="Biology">Biology</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="English">English</option>
                      <option value="Logical Reasoning">
                        Logical Reasoning
                      </option>
                      <option value="Biology + Chemistry">
                        Biology + Chemistry
                      </option>
                      <option value="Physics + Chemistry">
                        Physics + Chemistry
                      </option>
                      <option value="Full Syllabus">Full Syllabus</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="fg">
                    <label>
                      Assign to Batches
                      <span
                        style={{
                          fontWeight: 400,
                          fontSize: 11,
                          color: "var(--muted)",
                          textTransform: "none",
                          letterSpacing: 0,
                        }}
                      >
                        (tick one or more — leave all unticked for all students)
                      </span>
                    </label>
                    <div
                      id="editQuizBatchCheckboxes"
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        padding: "10px 12px",
                        border: "1.5px solid #e5e7eb",
                        borderRadius: 8,
                        minHeight: 44,
                        background: "#fafafa",
                      }}
                    >
                      {batches.length === 0 ? (
                        <span style={{ color: "var(--muted)", fontSize: 13 }}>
                          Loading batches…
                        </span>
                      ) : (
                        batches.map((batch) => (
                          <label
                            key={`edit-${batch.id}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "5px 10px",
                              border: "1.5px solid var(--border)",
                              borderRadius: 7,
                              cursor: "pointer",
                              fontSize: 13,
                              background: "#fff",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <input
                              type="checkbox"
                              name="editBatch"
                              value={batch.id}
                              checked={editQuiz.batchIds.includes(
                                String(batch.id),
                              )}
                              onChange={() =>
                                handleEditBatchToggle(String(batch.id))
                              }
                            />
                            {batch.name}
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="fg">
                    <label>Description</label>
                    <input
                      type="text"
                      id="editQuizDescription"
                      placeholder="Short description"
                      value={editQuiz.description}
                      onChange={handleEditQuizChange("description")}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-gray"
                    onClick={closeEditModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-blue">
                    Update Quiz
                  </button>
                </div>
              </form>

              <div style={{ borderTop: "2px solid #f0f0f0", paddingTop: 22 }}>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    marginBottom: 14,
                  }}
                >
                  Manage Questions
                </h3>

                <div
                  style={{
                    background: "#fff8f0",
                    border: "1.5px solid #fbbf24",
                    borderRadius: 8,
                    padding: 14,
                    marginBottom: 14,
                  }}
                >
                  <h4
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      marginBottom: 10,
                      color: "#92400e",
                    }}
                  >
                    ♻️ Reuse Questions from Another Quiz
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      alignItems: "flex-end",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <label
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#6b7280",
                          display: "block",
                          marginBottom: 5,
                          textTransform: "uppercase",
                          letterSpacing: 0.4,
                        }}
                      >
                        Source Quiz
                      </label>
                      <select
                        id="copyFromQuizSelect"
                        style={{
                          width: "100%",
                          padding: 9,
                          border: "1.5px solid #e5e7eb",
                          borderRadius: 7,
                          fontFamily: "inherit",
                          fontSize: 13,
                        }}
                        value={editQuiz.copyFromQuizId}
                        onChange={(event) =>
                          setEditQuiz((prev) => ({
                            ...prev,
                            copyFromQuizId: event.target.value,
                            copyQuizMsg: "",
                          }))
                        }
                      >
                        <option value="">— Pick a quiz to copy from —</option>
                        {quizzes
                          .filter((quiz) => quiz.id !== editQuiz.id)
                          .map((quiz) => (
                            <option key={quiz.id} value={quiz.id}>
                              {quiz.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{
                        background: "#d97706",
                        color: "#fff",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                      onClick={handleCopyQuestionsFromQuiz}
                    >
                      📋 Copy All Questions
                    </button>
                  </div>
                  <div
                    id="copyQuizMsg"
                    style={{ marginTop: 8, fontSize: 12, display: "block" }}
                  >
                    {editQuiz.copyQuizMsg}
                  </div>
                </div>

                <div
                  style={{
                    background: "#f8fbff",
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 14,
                  }}
                >
                  <h4
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      marginBottom: 12,
                    }}
                  >
                    ➕ Add Question Manually
                  </h4>
                  <form
                    onSubmit={handleAddQuestionToQuiz}
                    style={{ display: "grid", gap: 10 }}
                  >
                    <textarea
                      id="editQuestionText"
                      placeholder="Question text"
                      required
                      value={editQuiz.questionForm.text}
                      onChange={handleEditQuestionFieldChange("text")}
                      style={{
                        padding: 10,
                        border: "1.5px solid #e5e7eb",
                        borderRadius: 8,
                        minHeight: 60,
                        fontFamily: "inherit",
                        resize: "vertical",
                      }}
                    />

                    <div
                      style={{
                        border: "1.5px dashed #bfdbfe",
                        borderRadius: 8,
                        padding: 12,
                        background: "#f0f7ff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <label
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#1d4ed8",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            background: "#dbeafe",
                            border: "1px solid #93c5fd",
                            borderRadius: 6,
                            padding: "6px 12px",
                          }}
                        >
                          🖼️ Attach Image (optional)
                          <input
                            type="file"
                            id="editQuestionImage"
                            ref={editQuestionImageRef}
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handlePreviewQuestionImage}
                          />
                        </label>
                        <span
                          id="editImageStatus"
                          style={{ fontSize: 11, color: "#6b7280" }}
                        >
                          {editQuiz.questionForm.imageStatus}
                        </span>
                        <button
                          type="button"
                          id="editImageClearBtn"
                          onClick={handleClearQuestionImage}
                          style={{
                            display: editQuiz.questionForm.imagePreview
                              ? "inline"
                              : "none",
                            fontSize: 11,
                            color: "#dc2626",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          ✕ Remove
                        </button>
                      </div>
                      <div
                        id="editImagePreview"
                        style={{
                          display: editQuiz.questionForm.imagePreview
                            ? "block"
                            : "none",
                          marginTop: 10,
                        }}
                      >
                        <img
                          id="editImagePreviewImg"
                          src={editQuiz.questionForm.imagePreview}
                          alt="preview"
                          style={{
                            maxWidth: "100%",
                            maxHeight: 160,
                            borderRadius: 6,
                            border: "1px solid #bfdbfe",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    </div>
                    <input
                      type="hidden"
                      id="editQuestionImageUrl"
                      value={editQuiz.questionForm.imagePreview || ""}
                    />

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                      }}
                    >
                      <input
                        type="text"
                        id="editOptionA"
                        placeholder="Option A"
                        required
                        value={editQuiz.questionForm.optionA}
                        onChange={handleEditQuestionFieldChange("optionA")}
                        style={{
                          padding: 8,
                          border: "1.5px solid #e5e7eb",
                          borderRadius: 7,
                          fontFamily: "inherit",
                        }}
                      />
                      <input
                        type="text"
                        id="editOptionB"
                        placeholder="Option B"
                        required
                        value={editQuiz.questionForm.optionB}
                        onChange={handleEditQuestionFieldChange("optionB")}
                        style={{
                          padding: 8,
                          border: "1.5px solid #e5e7eb",
                          borderRadius: 7,
                          fontFamily: "inherit",
                        }}
                      />
                      <input
                        type="text"
                        id="editOptionC"
                        placeholder="Option C"
                        required
                        value={editQuiz.questionForm.optionC}
                        onChange={handleEditQuestionFieldChange("optionC")}
                        style={{
                          padding: 8,
                          border: "1.5px solid #e5e7eb",
                          borderRadius: 7,
                          fontFamily: "inherit",
                        }}
                      />
                      <input
                        type="text"
                        id="editOptionD"
                        placeholder="Option D"
                        required
                        value={editQuiz.questionForm.optionD}
                        onChange={handleEditQuestionFieldChange("optionD")}
                        style={{
                          padding: 8,
                          border: "1.5px solid #e5e7eb",
                          borderRadius: 7,
                          fontFamily: "inherit",
                        }}
                      />
                    </div>
                    <div
                      style={{ display: "flex", gap: 10, alignItems: "center" }}
                    >
                      <select
                        id="editCorrectAnswer"
                        required
                        value={editQuiz.questionForm.correctAnswer}
                        onChange={handleEditQuestionFieldChange(
                          "correctAnswer",
                        )}
                        style={{
                          flex: 1,
                          padding: 8,
                          border: "1.5px solid #e5e7eb",
                          borderRadius: 7,
                          fontFamily: "inherit",
                        }}
                      >
                        <option value="">Correct answer…</option>
                        <option value="a">A</option>
                        <option value="b">B</option>
                        <option value="c">C</option>
                        <option value="d">D</option>
                      </select>
                      <textarea
                        id="editExplanation"
                        placeholder="Explanation (optional)"
                        value={editQuiz.questionForm.explanation}
                        onChange={handleEditQuestionFieldChange("explanation")}
                        style={{
                          flex: 2,
                          padding: 8,
                          border: "1.5px solid #e5e7eb",
                          borderRadius: 7,
                          fontFamily: "inherit",
                          resize: "vertical",
                          minHeight: 38,
                        }}
                      />
                      <button className="btn btn-green btn-sm" type="submit">
                        Add
                      </button>
                    </div>
                  </form>
                </div>
                <div
                  id="editQuizQuestionsList"
                  style={{ maxHeight: 360, overflowY: "auto" }}
                >
                  {editQuiz.questions.length === 0 ? (
                    <div className="no-data">
                      No questions yet. Add one above.
                    </div>
                  ) : (
                    editQuiz.questions.map((question, index) => (
                      <div
                        key={question.id}
                        style={{
                          background: "#fff",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          padding: 12,
                          marginBottom: 8,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 10,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "var(--text)",
                            }}
                          >
                            Q{index + 1}: {question.question.substring(0, 80)}
                            {question.question.length > 80 ? "…" : ""}
                            {question.img ? (
                              <span
                                style={{
                                  marginLeft: 6,
                                  background: "#dbeafe",
                                  color: "#1d4ed8",
                                  fontSize: 10,
                                  padding: "2px 7px",
                                  borderRadius: 20,
                                  fontWeight: 700,
                                }}
                              >
                                🖼️ image
                              </span>
                            ) : null}
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 3,
                              fontSize: 11,
                              color: "var(--muted)",
                              marginTop: 6,
                            }}
                          >
                            <div>A: {question.option_a.substring(0, 30)}</div>
                            <div>B: {question.option_b.substring(0, 30)}</div>
                            <div>C: {question.option_c.substring(0, 30)}</div>
                            <div>D: {question.option_d.substring(0, 30)}</div>
                          </div>
                          <div
                            style={{
                              marginTop: 5,
                              fontSize: 12,
                              color: "var(--green)",
                              fontWeight: 700,
                            }}
                          >
                            ✓ Answer:{" "}
                            {String(question.correct_answer).toUpperCase()}
                          </div>
                        </div>
                        <button
                          className="btn btn-red btn-xs"
                          type="button"
                          onClick={() =>
                            handleDeleteQuestionFromModal(question.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          id="quizDetailsModal"
          className={`modal ${detailsModalOpen ? "open" : ""}`}
          onClick={handleDetailsOverlayClick}
        >
          <div className="modal-box">
            <div className="modal-hdr">
              <span className="modal-title">Quiz Details</span>
              <button className="modal-close" onClick={closeDetailsModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div id="quizDetailsContent">
                {detailsQuiz ? (
                  <>
                    <div
                      style={{
                        background: "#f5f5f5",
                        padding: 16,
                        borderRadius: 8,
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: "var(--text)",
                          marginBottom: 12,
                        }}
                      >
                        {detailsQuiz.name}
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill,minmax(160px,1fr))",
                          gap: 12,
                          fontSize: 13,
                        }}
                      >
                        <div>
                          <div className="stat-label">Type</div>
                          <strong>{detailsQuiz.type || "N/A"}</strong>
                        </div>
                        <div>
                          <div className="stat-label">Syllabus</div>
                          <strong>{detailsQuiz.syllabus || "N/A"}</strong>
                        </div>
                        <div>
                          <div className="stat-label">Questions</div>
                          <strong style={{ color: "var(--green)" }}>
                            {detailsQuiz.totalQuestions || 0}
                          </strong>
                        </div>
                        <div>
                          <div className="stat-label">Batch</div>
                          <strong>
                            {detailsQuiz.batchIds?.length
                              ? batchMap[detailsQuiz.batchIds[0]] || "Assigned"
                              : "All Batches"}
                          </strong>
                        </div>
                        <div>
                          <div className="stat-label">Status</div>
                          <span
                            className={`pill ${
                              detailsQuiz.is_published
                                ? "pill-green"
                                : "pill-orange"
                            }`}
                          >
                            {detailsQuiz.is_published ? "Published" : "Draft"}
                          </span>
                        </div>
                        <div>
                          <div className="stat-label">Order</div>
                          <strong>#{detailsQuiz.quizOrder}</strong>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        background: "#fff3e0",
                        borderLeft: "4px solid var(--orange)",
                        padding: 12,
                        borderRadius: 6,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#e65100",
                          marginBottom: 6,
                        }}
                      >
                        Share Link
                      </div>
                      <div
                        style={{
                          fontFamily: "monospace",
                          fontSize: 11,
                          wordBreak: "break-all",
                          color: "#333",
                          background: "#fff",
                          padding: 8,
                          borderRadius: 4,
                        }}
                      >
                        {`${window.location.origin}/quiz-details.html?quiz_id=${detailsQuiz.id}`}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="no-data">No quiz selected.</div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-gray" onClick={closeDetailsModal}>
                Close
              </button>
              <button className="btn btn-teal" onClick={handleCopyShareLink}>
                📋 Copy Share Link
              </button>
            </div>
          </div>
        </div>

        <div
          id="shareModal"
          className={`modal ${shareModalOpen ? "open" : ""}`}
          onClick={handleShareOverlayClick}
        >
          <div className="modal-box" style={{ maxWidth: 480 }}>
            <div className="modal-hdr">
              <span className="modal-title">Share Quiz Link</span>
              <button className="modal-close" onClick={closeShareModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                  marginBottom: 12,
                }}
              >
                Share this link with students:
              </p>
              <input
                type="text"
                id="quizShareLink"
                readOnly
                value={shareLink}
                style={{
                  width: "100%",
                  padding: 12,
                  border: "2px solid var(--blue)",
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: "monospace",
                  marginBottom: 12,
                }}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="btn btn-teal"
                  style={{ flex: 1 }}
                  onClick={handleCopyShareLink}
                >
                  📋 Copy
                </button>
                <button
                  className="btn btn-gray"
                  style={{ flex: 1 }}
                  onClick={closeShareModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminQuizzes;
