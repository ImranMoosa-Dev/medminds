async function loadAllQuizzes() {
  try {
    const { data: quizzes, error } = await supabaseClient
      .from("quizzes")
      .select("*")
      .order("quiz_order", { ascending: true });

    if (error) throw error;

    const quizzesList = document.getElementById("quizzesList");

    if (!quizzes || quizzes.length === 0) {
      quizzesList.innerHTML =
        '<div style="text-align: center; color: #999; padding: 30px;">No quizzes created yet. Create one above!</div>';
      return;
    }

    let html = "";
    for (const quiz of quizzes) {
      const { count: questionCount } = await supabaseClient
        .from("questions")
        .select("id", { count: "exact" })
        .eq("quiz_id", quiz.id);

      const isPublished = quiz.is_published;
      const publishedBadge = isPublished
        ? '<span style="color: #2e7d32; font-weight: 600;">Published</span>'
        : '<span style="color: #f57c00; font-weight: 600;">Draft</span>';

      html +=
        '<div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #0b63b7;"><div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;"><div><h4 style="margin: 0; color: #333; font-size: 14px;">' +
        quiz.quiz_order +
        ". " +
        quiz.name +
        '</h4><p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">' +
        (quiz.description || "No description") +
        '</p><div style="margin-top: 8px; font-size: 12px; color: #999;">' +
        (questionCount || 0) +
        ' questions</div></div><div style="text-align: right;">' +
        publishedBadge +
        '</div></div><div style="display: flex; gap: 8px; flex-wrap: wrap;"><button onclick="openEditQuizModal(' +
        quiz.id +
        ')" style="padding: 6px 12px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">Edit</button>';

      if (!isPublished) {
        html +=
          '<button onclick="publishQuiz(' +
          quiz.id +
          ", " +
          JSON.stringify(quiz.name) +
          ')" style="padding: 6px 12px; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">Publish</button>';
      } else {
        html +=
          '<button onclick="unpublishQuiz(' +
          quiz.id +
          ')" style="padding: 6px 12px; background: #f57c00; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">Unpublish</button>';
      }

      html +=
        '<button onclick="deleteQuiz(' +
        quiz.id +
        ", " +
        JSON.stringify(quiz.name) +
        ')" style="padding: 6px 12px; background: #c62828; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">Delete</button></div></div>';
    }

    quizzesList.innerHTML = html;
  } catch (error) {
    console.error("Error loading quizzes:", error);
    document.getElementById("quizzesList").innerHTML =
      '<div style="color: #c62828;">Error loading quizzes: ' +
      error.message +
      "</div>";
  }
}
