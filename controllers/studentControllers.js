export const submitQuizController = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/dashboard.html");
  }
  const { quizId, timeTaken, ...answers } = req.body;
  const [quizDef] = await db.execute(
    "SELECT * FROM quiz_definitions WHERE id = ?",
    [quizId],
  );
  if (quizDef.length === 0) {
    return res.redirect("/quiz.html");
  }
  const questionIds = JSON.parse(quizDef[0].questions);
  const placeholders = questionIds.map(() => "?").join(",");
  const [questions] = await db.execute(
    `SELECT * FROM questions WHERE id IN (${placeholders})`,
    questionIds,
  );
  // Check if all questions are answered
  if (Object.keys(answers).length !== questions.length) {
    return res.send(
      '<h1>Please answer all questions before submitting.</h1><a href="/quiz/' +
        quizId +
        '">Go back to quiz</a>',
    );
  }
  const results = {};
  questions.forEach((q, index) => {
    const answer = answers[`q${index}`];
    if (!results[q.subject]) results[q.subject] = { correct: 0, total: 0 };
    results[q.subject].total++;
    if (parseInt(answer) === q.correct + 1) {
      // Convert DB 0-based to 1-based
      results[q.subject].correct++;
    }
  });
  let wrongQuestions = [];
  questions.forEach((q, index) => {
    const answer = answers[`q${index}`];
    const userAns = answer ? parseInt(answer) : null;
    const correctAns = q.correct + 1; // Convert to 1-based
    if (userAns !== correctAns) {
      wrongQuestions.push({
        question: q.question,
        options: [q.opt1, q.opt2, q.opt3, q.opt4],
        correct: correctAns,
        userAnswer: userAns,
      });
    }
  });
  results.timeTaken = parseInt(timeTaken) || 0;
  req.session.wrongQuestions = wrongQuestions;
  // Insert wrong questions into mistakes table
  for (const wq of wrongQuestions) {
    await db.execute(
      "INSERT INTO mistakes (email, question, options, correct, userAnswer) VALUES (?, ?, ?, ?, ?)",
      [
        req.session.user,
        wq.question,
        JSON.stringify(wq.options),
        wq.correct,
        wq.userAnswer,
      ],
    );
  }
  await db.execute(
    "INSERT INTO quizzes (email, date, results, quiz_id) VALUES (?, ?, ?, ?)",
    [req.session.user, new Date(), JSON.stringify(results), quizId],
  );

  // Send notification to admin
  const totalCorrect = Object.values(results).reduce(
    (sum, subj) => sum + (subj.correct || 0),
    0,
  );
  const totalQuestions = Object.values(results).reduce(
    (sum, subj) => sum + (subj.total || 0),
    0,
  );
  const score =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Simulate email to admin
  console.log(`Quiz completed notification:`);
  console.log(`Student: ${req.session.user}`);
  console.log(`Quiz ID: ${quizId}`);
  console.log(`Score: ${totalCorrect}/${totalQuestions} (${score}%)`);
  console.log(`Time taken: ${results.timeTaken || 0} seconds`);
  console.log(`Date: ${new Date().toISOString()}`);

  res.redirect("/statics.html");
};
