// seedQuestions.js
import db from "../config/MedMindsDB.js";

const seedQuestions = async () => {
  try {
    console.log("🌱 Seeding questions...");

    // =========================
    // Load data from DB
    // =========================
    const [subjects] = await db.execute(
      "SELECT id, name, standard FROM subjects",
    );
    const [topics] = await db.execute(
      "SELECT id, name, subject_id FROM topics",
    );
    const [subtopics] = await db.execute(
      "SELECT id, name, topic_id FROM subtopics",
    );
    const [quizzes] = await db.execute(
      "SELECT id, name, subject_id, topic_id FROM quizzes",
    );

    // =========================
    // Helper Functions
    // =========================
    const getSubjectId = (name, standard) => {
      const subject = subjects.find(
        (s) =>
          s.name.trim().toLowerCase() === name.trim().toLowerCase() &&
          s.standard.trim().toLowerCase() === standard.trim().toLowerCase(),
      );
      return subject ? subject.id : null;
    };

    const getTopicId = (name, subjectId) => {
      const topic = topics.find(
        (t) =>
          t.name.trim().toLowerCase() === name.trim().toLowerCase() &&
          t.subject_id === subjectId,
      );
      return topic ? topic.id : null;
    };

    const getSubtopicId = (name, topicId) => {
      const subtopic = subtopics.find(
        (s) =>
          s.name.trim().toLowerCase() === name.trim().toLowerCase() &&
          s.topic_id === topicId,
      );
      return subtopic ? subtopic.id : null;
    };

    const getQuizId = (subjectId, topicId) => {
      const quiz = quizzes.find(
        (q) => q.subject_id === subjectId && q.topic_id === topicId,
      );
      return quiz ? quiz.id : null;
    };

    // =========================
    // Resolve IDs
    // =========================
    const biologyId = getSubjectId("Biology", "FSC Part 1");
    const chemistryId = getSubjectId("Chemistry", "FSC Part 1");
    const physicsId = getSubjectId("Physics", "FSC Part 1");

    const introBioTopicId = getTopicId("Introduction to Biology", biologyId);
    const atomicStructureTopicId = getTopicId("Atomic Structure", chemistryId);
    const motionTopicId = getTopicId("Motion and Force", physicsId);

    const branchesSubtopicId = getSubtopicId(
      "Branches of Biology",
      introBioTopicId,
    );
    const isotopesSubtopicId = getSubtopicId(
      "Isotopes and Ions",
      atomicStructureTopicId,
    );
    const newtonSubtopicId = getSubtopicId("Newton’s Laws", motionTopicId);

    // =========================
    // Debug IDs
    // =========================
    console.log({
      biologyId,
      chemistryId,
      physicsId,
      introBioTopicId,
      atomicStructureTopicId,
      motionTopicId,
      branchesSubtopicId,
      isotopesSubtopicId,
      newtonSubtopicId,
    });

    // =========================
    // Questions Data
    // =========================
    const questions = [
      {
        subject_id: biologyId,
        topic_id: introBioTopicId,
        subtopic_id: branchesSubtopicId,
        quiz_id: getQuizId(biologyId, introBioTopicId),
        question: "Botany is the branch of biology that deals with:",
        opt1: "Animals",
        opt2: "Plants",
        opt3: "Microorganisms",
        opt4: "Human body",
        correct: 2,
        explanation: "Botany is the study of plants.",
      },
      {
        subject_id: chemistryId,
        topic_id: atomicStructureTopicId,
        subtopic_id: isotopesSubtopicId,
        quiz_id: getQuizId(chemistryId, atomicStructureTopicId),
        question:
          "Atoms of the same element having different mass numbers are called:",
        opt1: "Ions",
        opt2: "Compounds",
        opt3: "Isotopes",
        opt4: "Molecules",
        correct: 3,
        explanation:
          "Isotopes have the same atomic number but different mass numbers.",
      },
      {
        subject_id: physicsId,
        topic_id: motionTopicId,
        subtopic_id: newtonSubtopicId,
        quiz_id: getQuizId(physicsId, motionTopicId),
        question: "Newton's First Law is also known as:",
        opt1: "Law of Gravitation",
        opt2: "Law of Inertia",
        opt3: "Law of Acceleration",
        opt4: "Law of Momentum",
        correct: 2,
        explanation: "Newton's First Law is called the Law of Inertia.",
      },
    ];

    // =========================
    // Insert Questions
    // =========================
    for (const q of questions) {
      if (!q.subject_id || !q.topic_id) {
        console.log(
          "❌ Skipping question due to missing subject/topic:",
          q.question,
        );
        continue;
      }

      if (!q.quiz_id) {
        console.log(
          "❌ Skipping question due to missing quiz match:",
          q.question,
        );
        continue;
      }

      await db.execute(
        `
        INSERT INTO questions (
          quiz_id,
          subject_id,
          topic_id,
          subtopic_id,
          question,
          opt1,
          opt2,
          opt3,
          opt4,
          correct,
          explanation,
          image,
          is_published
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          q.quiz_id,
          q.subject_id,
          q.topic_id,
          q.subtopic_id || null,
          q.question,
          q.opt1,
          q.opt2,
          q.opt3,
          q.opt4,
          q.correct,
          q.explanation,
          null,
          true,
        ],
      );
    }

    console.log("✅ Questions seeded successfully.");
  } catch (error) {
    console.error("❌ Error seeding questions:", error.message);
  }
};

export default seedQuestions;
