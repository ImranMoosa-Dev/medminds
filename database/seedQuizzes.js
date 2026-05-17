import db from "../config/MedMindsDB.js";

const seedQuizzes = async () => {
  try {
    console.log("🌱 Seeding quizzes...");

    // =========================
    // Load subjects + topics
    // =========================
    const [subjects] = await db.execute(`SELECT * FROM subjects`);
    const [topics] = await db.execute(`SELECT * FROM topics`);

    const getSubjectId = (name, standard) => {
      const s = subjects.find(
        (x) =>
          x.name.trim().toLowerCase() === name.trim().toLowerCase() &&
          x.standard.trim().toLowerCase() === standard.trim().toLowerCase(),
      );
      return s ? s.id : null;
    };

    const getTopicId = (name, subjectId) => {
      const t = topics.find(
        (x) =>
          x.name.trim().toLowerCase() === name.trim().toLowerCase() &&
          x.subject_id === subjectId,
      );
      return t ? t.id : null;
    };

    // =========================
    // Resolve IDs
    // =========================
    const bioFsc1 = getSubjectId("Biology", "FSC Part 1");
    const chemFsc1 = getSubjectId("Chemistry", "FSC Part 1");
    const phyFsc1 = getSubjectId("Physics", "FSC Part 1");

    const cellTopic = getTopicId("Cell Structure", bioFsc1);
    const atomicTopic = getTopicId("Atomic Structure", chemFsc1);
    const motionTopic = getTopicId("Motion and Force", phyFsc1);

    // =========================
    // Dummy quizzes
    // =========================
    const quizzes = [
      {
        name: "Biology - Cell Structure Quiz",
        description: "Basic concepts of cell structure and organelles.",
        subject_id: bioFsc1,
        topic_id: cellTopic,
        testType: "Chapter Test",
        duration: 20,
        totalMcqs: 10,
        passing_marks: 6,
        quiz_order: 1,
        is_published: true,
      },
      {
        name: "Chemistry - Atomic Structure Quiz",
        description: "Atoms, isotopes, and subatomic particles.",
        subject_id: chemFsc1,
        topic_id: atomicTopic,
        testType: "Practice Test",
        duration: 25,
        totalMcqs: 15,
        passing_marks: 9,
        quiz_order: 2,
        is_published: true,
      },
      {
        name: "Physics - Motion & Force Quiz",
        description: "Newton laws and basic motion concepts.",
        subject_id: phyFsc1,
        topic_id: motionTopic,
        testType: "Mock Test",
        duration: 30,
        totalMcqs: 20,
        passing_marks: 12,
        quiz_order: 3,
        is_published: false,
      },
      {
        name: "Biology - Full Revision Test",
        description: "Complete FSC Part 1 biology revision.",
        subject_id: bioFsc1,
        topic_id: null,
        testType: "Grand Test",
        duration: 60,
        totalMcqs: 40,
        passing_marks: 25,
        quiz_order: 4,
        is_published: false,
      },
    ];

    // =========================
    // Insert quizzes
    // =========================
    for (const q of quizzes) {
      if (!q.subject_id) {
        console.log("❌ Skipping quiz due to missing subject:", q.name);
        continue;
      }

      await db.execute(
        `
        INSERT INTO quizzes (
          name,
          description,
          subject_id,
          topic_id,
          testType,
          duration,
          totalMcqs,
          passing_marks,
          quiz_order,
          is_published
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          q.name,
          q.description,
          q.subject_id,
          q.topic_id,
          q.testType,
          q.duration,
          q.totalMcqs,
          q.passing_marks,
          q.quiz_order,
          q.is_published,
        ],
      );
    }

    console.log("✅ Quizzes seeded successfully");
  } catch (err) {
    console.error("❌ Error seeding quizzes:", err.message);
  }
};

export default seedQuizzes;
