import db from "../config/MedMindsDB.js";

const seedTopics = async () => {
  try {
    console.log("🌱 Seeding topics...");

    const [subjects] = await db.execute(`SELECT * FROM subjects`);

    const getSubjectId = (name, standard) => {
      const subject = subjects.find(
        (s) =>
          s.name.trim() === name.trim() &&
          s.standard.trim() === standard.trim(),
      );
      return subject ? Number(subject.id) : null;
    };

    const topics = [
      [
        getSubjectId("Biology", "FSC Part 1"),
        "Biology",
        "Introduction to Biology",
      ],
      [getSubjectId("Biology", "FSC Part 1"), "Biology", "Cell Structure"],

      [
        getSubjectId("Chemistry", "FSC Part 1"),
        "Chemistry",
        "Basic Concepts of Chemistry",
      ],
      [
        getSubjectId("Chemistry", "FSC Part 1"),
        "Chemistry",
        "Atomic Structure",
      ],

      [
        getSubjectId("Physics", "FSC Part 1"),
        "Physics",
        "Physical Quantities and Measurement",
      ],
      [getSubjectId("Physics", "FSC Part 1"), "Physics", "Motion and Force"],

      [getSubjectId("Biology", "FSC Part 2"), "Biology", "Genetics"],
      [getSubjectId("Biology", "FSC Part 2"), "Biology", "Evolution"],
    ];

    for (const t of topics) {
      const [subject_id, subject_name, name] = t;

      if (!subject_id) {
        console.log("❌ Skipping topic due to missing subject:", name);
        continue;
      }

      await db.execute(
        `INSERT INTO topics (subject_id, subject_name, name) VALUES (?, ?, ?)`,
        [subject_id, subject_name, name],
      );
    }

    console.log("✅ Topics seeded successfully");
  } catch (err) {
    console.error("❌ Error seeding topics:", err.message);
  }
};

export default seedTopics;
