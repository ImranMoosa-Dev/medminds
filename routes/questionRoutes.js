import { Router } from "express";

const questionRoutes = Router();
// Add question
questionRoutes.post(
  "/add-question",
  upload.single("image"),
  async (req, res) => {
    console.log("Session user:", req.session.user);
    if (
      req.session.user === "biologia.info1@gmail.com" ||
      req.session.user === "admin@medminds.com"
    ) {
      let {
        id,
        subject,
        otherSubject,
        chapter,
        question,
        opt1,
        opt2,
        opt3,
        opt4,
        correct,
        explanation,
        quiz_only,
      } = req.body;

      explanation = explanation || "";

      if (
        !subject ||
        !chapter ||
        !question ||
        !opt1 ||
        !opt2 ||
        !opt3 ||
        !opt4 ||
        !correct
      ) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required" });
      }

      if (
        isNaN(parseInt(correct)) ||
        parseInt(correct) < 1 ||
        parseInt(correct) > 4
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Correct option must be 1-4" });
      }

      if (subject === "Other") {
        subject = otherSubject;
      }

      const image = req.file ? req.file.filename : null;

      try {
        if (id) {
          // UPDATE QUESTION (do NOT delete image if no new one uploaded)
          const isQuizOnly = quiz_only === "true" || quiz_only === true;
          if (image) {
            await db.execute(
              "UPDATE questions SET subject = ?, chapter = ?, question = ?, opt1 = ?, opt2 = ?, opt3 = ?, opt4 = ?, correct = ?, image = ?, explanation = ?, quiz_only = ? WHERE id = ?",
              [
                subject,
                chapter,
                question,
                opt1,
                opt2,
                opt3,
                opt4,
                parseInt(correct) - 1,
                image,
                explanation,
                isQuizOnly,
                id,
              ],
            );
          } else {
            await db.execute(
              "UPDATE questions SET subject = ?, chapter = ?, question = ?, opt1 = ?, opt2 = ?, opt3 = ?, opt4 = ?, correct = ?, explanation = ?, quiz_only = ? WHERE id = ?",
              [
                subject,
                chapter,
                question,
                opt1,
                opt2,
                opt3,
                opt4,
                parseInt(correct) - 1,
                explanation,
                isQuizOnly,
                id,
              ],
            );
          }

          res.json({ success: true, message: "Question updated successfully" });
        } else {
          // INSERT NEW QUESTION (AUTO-PUBLISH)
          const isQuizOnly = quiz_only === "true" || quiz_only === true;
          const [result] = await db.execute(
            "INSERT INTO questions (subject, chapter, question, opt1, opt2, opt3, opt4, correct, image, explanation, published, quiz_only) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              subject,
              chapter,
              question,
              opt1,
              opt2,
              opt3,
              opt4,
              parseInt(correct) - 1,
              image,
              explanation,
              true,
              isQuizOnly,
            ],
          );

          res.json({
            success: true,
            message: "Question added successfully",
            id: result.insertId,
          });
        }
      } catch (err) {
        console.error("Error saving question:", err);
        res.status(500).json({ success: false, message: err.message });
      }
    } else {
      res.status(403).json({ success: false, message: "Unauthorized" });
    }
  },
);

// delete question
app.post("/delete-question", async (req, res) => {
  if (
    req.session.user === "biologia.info1@gmail.com" ||
    req.session.user === "admin@medminds.com"
  ) {
    const { id } = req.body;
    try {
      await db.execute("DELETE FROM questions WHERE id = ?", [id]);
      res.redirect("/admin-questions.html");
    } catch (err) {
      res.status(500).send("Error deleting question");
    }
  } else {
    res.redirect("/dashboard.html");
  }
});
// publish questions
questionRoutes.post("/publish-question", async (req, res) => {
  if (
    req.session.user === "biologia.info1@gmail.com" ||
    req.session.user === "admin@medminds.com"
  ) {
    const { id } = req.body;
    try {
      await db.execute("UPDATE questions SET published = ? WHERE id = ?", [
        true,
        id,
      ]);
      res.redirect("/admin-questions.html");
    } catch (err) {
      res.status(500).send("Error publishing question");
    }
  } else {
    res.redirect("/dashboard.html");
  }
});

// unpublish questions

questionRoutes.post("/unpublish-question", async (req, res) => {
  if (
    req.session.user === "biologia.info1@gmail.com" ||
    req.session.user === "admin@medminds.com"
  ) {
    const { id } = req.body;
    try {
      await db.execute("UPDATE questions SET published = ? WHERE id = ?", [
        false,
        id,
      ]);
      res.redirect("/admin-questions.html");
    } catch (err) {
      res.status(500).send("Error unpublishing question");
    }
  } else {
    res.redirect("/dashboard.html");
  }
});
// questions from subject
questionRoutes.get("/api/questions/:subject", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }
  try {
    const [questions] = await db.execute(
      "SELECT id, question FROM questions WHERE subject = ? AND published = 1 AND (quiz_only IS NULL OR quiz_only = 0) ORDER BY id DESC",
      [req.params.subject],
    );
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Error fetching questions" });
  }
});
export default questionRoutes;
