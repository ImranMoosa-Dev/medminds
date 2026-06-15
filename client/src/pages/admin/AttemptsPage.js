import React, { useEffect, useMemo, useState } from "react";

const AttemptsPage = () => {
  const [attempts, setAttempts] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [filterQuiz, setFilterQuiz] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAllAttempts();
  }, []);

  const loadAllAttempts = async () => {
    setLoading(true);
    setError("");
    try {
      const [
        { data: attemptsData, error: attemptsError },
        { data: quizzesData, error: quizzesError },
        { data: usersData, error: usersError },
      ] = await Promise.all([
        window.supabaseClient
          .from("quiz_attempts")
          .select("*")
          .order("created_at", { ascending: false }),
        window.supabaseClient
          .from("quizzes")
          .select("id,name")
          .order("quiz_order", { ascending: true }),
        window.supabaseClient
          .from("users")
          .select("id,first_name,last_name,district"),
      ]);
      if (attemptsError) throw attemptsError;
      if (quizzesError) throw quizzesError;
      if (usersError) throw usersError;
      setAttempts(attemptsData || []);
      setQuizzes(quizzesData || []);
      setUserMap(
        (usersData || []).reduce((acc, user) => {
          acc[user.id] = {
            name:
              `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
              "Unknown",
            district: user.district || "N/A",
          };
          return acc;
        }, {}),
      );
    } catch (err) {
      setError(err.message || "Failed to load attempts.");
    } finally {
      setLoading(false);
    }
  };

  const togglePublishStatus = async (attempt) => {
    const newStatus = !attempt.is_published;
    if (!window.confirm(`${newStatus ? "Publish" : "Unpublish"} this result?`))
      return;
    try {
      const { error } = await window.supabaseClient
        .from("quiz_attempts")
        .update({ is_published: newStatus })
        .eq("id", attempt.id);
      if (error) throw error;
      await loadAllAttempts();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const filteredAttempts = useMemo(() => {
    return attempts.filter((attempt) => {
      const matchesQuiz = filterQuiz
        ? String(attempt.quiz_id) === filterQuiz
        : true;
      const matchesStatus =
        filterStatus === ""
          ? true
          : filterStatus === "published"
            ? attempt.is_published
            : !attempt.is_published;
      return matchesQuiz && matchesStatus;
    });
  }, [attempts, filterQuiz, filterStatus]);

  return (
    <div className="tab-panel active">
      <div className="sec-hdr">
        <h2 className="sec-title">📋 Results</h2>
        <button className="btn btn-blue" onClick={loadAllAttempts}>
          Refresh
        </button>
      </div>

      <div className="form-row" style={{ marginBottom: 20, gap: 12 }}>
        <div className="fg" style={{ flex: 1 }}>
          <label>Filter by quiz</label>
          <select
            value={filterQuiz}
            onChange={(e) => setFilterQuiz(e.target.value)}
          >
            <option value="">All Quizzes</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.name}
              </option>
            ))}
          </select>
        </div>
        <div className="fg" style={{ flex: 1 }}>
          <label>Publication status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="no-data">Loading attempts…</div>
      ) : filteredAttempts.length === 0 ? (
        <div className="no-data">No attempts found.</div>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>Name</th>
              <th>Quiz</th>
              <th>District</th>
              <th>Score</th>
              <th>%</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttempts.map((attempt) => {
              const quizName =
                quizzes.find((q) => q.id === attempt.quiz_id)?.name ||
                "Unknown";
              const pct = attempt.total
                ? Math.round((attempt.score / attempt.total) * 100)
                : 0;
              const user = attempt.user_id ? userMap[attempt.user_id] : null;
              const name = user?.name || "Unknown";
              return (
                <tr key={attempt.id}>
                  <td>{name}</td>
                  <td style={{ color: "var(--blue)", fontWeight: 600 }}>
                    {quizName}
                  </td>
                  <td>{user?.district || "N/A"}</td>
                  <td>
                    {attempt.score}/{attempt.total}
                  </td>
                  <td>{pct}%</td>
                  <td>
                    <button
                      className={`pub-btn ${attempt.is_published ? "pub-yes" : "pub-no"}`}
                      onClick={() => togglePublishStatus(attempt)}
                    >
                      {attempt.is_published ? "Published" : "Publish"}
                    </button>
                  </td>
                  <td>{new Date(attempt.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-gray btn-sm"
                      onClick={() =>
                        alert("See attempt details in the legacy admin view.")
                      }
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AttemptsPage;
